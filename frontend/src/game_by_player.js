import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PlayerGameDetails() {
	const [gameDetails, setGameDetails] = useState(null);
	const { id_player, id_game } = useParams();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	useEffect(() => {
		const fetchGameDetails = async () => {
			try {
				const url = `http://localhost:8000/results/player/${id_player}/game/${id_game}/token=${token}`;
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}

				const data = await response.json();
				setGameDetails(data);
			} catch (error) {
				console.error("Fetch error:", error);
				navigate("/error");
			}
		};

		fetchGameDetails();
	}, [id_player, id_game, token]);

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
					{gameDetails ? (
						<>
							<div className="mb-4">
								<h2>{gameDetails.title}</h2>
								<img
									src={
										gameDetails.image ||
										`${process.env.PUBLIC_URL}/default-banner.png`
									}
									alt="Imagen del Test"
									className="img-fluid"
									style={{
										maxHeight: "200px",
										objectFit: "cover",
										width: "100%",
									}}
									onError={(e) => {
										e.target.onerror = null;
										e.target.src = `${process.env.PUBLIC_URL}/default-banner.png`;
									}}
								/>
							</div>
							<div>
								<h5>
									Detalles del Juego del Jugador:{" "}
									<strong>
										{
											gameDetails.games[0].results[0]
												.player_name
										}
									</strong>
								</h5>
								{gameDetails.questions &&
									gameDetails.questions.map(
										(question, index) => (
											<div
												key={index}
												className="card mb-3 bg-light" // Tarjeta con fondo gris claro
											>
												<div className="row g-0">
													{question.image && (
														<div className="col-md-1">
															<img
																src={
																	question.image ||
																	`${process.env.PUBLIC_URL}/default-question-image.png`
																}
																alt="Imagen de la pregunta"
																className="card-img-top rounded-start h-100"
																style={{
																	objectFit:
																		"cover",
																	borderTopLeftRadius:
																		"10px",
																	borderBottomLeftRadius:
																		"10px",
																}}
															/>
														</div>
													)}
													<div className="col-md-11">
														{" "}
														<div className="card-body">
															<h5 className="card-title">
																{question.title}
															</h5>
															<ul className="pl-4">
																{" "}
																{question.answers.map(
																	(
																		answer
																	) => {
																		const isCorrectAnswer =
																			answer.isCorrect;
																		const isAnsweredByUser =
																			gameDetails &&
																			gameDetails.games &&
																			gameDetails
																				.games
																				.length >
																				0 &&
																			gameDetails
																				.games[0]
																				.results &&
																			gameDetails
																				.games[0]
																				.results
																				.length >
																				0 &&
																			gameDetails
																				.games[0]
																				.results[0]
																				.solutions &&
																			gameDetails.games[0].results[0].solutions.some(
																				(
																					solution
																				) =>
																					solution.question_id ===
																						question.id &&
																					solution.answer_id ===
																						answer.id
																			);

																		return (
																			<li
																				key={
																					answer.id
																				}
																				className={`mb-2 ${
																					isCorrectAnswer
																						? "text-success"
																						: ""
																				}

																					${isAnsweredByUser && !isCorrectAnswer ? "text-danger" : ""}
																				`}
																			>
																				{isAnsweredByUser && (
																					<strong>
																						{
																							answer.title
																						}
																					</strong>
																				)}
																				{!isAnsweredByUser &&
																					answer.title}
																				{isCorrectAnswer &&
																					" (Correcta)"}
																			</li>
																		);
																	}
																)}
															</ul>
														</div>
													</div>
												</div>
											</div>
										)
									)}
								<div className="mt-4">
									<h5>Resultados:</h5>
									{gameDetails.games.map((game) => (
										<div key={game.id}>
											{game.results.map((result) => (
												<div
													key={result.id}
													className="card mb-3 bg-light"
												>
													<div className="card-body">
														<h5 className="card-title">
															{result.player_name}
														</h5>
														<p className="card-text">
															Puntuación:{" "}
															<strong>
																{result.score}
															</strong>
														</p>
													</div>
												</div>
											))}
										</div>
									))}
								</div>
							</div>
						</>
					) : (
						<p>Cargando detalles del juego...</p>
					)}
				</section>
			</div>
		</div>
	);
}

export default PlayerGameDetails;
