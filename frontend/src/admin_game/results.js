import React from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registrando componentes necesarios para Chart.js
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels
);

function ResultsScreen({ data, ws }) {
	const handleNext = () => {
		ws.send("NEXT");
	};

	const handleEnd = () => {
		ws.send("END");
	};

	const handleRanking = () => {
		ws.send("RANKING");
	};

	// Colores para las opciones de respuesta
	const colors = ["#FF7043", "#FFCA28", "#29B6F6", "#66BB6A"];

	// Preparar los datos para el gráfico de barras
	const labels = data.posible_answers.map((item) => item.answers);
	const chartData = {
		labels,
		datasets: [
			{
				label: "Respuestas",
				data: labels.map(
					(label) =>
						data.answers.filter((answer) => answer.answer === label)
							.length
				),
				backgroundColor: data.posible_answers.map((answer, index) => {
					const color = colors[index % colors.length];
					const opacity = answer.correct ? 1 : 0.8; // Establece la opacidad
					return `rgba(${parseInt(
						color.slice(-6, -4),
						16
					)}, ${parseInt(color.slice(-4, -2), 16)}, ${parseInt(
						color.slice(-2),
						16
					)}, ${opacity})`; // Añade la opacidad al color original
				}),
			},
		],
	};

	// Opciones para el gráfico de barras
	const chartOptions = {
		indexAxis: "x",
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					display: true,
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					display: false,
				},
				ticks: {
					display: false,
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				color: "black",
				anchor: "center",
				align: "center",
				formatter: (value, context) => (value > 0 ? value : ""),
			},
			// Se ha eliminado la configuración de title
		},
		maintainAspectRatio: false,
		responsive: true,
	};

	function getContrastYIQ(hexcolor) {
		hexcolor = hexcolor.replace("#", "");
		var r = parseInt(hexcolor.substr(0, 2), 16);
		var g = parseInt(hexcolor.substr(2, 2), 16);
		var b = parseInt(hexcolor.substr(4, 2), 16);
		var yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return yiq >= 128 ? "black" : "white";
	}

	return (
		<div className="container mt-4">
			<h2 style={{ textAlign: "center", marginBottom: "20px" }}>
				{data.question}
			</h2>
			<div style={{ height: "250px", marginBottom: "20px" }}>
				<Bar data={chartData} options={chartOptions} />
			</div>

			{/* Respuestas en dos niveles con el mismo alto */}
			<div className="row justify-content-center">
				{data.posible_answers.map((answer, index) => {
					const bgColor = colors[index % colors.length];
					const textColor = getContrastYIQ(bgColor);
					return (
						<div
							key={index}
							className={`col-6 mb-2 ${index >= 2 ? "mt-2" : ""}`}
						>
							<div
								className="text-center p-3"
								style={{
									backgroundColor: bgColor,
									color: textColor, // Aquí usamos el color de texto que hace contraste
									height: "100px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: "4px",
									margin: "5px",
									opacity: answer.correct ? "1" : "0.7",
									boxShadow: answer.correct
										? "0 0 8px rgba(0, 0, 0, 0.5)"
										: "none",
									border: answer.correct
										? "2px solid #333"
										: "2px solid transparent",
								}}
							>
								{answer.answers}
							</div>
						</div>
					);
				})}
			</div>

			{/* Botones de acción */}
			<div className="row mt-4">
				<div className="col d-flex justify-content-between">
					<button
						onClick={handleEnd}
						className="btn btn-danger btn-lg"
					>
						Finalizar Partida
					</button>
					<button
						onClick={handleRanking}
						className="btn btn-secondary btn-lg"
					>
						Ranking actual
					</button>
					<button
						onClick={handleNext}
						className="btn btn-success btn-lg"
					>
						Siguiente Pregunta
					</button>
				</div>
			</div>
		</div>
	);
}

export default ResultsScreen;
