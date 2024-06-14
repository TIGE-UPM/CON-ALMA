import React from "react";

function PlayingScreen({ data, ws }) {
	const questionInfo = data.question[0]; // Asumiendo que 'data.question' es un array

	// Colores para las tarjetas
	const colors = ["#FF7043", "#FFCA28", "#29B6F6", "#66BB6A"];

	const handleSkip = () => {
		ws.send("SKIP");
	};

	return (
		<div
			className="container-fluid"
			style={{
				overflow: "hidden", // Esto ocultará las barras de desplazamiento si el contenido desborda
				padding: "0 20px", // Agregamos padding horizontal pero eliminamos el vertical
			}}
		>
			{/* Reduciendo el margen encima del título de la pregunta */}
			<div className="row mb-2">
				<div className="col-12 text-center">
					<h2 style={{ marginTop: "10px", marginBottom: "10px" }}>
						{questionInfo.question_title}
					</h2>
				</div>
			</div>

			{/* Temporizador, imagen y contador de respuestas */}
			<div className="row mb-4 align-items-center">
				<div className="col-1 text-center">
					<span style={{ fontSize: "2rem", color: "#333" }}>
						{data.question_time}
					</span>
				</div>
				<div className="col-9 text-center">
					<img
						src={questionInfo.question_image}
						alt="Imagen de la pregunta"
						className="img-fluid"
						style={{ maxHeight: "300px" }}
					/>
				</div>
				<div className="col-2 text-center">
					<span style={{ fontSize: "2rem", color: "#333" }}>
						{data.responses} / {data.players}
					</span>
				</div>
			</div>

			{/* Respuestas en dos niveles con el mismo alto */}
			<div className="row justify-content-center">
				{questionInfo.question_answers
					.slice(0, 2)
					.map((answer, index) => (
						<div key={answer.answers_id} className="col-6 mb-2">
							<div
								className="text-center p-3"
								style={{
									backgroundColor: colors[index],
									color: "black",
									height: "100px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: "4px",
									margin: "5px",
								}}
							>
								{answer.answers_title}
							</div>
						</div>
					))}
			</div>
			<div className="row justify-content-center">
				{questionInfo.question_answers.slice(2).map((answer, index) => (
					<div key={answer.answers_id} className="col-6 mb-2">
						<div
							className="text-center p-3"
							style={{
								backgroundColor: colors[index + 2],
								color: "black",
								height: "100px", // Mismo alto para todas las tarjetas
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: "4px",
								margin: "5px",
							}}
						>
							{answer.answers_title}
						</div>
					</div>
				))}
			</div>

			{/* Botón para saltar a resultados */}
			<div className="row">
				<div className="col text-center">
					<button
						onClick={handleSkip}
						className="btn btn-success btn-lg"
					>
						Saltar
					</button>
				</div>
			</div>
		</div>
	);
}

export default PlayingScreen;
