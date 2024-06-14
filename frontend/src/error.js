import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
	const navigate = useNavigate();

	return (
		<div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
			<div className="text-center">
				<h1 className="display-1 text-danger">Error</h1>
				<p className="lead">Algo salió mal :(</p>
				<button
					onClick={() => navigate("/")}
					className="btn btn-primary btn-lg"
				>
					Volver al Inicio
				</button>
			</div>
		</div>
	);
};

export default ErrorPage;
