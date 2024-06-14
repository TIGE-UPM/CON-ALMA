import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TestResults() {
	const [testResults, setTestResults] = useState([]);
	const [testName, setTestName] = useState("");
	const navigate = useNavigate();
	const { id } = useParams(); // id del test
	const token = localStorage.getItem("token");

	useEffect(() => {
		fetchTestResults();
	}, [id, token]);

	const fetchTestResults = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/results/test/${id}/all/token=${token}`
			);
			if (!response.ok) {
				if (response.status === 404) {
					setTestResults([]);
				} else {
					// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
			} else {
				const data = await response.json();
				setTestName(data.title || "Test");
				setTestResults(data.games || []);
			}
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleDelete = async (gameId) => {
		if (window.confirm("¿Estás seguro de querer eliminar este juego?")) {
			try {
				const response = await fetch(
					`http://localhost:8000/results/${gameId}/delete/token=${token}`,
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
				fetchTestResults();
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		}
	};

	const handleMoreClick = (gameId, testid) => {
		navigate(`/menu/test/${testid}/game/${gameId}`);
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
						className="btn btn-secondary mb-3"
						onClick={handgleReturn}
					>
						Volver
					</button>
				</aside>

				<section className="col-md-10">
					{testResults.length === 0 ? (
						<h2>No hay juegos</h2>
					) : (
						<h2>Resultados de: {testName}</h2>
					)}
					{testResults.map((game) => (
						<div key={game.id} className="col-md-4 mb-3">
							<div className="card h-100">
								<div className="card-body d-flex flex-column">
									<h5 className="card-title">
										Jugado:{" "}
										{new Date(
											game.playedAt
										).toLocaleDateString()}
									</h5>
									<p className="card-text">
										Número de jugadores: {game.players}
									</p>
									<div className="mt-auto d-flex justify-content-between">
										<button
											className="btn btn-primary"
											onClick={() =>
												handleMoreClick(
													game.id,
													game.test_id
												)
											}
										>
											Más
										</button>
										<button
											className="btn btn-danger"
											onClick={() =>
												handleDelete(game.id)
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

export default TestResults;
