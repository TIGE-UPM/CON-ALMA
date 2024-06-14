import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function GameDetail() {
	const [gameData, setGameData] = useState(null);
	const [totalPlayers, setTotalPlayers] = useState(0);
	const [maxPoints, setMaxPoints] = useState(0);
	const navigate = useNavigate();
	const { testid, gameid } = useParams();
	const token = localStorage.getItem("token");

	useEffect(() => {
		const fetchGameData = async () => {
			try {
				const response = await fetch(
					`http://localhost:8000/results/test/${testid}/game/${gameid}/token=${token}`
				);
				if (!response.ok) {
					// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
				const data = await response.json();
				let totalPlayers = data.games[0].results.length;
				const puntuacionMaxima = data.questions.reduce(
					(acc, current) => {
						return acc + current.weight;
					},
					0
				);
				setMaxPoints(puntuacionMaxima);
				setTotalPlayers(totalPlayers);
				setGameData(data);
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		};

		fetchGameData();
	}, [testid, gameid, token]);

	const countAnswers = (questionId, answerId) => {
		if (!gameData || !gameData.games) return 0;

		return gameData.games.flatMap((game) =>
			game.results.flatMap((result) =>
				result.solutions.filter(
					(solution) =>
						solution.question_id === questionId &&
						solution.answer_id === answerId
				)
			)
		).length;
	};

	const handleDeleteGame = async () => {
		if (window.confirm("¿Estás seguro de querer eliminar este juego?")) {
			try {
				const response = await fetch(
					`http://localhost:8000/results/${gameid}/delete/token=${token}`,
					{
						method: "DELETE",
					}
				);
				if (!response.ok) {
					throw new Error("Error al eliminar el juego");
				}
				alert("Juego eliminado con éxito");
				navigate("/menu/test");
			} catch (error) {
				console.error("Error:", error);
				alert("Error al eliminar el juego: " + error.message);
			}
		}
	};

	const navigateToPlayer = (playerId) => {
		navigate(`/menu/player/${playerId}/game/${gameid}`);
	};

	function calculatePercentage(questionId, answerId, totalPlayers) {
		const count = countAnswers(questionId, answerId); // Asumiendo que ya tienes esta función
		return (count / totalPlayers) * 100;
	}

	function calculatePercentageNoAnswer(answers, questionId, totalPlayers) {
		let countAnswered = answers.reduce((total, answer) => {
			return total + countAnswers(questionId, answer.id);
		}, 0);

		const countNoAnswer = totalPlayers - countAnswered;
		return (countNoAnswer / totalPlayers) * 100;
	}

	function calculateTotalAnswered(answers, questionId) {
		return answers.reduce((total, answer) => {
			return total + countAnswers(questionId, answer.id);
		}, 0);
	}
	const [sortedResults, setSortedResults] = useState([]);
	const [orderDirection, setOrderDirection] = useState({
		player_name: "desc",
		score: null,
	});

	useEffect(() => {
		const fetchGameData = async () => {
			try {
				const response = await fetch(
					`http://localhost:8000/results/test/${testid}/game/${gameid}/token=${token}`
				);
				if (!response.ok) {
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
				const data = await response.json();
				setGameData(data);
				setSortedResults(
					data.games[0].results.sort((a, b) => {
						return b.player_name.localeCompare(a.player_name);
					})
				);
			} catch (error) {
				console.error("Fetch error:", error);
				navigate("/error");
			}
		};

		fetchGameData();
	}, [testid, gameid, token]);

	const handleSort = (field) => {
		const isSameField = orderDirection[field];
		const isAscending = isSameField !== "asc";

		setOrderDirection({
			player_name:
				field === "player_name" ? (isAscending ? "asc" : "desc") : null,
			score: field === "score" ? (isAscending ? "asc" : "desc") : null,
		});

		const sorted = [...sortedResults].sort((a, b) => {
			let comparison = 0;
			if (field === "player_name") {
				comparison = a[field].localeCompare(b[field]);
			} else if (field === "score") {
				comparison = a[field] - b[field];
			}
			return isAscending ? comparison : -comparison;
		});
		setSortedResults(sorted);
	};

	const handgleReturn = () => {
		navigate(-1);
	};

	function jsonToCSV(json) {
		let csvString = "";

		// Agregar título del test y fecha de creación
		csvString += `${json.title};;Jugado;${json.createdAt};\n;;\n;;\n`;

		// Procesar cada pregunta
		json.questions.forEach((question) => {
			csvString += `${question.title};;;\n`;
			let answerRow = "";
			let correctRow = "Correcta?;";
			question.answers.forEach((answer) => {
				answerRow += `;${answer.title}`;
				correctRow += answer.isCorrect ? ";x" : ";";
			});
			csvString += `${answerRow}\n${correctRow}\n`;

			// Resultados de los jugadores
			json.games.forEach((game) => {
				game.results.forEach((result) => {
					let playerRow = `${result.player_name}`;
					question.answers.forEach((answer) => {
						const solution = result.solutions.find(
							(sol) =>
								sol.question_id === question.id &&
								sol.answer_id === answer.id
						);
						playerRow += solution ? ";x" : ";";
					});
					csvString += `${playerRow}\n`;
				});
			});

			csvString += ";;;\n;;;\n";
		});

		// Puntuación final
		csvString += "Puntuación final;;;\n";
		json.games.forEach((game) => {
			game.results.forEach((result) => {
				csvString += `${result.player_name};${result.score};;;\n`;
			});
		});

		return csvString;
	}

	function handleDownloadCSV() {
		const csvData = jsonToCSV(gameData);
		const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
		const blob = new Blob([bom, csvData], {
			type: "text/csv;charset=utf-8;",
		});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "test_de_banderas.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	}

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
						onClick={handleDownloadCSV}
					>
						Descargar Resultados
					</button>
					<button
						className="btn btn-danger mb-3"
						onClick={handleDeleteGame}
					>
						Eliminar Juego
					</button>
					<button
						className="btn btn-secondary mb-3"
						onClick={handgleReturn}
					>
						Volver
					</button>
				</aside>
				<section className="col-md-10">
					{gameData ? (
						<div className="card">
							<img
								src={gameData.image}
								className="card-img-top img-fluid"
								style={{
									maxHeight: "150px",
									objectFit: "cover",
									width: "100%",
								}}
								alt={`Juego ${gameData.title}`}
							/>
							<div className="card-body">
								<h2 className="card-title">{gameData.title}</h2>
								<br />
								{gameData.questions.map((question) => (
									<div key={question.id} className="mb-3">
										<h5>{question.title}</h5>
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
											></div>
											<div
												style={{
													flex: 1,
													padding: "10px",
												}}
											>
												<p>
													Tiempo:{" "}
													{question.allocatedTime}
													s&nbsp; Peso:{" "}
													{question.weight}
												</p>
												<ul>
													{question.answers.map(
														(answer) => (
															<li
																key={answer.id}
																className="my-2"
															>
																<div className="d-flex justify-content-between">
																	<span
																		className={
																			answer.isCorrect
																				? "text-success"
																				: ""
																		}
																	>
																		{
																			answer.title
																		}{" "}
																		{answer.isCorrect && (
																			<span>
																				(Correcta)
																			</span>
																		)}
																	</span>
																	<span>
																		{countAnswers(
																			question.id,
																			answer.id
																		)}
																	</span>
																</div>
																<div className="progress">
																	<div
																		className={`progress-bar ${
																			answer.isCorrect
																				? "bg-success"
																				: "bg-danger"
																		}`}
																		role="progressbar"
																		style={{
																			width: `${calculatePercentage(
																				question.id,
																				answer.id,
																				totalPlayers
																			)}%`,
																		}}
																		aria-valuenow={calculatePercentage(
																			question.id,
																			answer.id,
																			totalPlayers
																		)}
																		aria-valuemin="0"
																		aria-valuemax="100"
																	></div>
																</div>
															</li>
														)
													)}
													<li className="my-2">
														<div className="d-flex justify-content-between">
															<span>
																No Contestado
															</span>
															<span>
																{totalPlayers -
																	calculateTotalAnswered(
																		question.answers,
																		question.id
																	)}
															</span>
														</div>
														<div className="progress">
															<div
																className="progress-bar bg-danger"
																role="progressbar"
																style={{
																	width: `${calculatePercentageNoAnswer(
																		question.answers,
																		question.id,
																		totalPlayers
																	)}%`,
																}}
																aria-valuenow={calculatePercentageNoAnswer(
																	question.answers,
																	question.id,
																	totalPlayers
																)}
																aria-valuemin="0"
																aria-valuemax="100"
															></div>
														</div>
													</li>
												</ul>
											</div>
										</div>
									</div>
								))}
								<h4 className="mt-4">Jugadores:</h4>
								<div className="card mb-2">
									<div className="card-header d-flex justify-content-between">
										<span
											className="clickable"
											onClick={() =>
												handleSort("player_name")
											}
										>
											Nombre
											{orderDirection.player_name ===
											"asc"
												? "↑"
												: orderDirection.player_name ===
												  "desc"
												? "↓"
												: " "}
										</span>
										<span
											className="clickable"
											onClick={() => handleSort("score")}
										>
											Puntuación
											{orderDirection.score === "asc"
												? "↑"
												: orderDirection.score ===
												  "desc"
												? "↓"
												: " "}
											<br />
											Max: {maxPoints}
										</span>
										<span>Acciones</span>
									</div>
								</div>
								{sortedResults.map((result) => (
									<div className="card mb-2" key={result.id}>
										<div className="card-body d-flex justify-content-between align-items-center">
											<span className="clickable">
												{result.player_name}
											</span>
											<span
												className={`ml-auto ${
													result.score >=
													maxPoints / 2
														? "text-success"
														: "text-danger"
												}`}
											>
												{result.score}
											</span>
											<button
												className="btn btn-info ms-2"
												onClick={() =>
													navigateToPlayer(
														result.player_id
													)
												}
											>
												Info
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<p>Cargando datos del juego...</p>
					)}
				</section>
			</div>
		</div>
	);
}

export default GameDetail;
