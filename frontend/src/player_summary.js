import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PlayerResults() {
	const [tests, setTests] = useState([]);
	const { id } = useParams();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	useEffect(() => {
		async function fetchResults() {
			try {
				const response = await fetch(
					`http://localhost:8000/results/player/${id}/all/token=${token}`
				);
				if (!response.ok) {
					if (response.status === 404) {
						setTests([]);
					} else {
						throw new Error(
							`Error ${response.status}: ${response.statusText}`
						);
					}
				} else {
					const data = await response.json();
					setTests(data);
				}
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		}

		fetchResults();
	}, [id, token]);

	const handleMoreClick = (gameId) => {
		navigate(`/menu/player/${id}/game/${gameId}`);
	};

	const handgleReturn = () => {
		navigate(-1);
	};

	let playerName = "";
	if (
		tests.length > 0 &&
		tests[0].games &&
		tests[0].games.length > 0 &&
		tests[0].games[0].results &&
		tests[0].games[0].results.length > 0
	) {
		playerName = tests[0].games[0].results[0].player_name;
	}

	return (
		<div className="container-fluid">
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
					{playerName == "" ? (
						<h2>No hay resultados</h2>
					) : (
						<h2>Resultados de: {playerName}</h2>
					)}
					{tests ? (
						<div className="row">
							{tests.map((test) =>
								test.games.map((game) => (
									<div
										key={game.id}
										className="col-sm-6 col-md-4 col-lg-3 mb-3"
									>
										<div
											className="card h-100"
											style={{ paddingBottom: "0.5rem" }}
										>
											<img
												src={
													test.image ||
													`${process.env.PUBLIC_URL}/default-banner.png`
												}
												className="card-img-top img-fluid"
												style={{
													maxHeight: "150px",
													objectFit: "cover",
												}}
												alt={`Test ${test.title}`}
												onError={(e) => {
													e.target.onerror = null;
													e.target.src = `${process.env.PUBLIC_URL}/default-banner.png`;
												}}
											/>
											<div
												className="card-body d-flex flex-column"
												style={{ padding: "0.5rem" }}
											>
												<h5
													className="card-title"
													style={{ fontSize: "1rem" }}
												>
													{test.title}
												</h5>
												<p
													className="card-text"
													style={{
														marginBottom: "0.5rem",
													}}
												>
													Jugado:{" "}
													{new Date(
														game.playedAt
													).toLocaleDateString()}
												</p>
												<div className="mt-auto d-flex justify-content-between">
													<button
														className="btn btn-primary"
														onClick={() =>
															handleMoreClick(
																game.id
															)
														}
													>
														Más
													</button>
												</div>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					) : (
						<p>Cargando datos del juego...</p>
					)}
				</section>
			</div>
		</div>
	);
}

export default PlayerResults;
