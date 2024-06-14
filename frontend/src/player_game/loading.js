import React from "react";

function LoadingScreen({ data }) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center vh-100">
			<div className="text-center mb-3">
				<h2>Cargando...</h2>
				<h1 className="display-1">{data.countdown}</h1>
			</div>
		</div>
	);
}

export default LoadingScreen;
