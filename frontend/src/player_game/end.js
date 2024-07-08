import React from "react";
import { useNavigate } from "react-router-dom";

function EndScreen({ data }) {
	const navigate = useNavigate();

	return (
		<div className="vh-100 d-flex justify-content-center align-items-center flex-column">
			<h1 className="mb-3">Fin del Juego</h1>
			<button className="btn btn-primary" onClick={() => navigate("/")}>
				Inicio
			</button>
		</div>
	);
}

export default EndScreen;
