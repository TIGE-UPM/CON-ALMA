import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LobbyScreen({ data, ws, connectedUsers }) {
	const navigate = useNavigate();
	const [qrImageUrl, setQrImageUrl] = useState("");

	const playerUrl = `http://${process.env.REACT_APP_IP}:3000/`;
	const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
		playerUrl
	)}`;

	useEffect(() => {
		setQrImageUrl(qrApiUrl);
	}, [playerUrl]);

	const handleStart = () => {
		ws.send("START");
	};

	const handleBack = () => {
		ws.send("CLOSE");
		navigate(-1);
	};
	const testImageUrl = data.image;

	return (
		<div className="lobby-screen">
			{/* Área con imagen de fondo oscurecida */}
			<div
				className="text-center py-5"
				style={{
					backgroundImage: `url(${testImageUrl})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div
					className="card my-4 mx-auto"
					style={{
						maxWidth: "30rem",
						backgroundColor: "rgba(255, 255, 255, 1)", // Fondo semitransparente
					}}
				>
					<div className="card-body text-start">
						{" "}
						{/* Clase text-start para alinear el texto a la izquierda */}
						<h1 className="card-title">{data.test}</h1>
						<div className="d-flex justify-content-between align-items-center mb-2">
							<button
								onClick={handleStart}
								className="btn btn-primary"
							>
								Comenzar Juego
							</button>
							<button
								onClick={handleBack}
								className="btn btn-secondary"
							>
								Volver
							</button>
						</div>
						{/* Contador de jugadores conectados alineado a la izquierda */}
						<p className="card-text">
							<img src={qrImageUrl} alt="QR Code" />
						</p>
						<p className="card-text">
							Jugadores Conectados: {connectedUsers.length}
						</p>
						<div className="mt-3">
							<div className="row justify-content-center">
								{connectedUsers.map((user, index) => (
									<div key={index} className="col-auto mb-2">
										<div className="p-3 border bg-white rounded">
											{user.name}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Área de jugadores */}
		</div>
	);
}

export default LobbyScreen;
