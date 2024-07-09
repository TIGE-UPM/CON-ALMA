import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
						onClick={handleExport}
					>
						Exportar
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
