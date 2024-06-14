// Results.js
import React from "react";

function Results({ data }) {
	const resultClass = data.correct ? "text-success" : "text-danger";
	const resultText = data.correct ? "¡Correcto!" : "Incorrecto";
	const noAnswerText = "No se ha proporcionado respuesta";

	return (
		<div className="vh-100 d-flex justify-content-center align-items-center flex-column">
			<div className="card text-center">
				<br />
				<h2 className="text-center">Resultados</h2>
				<div className="card-body">
					<h5 className="card-title">{data.question}</h5>
					<p className="card-text">
						Tu respuesta:{" "}
						{data.answer !== "No contestado"
							? data.answer
							: noAnswerText}
					</p>
					<p className={`card-text ${resultClass}`}>
						{data.answer !== "No contestado"
							? resultText
							: noAnswerText}
					</p>
				</div>
				<div className="card-footer text-muted">
					Puntuación: {data.score}
				</div>
			</div>
		</div>
	);
}

export default Results;
