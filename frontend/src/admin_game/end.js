import React from "react";
import { useNavigate } from "react-router-dom";

function EndScreen({ data, ws, assessmentid }) {
	const handleSave = () => {
		ws.send("SAVE");
		navigate(`/menu/assessment/${assessmentid}`);
	};

	const handleClose = () => {
		ws.send("CLOSE");
		navigate(`/menu/assessment/${assessmentid}`);
	};

	const navigate = useNavigate();
	const sortedResults = [...data.results].sort((a, b) => b.score - a.score);

	return (
		<div
			className="container mt-4 text-center"
			style={{ paddingBottom: "3rem" }}
		>
			<h2 style={{ marginBottom: "1rem" }}>Resultados Finales</h2>
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
				<button onClick={handleClose} className="btn btn-danger">
					Cerrar
				</button>
				<button onClick={handleSave} className="btn btn-success">
					Guardar Resultados
				</button>
			</div>
		</div>
	);
}

export default EndScreen;
