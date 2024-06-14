import React from "react";

function RankingScreen({ data, ws, testid }) {
	const handleNext = () => {
		ws.send("NEXT");
	};

	const handleEnd = () => {
		ws.send("END");
	};

	const sortedResults = [...data.results].sort((a, b) => b.score - a.score);

	return (
		<div
			className="container mt-4 text-center"
			style={{ paddingBottom: "3rem" }}
		>
			<h2 style={{ marginBottom: "1rem" }}>Resultados Parciales</h2>
			<br />
			<div
				className="d-flex justify-content-center"
				style={{
					flexGrow: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ul className="list-group" style={{ width: "90%" }}>
					{sortedResults.map((result, index) => (
						<li
							key={index}
							className="list-group-item d-flex justify-content-between align-items-center"
						>
							<span style={{ marginRight: "0.5em" }}>
								{result.player}
							</span>
							<span>{result.score}</span>
						</li>
					))}
				</ul>
			</div>
			<div
				className="d-flex justify-content-between"
				style={{
					position: "absolute",
					bottom: "10%",
					left: "50%",
					transform: "translateX(-50%)",
					width: "80%",
				}}
			>
				<button onClick={handleEnd} className="btn btn-danger btn-lg">
					Finalizar Partida
				</button>
				<button onClick={handleNext} className="btn btn-success btn-lg">
					Siguiente Pregunta
				</button>
			</div>
		</div>
	);
}

export default RankingScreen;
