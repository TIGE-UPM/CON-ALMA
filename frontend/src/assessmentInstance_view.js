import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from  'xlsx';
import {saveAs} from 'file-saver';

function DetalleAssessmentInstance() {
	const [assessmentInstance, setAssessmentInstance] = useState(null);
	const navigate = useNavigate();
	const { assessmentInstanceId } = useParams();
	const token = localStorage.getItem("token");

	const fetchAssessmentInstance = useCallback(async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/assessment-instance/${assessmentInstanceId}/token=${token}`
			);
			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			const data = await response.json();
			console.log(data);
			setAssessmentInstance(data);
		} catch (error) {
			console.error("Fetch error:", error);
			navigate("/error");
		}
	}, [assessmentInstanceId, token]);

	useEffect(() => {
		fetchAssessmentInstance();
	}, [fetchAssessmentInstance]);

	function transformJson(originalJson) {
		return {
			title: originalJson.title,
			active: originalJson.active,
			finished: originalJson.finished,
			users: originalJson.users.map((user) => ({
				name: user.name,
				email: user.email,
				order: user.order,
				group: user.group,
				pin: user.pin,
				voteEveryone: user.voteEveryone,
			})),
		};
	}

	const handleExport = () => {
		const simplifiedJson = transformJson(assessmentInstance);
		// Convertir los datos JSON a una cadena de texto
		const jsonString = JSON.stringify(simplifiedJson);
		// Crear un Blob con los datos JSON
		const blob = new Blob([jsonString], { type: "application/json" });
		// Crear un enlace para descargar el Blob
		const url = URL.createObjectURL(blob);
		// Crear un enlace temporal y forzar la descarga
		const link = document.createElement("a");
		link.href = url;
		link.download = `${assessmentInstance.title}.lgqz`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	// handle export answers: return an xlsx file with the answers of the users in the assessment instance: column 1 is grading user name, column 2 is graded user name, column 3 is answer1 (with question.title as name), column 4 is answer2, etc.
	const handleExportAnswers = async () => {
		try {
			const questionTitles = assessmentInstance.assessment.questions.map(q => q.title);

			// Crear las columnas iniciales: Evaluador, Evaluado, ...Preguntas
			const columns = ['Nombre de Evaluador', 'Nombre de Evaluado', ...questionTitles];

			 // Agrupar las respuestas por evaluador y evaluado
			const groupedAnswers = {};

			assessmentInstance.answers.forEach(answer => {
				const evaluatorId = answer.grading_user_id;
				const evaluatedId = answer.graded_user_id;
				if (!groupedAnswers[evaluatorId]) {
					groupedAnswers[evaluatorId] = {};
				}
				if (!groupedAnswers[evaluatorId][evaluatedId]) {
					groupedAnswers[evaluatorId][evaluatedId] = {};
				}
				groupedAnswers[evaluatorId][evaluatedId][answer.question_id] = answer.answerText;
				});

			 // Crear las filas con los datos
			const rows = [];

			Object.keys(groupedAnswers).forEach(evaluatorId => {
				Object.keys(groupedAnswers[evaluatorId]).forEach(evaluatedId => {
					const evaluator = assessmentInstance.users.find(user => user.id === parseInt(evaluatorId));
					const evaluated = assessmentInstance.users.find(user => user.id === parseInt(evaluatedId));

					// Rellenar la fila con los datos necesarios
					const row = [
					evaluator ? evaluator.name : '',
					evaluated ? evaluated.name : '',
					...assessmentInstance.assessment.questions.map(question => {
						return groupedAnswers[evaluatorId][evaluatedId][question.id] || '';
					})
					];

					rows.push(row);
				});
			});

			const ws = XLSX.utils.aoa_to_sheet([columns, ...rows]);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
			const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
			const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
			saveAs(data, `${assessmentInstance.title}_resultados.xlsx`);
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	// handle export users: return a XLSX file with the users in the assessment instance: column 1 is name, column 2 is email, column 3 is order, column 4 is group, column 5 is pin, column 6 is voteEveryone
	const handleExportUsers = async () => {
		try {
			const users = assessmentInstance.users;
			const worksheet = XLSX.utils.aoa_to_sheet([
				["Nombre", "Email", "Orden de presentacion", "Grupo", "PIN", "Vota a todos"],
				...users.map((user) => [
					user.name,
					user.email,
					user.order,
					user.group,
					user.pin,
					user.voteEveryone,
				]),
			]);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
			const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: "array" });
			const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
			saveAs(blob, `${assessmentInstance.title}_usuarios.xlsx`);
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleDelete = async () => {
		if (window.confirm("¿Estás seguro de eliminar el assessmentInstance?")) {
			try {
				const response = await fetch(
					`http://localhost:8000/assessment-instance/${assessmentInstanceId}/delete/token=${token}`,
					{
						method: "DELETE",
					}
				);
				if (!response.ok) {
					// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
				alert("AssessmentInstance eliminado con éxito");
				navigate(-1);
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		}
	};

// handle create users: post request to /assessment-instance/:id/users/upload/token={token} where you upload a CSV
	const handleCreateUsers = async () => {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = ".csv";
		fileInput.onchange = async () => {
			const file = fileInput.files[0];
			const formData = new FormData();
			formData.append("file", file);
			try {
				const response = await fetch(
					`http://localhost:8000/assessment-instance/${assessmentInstanceId}/users/upload/token=${token}`,
					{
						method: "POST",
						body: formData,
					}
				);
				if (!response.ok) {
					// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
				alert("Usuarios subidos con éxito");
				fetchAssessmentInstance();
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		};
		fileInput.click();
	};


	const handleStart = async () => {
		console.log("Starting assessment instance");
		navigate(`/start/${assessmentInstanceId}`);
	};

	const handleReturn = () => {
		navigate(`/menu/assessment/${assessmentInstance.assessment_id}/instances`);
	};

	return (
		<div className="container-fluid">
			{""}
			<nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
				<a className="navbar-brand" href="#">
					<img
						src={`${process.env.PUBLIC_URL}/logo.png`}
						alt="Logo"
						height="30"
					/>
				</a>
				<div className="navbar-nav">
					<a
						href="#"
						onClick={() => navigate("/menu/assessment")}
						className="nav-link"
					>
						Assessment
					</a>
					<a
						href="#"
						onClick={() => navigate("/menu/players")}
						className="nav-link"
					>
						Jugadores
					</a>
				</div>
				<button
					className="btn btn-danger ms-auto"
					onClick={() => {
						localStorage.removeItem("token");
						navigate("/login");
					}}
				>
					Logout
				</button>
			</nav>
			<div className="row">
				<aside className="col-md-2 d-flex flex-column">
					<button
						className="btn btn-success mb-3"
						onClick={handleStart}
						disabled={assessmentInstance && (assessmentInstance.active || assessmentInstance.finished || !assessmentInstance.users.length)}
					>
						Comenzar evaluación
					</button>
					<button
						className="btn btn-success mb-3"
						onClick={handleCreateUsers}
					>
						Subir usuarios
					</button>
					<button
						className="btn btn-primary mb-3"
						onClick={handleExportUsers}
					>
						Exportar Usuarios
					</button>
					<button
						className="btn btn-primary mb-3"
						onClick={handleExportAnswers}
					>
						Exportar resultados
					</button>
					<button
						className="btn btn-danger mb-3"
						onClick={handleDelete}
					>
						Eliminar
					</button>
					<button
						className="btn btn-secondary mb-3"
						onClick={handleReturn}
					>
						Volver
					</button>
				</aside>
				<section className="col-md-10">
					{assessmentInstance && (
						<div className="card">
							<div className="card-body">
								<h5 className="card-title">
									{assessmentInstance.title}
								</h5>
								<p className="card-text">
									<strong>Activo:</strong>{" "}
									{assessmentInstance.active ? "Sí" : "No"}
								</p>
								<p className="card-text">
									<strong>Finalizado:</strong>{" "}
									{assessmentInstance.finished ? "Sí" : "No"}
								</p>
								<h6 className="card-text">
									<strong>Usuarios</strong>
								</h6>
								{assessmentInstance.users.length === 0 ? (
									<p>No hay usuarios</p>
								) : (
									<div className="table-responsive">
										<table className="table table-borderless">
											<thead>
												<tr>
													<th>Nombre</th>
													<th>PIN</th>
													<th>Email</th>
													<th>Orden de presentación</th>
													<th>Grupo</th>
													<th>Evalúa a todos</th>
												</tr>
											</thead>
											<tbody>
												{assessmentInstance.users.map((user) => (
													<tr key={user.id}>
														<td>{user.name}</td>
														<td>{user.pin}</td>
														<td>{user.email}</td>
														<td>{user.order !== -1 ? user.order : "No presenta"}</td>
														<td>{user.group}</td>
														<td>{user.voteEveryone ? "Si" : "No"}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default DetalleAssessmentInstance;
