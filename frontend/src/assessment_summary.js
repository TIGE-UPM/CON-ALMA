import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function AssessmentInstances() {
	const [assessmentInstances, setAssessmentInstances] = useState([]);
	const [assessmentName, setAssessmentName] = useState("");
	const navigate = useNavigate();
	const { id } = useParams(); // id del assessment
	const token = localStorage.getItem("token");

	useEffect(() => {
		fetchAssessmentInstances();
	}, [id, token]);

	const fetchAssessmentInstances = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/assessment/${id}/assessment-instance/all/token=${token}`
			);
			if (!response.ok) {
				if (response.status === 404) {
					setAssessmentInstances([]);
				} else {
					// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
			} else {
				const data = await response.json();
				setAssessmentName(data.title || "Assessment");
				setAssessmentInstances(data.assessmentInstances || []);
			}
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleDelete = async (instanceId) => {
		if (window.confirm("¿Estás seguro de querer eliminar este juego?")) {
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
				alert("Juego eliminado con éxito");
				fetchAssessmentInstances();
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		}
	};

	const handleMoreClick = (instanceId) => {
		navigate(`/menu/assessment-instance/${instanceId}`);
	};

	const handleCreateClick = () => {
		navigate(`/menu/assessment/${id}/instance/new`);
	};

	const handgleReturn = () => {
		navigate(-1);
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
						className="btn btn-secondary mb-3"
						onClick={handgleReturn}
					>
						Volver
					</button>
					<button
						className="btn btn-success mb-3"
						onClick={handleCreateClick}
					>
						Crear nuevo juego
					</button>
				</aside>

				<section className="col-md-10">
					<h1>Evaluación: {assessmentName}</h1>
					{assessmentInstances.length === 0 ? (
						<h2>No hay juegos</h2>
					) : (
						<h2>Juegos: </h2>
					)}
					{assessmentInstances.map((instance) => (
						<div key={instance.id} className="col-md-4 mb-3">
							<div className="card h-100">
								<div className="card-body d-flex flex-column">
									{/* <h5 className="card-title">
										Jugado:{" "}
										{new Date(
											instance.playedAt
										).toLocaleDateString()}
									</h5> */}
									<h4 className="card-title">
										{instance.title}
									</h4>
									<h6 className="card-title">
										Activo: {instance.active ? "Sí" : "No"}
									</h6>
									<h6 className="card-title">
										Finalizado: {instance.finished ? "Sí" : "No"}
									</h6>
									<p className="card-text">
										{instance.users.length ? (
											`Número de usuarios: ${instance.users.length}`
										) : (
											"No hay usuarios creados"
										)}
									</p>
									<div className="mt-auto d-flex justify-content-between">
										<button
											className="btn btn-primary"
											onClick={() =>
												handleMoreClick(
													instance.id
												)
											}
										>
											Ver
										</button>
										<button
											className="btn btn-danger"
											onClick={() =>
												handleDelete(instance.id)
											}
										>
											Borrar
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</section>
			</div>
		</div>
	);
}

export default AssessmentInstances;
