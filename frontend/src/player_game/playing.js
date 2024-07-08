import React from "react";

function PlayingScreen({ data, ws }) {
	// const questionInfo = data.question[0]; // Asumiendo que 'data.question' es un array con un elemento que contiene las preguntas y sus respuestas.
	const colors = ["#FF7043", "#FFCA28", "#29B6F6", "#66BB6A"];
	const [responsed, setResponsed] = React.useState(false);
	const handleSubmit = (answerId) => {
		const response = {
			question_id: questionInfo.question_id,
			answer_id: answerId,
		};

		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(response));
			setResponsed(true);
		} else {
			console.error("WebSocket no está abierto.");
		}
	};

	return (
		<div>
			{responsed ? (
				<div
					className="vh-100 d-flex justify-content-center align-items-center flex-column"
					style={{ fontSize: "30px", textAlign: "center" }}
				>
					{" "}
					Ya has respondido
				</div>
			) : (
				null
				// <div className="container-fluid h-100 d-flex flex-wrap align-items-stretch justify-content-center">
				// 	<div className="col-12">
				// 		<h1 className="text-center">
				// 			{questionInfo.question_title}
				// 		</h1>
				// 	</div>
				// 	{questionInfo.question_answers.map((answer, index) => (
				// 		<button
				// 			className="btn w-100"
				// 			style={{
				// 				backgroundColor: colors[index % colors.length],
				// 				fontSize: "1.2em", // Tamaño de fuente grande para facilidad de lectura
				// 				minHeight: "15vh", // Ajuste la altura mínima para cada botón
				// 				margin: "0.5em", // Añadir margen entre los botones
				// 			}}
				// 			onClick={() => handleSubmit(answer.answers_id)}
				// 		>
				// 			{answer.answers_title}
				// 		</button>
				// 	))}
				// </div>
			)}
		</div>
	);
}

export default PlayingScreen;
