import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

function DetalleTest() {
	const [test, setTest] = useState(null);
	const [maxPoints, setMaxPoints] = useState(0);
	const navigate = useNavigate();
	const { id } = useParams();
	const token = localStorage.getItem("token");

	const fetchTest = useCallback(async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/test/${id}/view/token=${token}`
			);
			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			const data = await response.json();
			const puntuacionMaxima = data.questions.reduce((acc, current) => {
				return acc + current.weight;
			}, 0);
			setMaxPoints(puntuacionMaxima);
			setTest(data);
		} catch (error) {
			console.error("Fetch error:", error);
			navigate("/error");
		}
	}, [id, token]);

	useEffect(() => {
		fetchTest();
	}, [fetchTest]);

	function transformJson(originalJson) {
		return {
			title: originalJson.title,
			image: originalJson.image,
			questions: originalJson.questions.map((question) => ({
				title: question.title,
				image: question.image,
				allocatedTime: question.allocatedTime,
				weight: question.weight,
				answers: question.answers.map((answer) => ({
					title: answer.title,
					isCorrect: answer.isCorrect,
				})),
			})),
		};
	}

	const handleExport = () => {
		const simplifiedJson = transformJson(test);
		// Convertir los datos JSON a una cadena de texto
		const jsonString = JSON.stringify(simplifiedJson);
		// Crear un Blob con los datos JSON
		const blob = new Blob([jsonString], { type: "application/json" });
		// Crear un enlace para descargar el Blob
		const url = URL.createObjectURL(blob);
		// Crear un enlace temporal y forzar la descarga
		const link = document.createElement("a");
		link.href = url;
		link.download = `${test.title}.lgqz`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleEdit = () => {
		navigate(`/menu/test/${id}/edit`);
	};

	const handleViewGames = () => {
		navigate(`/menu/test/${id}/games`);
	};

	const handleArchive = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/test/${id}/archive/token=${token}`,
				{
					method: "POST",
				}
			);
			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			window.location.reload();
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleDelete = async () => {
		if (window.confirm("¿Estás seguro de eliminar el test?")) {
			try {
				const response = await fetch(
					`http://localhost:8000/test/${id}/delete/token=${token}`,
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
				alert("Test eliminado con éxito");
				navigate("/menu/test");
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		}
	};

	const handlePlay = async () => {
		navigate(`/play/${id}/admin`);
	};

	const handgleReturn = () => {
		navigate("/menu/test");
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
						onClick={() => navigate("/menu/test")}
						className="nav-link"
					>
						Test
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
						onClick={handlePlay}
					>
						Jugar
					</button>
					<button
						className="btn btn-primary mb-3"
						onClick={handleEdit}
					>
						Editar
					</button>
					<button
						className="btn btn-primary mb-3"
						onClick={handleExport}
					>
						Exportar
					</button>
					<button
						className="btn btn-primary mb-3"
						onClick={handleViewGames}
					>
						Juegos
					</button>
					<button
						className="btn btn-warning mb-3"
						onClick={handleArchive}
					>
						{test
							? test.archived
								? "Desarchivar"
								: "Archivar"
							: "Cargando..."}
					</button>
					<button
						className="btn btn-danger mb-3"
						onClick={handleDelete}
					>
						Eliminar
					</button>
					<button
						className="btn btn-secondary mb-3"
						onClick={handgleReturn}
					>
						Volver
					</button>
				</aside>
				<section className="col-md-10">
					{test && (
						<div className="card">
							<img
								src={test.image}
								className="card-img-top img-fluid"
								style={{
									maxHeight: "150px",
									objectFit: "cover",
									width: "100%",
								}}
								alt={`Test ${test.title}`}
								onError={(e) => {
									e.target.onerror = null;
									e.target.src = `${process.env.PUBLIC_URL}/default-banner.png`;
								}}
							/>
							<div className="card-body">
								<h2 className="card-title">{test.title}</h2>
								<p className="card-text">
									Jugado: {test.played} veces
								</p>
								<p className="card-text">
									Puntuación máxima: {maxPoints}
								</p>
								<p className="card-text">
									Creado:{" "}
									{new Date(
										test.createdAt
									).toLocaleDateString()}
								</p>
								<p className="card-text">
									Actualizado:{" "}
									{new Date(
										test.updatedAt
									).toLocaleDateString()}
								</p>

								{test.questions.map((question, index) => (
									<div key={question.id} className="mb-3">
										<div
											className="d-flex"
											style={{
												backgroundColor: "#f8f9fa",
												borderRadius: "10px",
											}}
										>
											<div
												className="me-3"
												style={{
													backgroundImage: `url(${question.image}), url(${process.env.PUBLIC_URL}/default-banner.png)`,
													backgroundSize: "cover",
													backgroundPosition:
														"center",
													borderTopLeftRadius: "10px",
													borderBottomLeftRadius:
														"10px",
													width: "100px",
													minHeight: "150px",
												}}
												onError={(e) =>
													(e.currentTarget.style.backgroundImage = `url(${process.env.PUBLIC_URL}/default-banner.png)`)
												}
											></div>
											<div
												style={{
													flex: 1,
													padding: "10px",
												}}
											>
												<p>
													<strong>
														{question.title}
													</strong>
												</p>
												<div className="d-flex align-items-start">
													<p className="me-3">
														{" "}
														<strong>
															Tiempo:
														</strong>{" "}
														{question.allocatedTime}{" "}
														segundos
													</p>
													<p>
														<strong>Puntos:</strong>{" "}
														{question.weight}
													</p>
												</div>
												<ul>
													{question.answers.map(
														(answer) => (
															<li
																key={answer.id}
																className={
																	answer.isCorrect
																		? "text-success"
																		: ""
																}
															>
																{answer.title}{" "}
																{answer.isCorrect
																	? "(Correcta)"
																	: ""}
															</li>
														)
													)}
												</ul>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default DetalleTest;
