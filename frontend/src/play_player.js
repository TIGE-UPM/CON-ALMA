import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LobbyScreen from "./player_game/lobby";
import LoadingScreen from "./player_game/loading";
import PlayingScreen from "./player_game/playing";
import ResultsScreen from "./player_game/results";
import EndScreen from "./player_game/end";

function GameScreen() {
	const { pin } = useParams();
	const { name } = useParams();
	const navigate = useNavigate();
	const [gameState, setGameState] = useState(null);
	const [ws, setWs] = useState(null);

	useEffect(() => {
		const wsUrl = `ws://${process.env.REACT_APP_IP}:8000/play/pin=${pin}/player=${name}`;
		console.log(wsUrl);

		const newWs = new WebSocket(wsUrl);

		newWs.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setGameState(data);
		};

		setWs(newWs);

		return () => {
			if (newWs) newWs.close();
		};
	}, [pin, name]);

	if (!gameState) return <div>Cargando...</div>;

	switch (gameState.mode) {
		case "LOBBY":
			return <LobbyScreen data={gameState} />;
		case "LOADING":
			return <LoadingScreen data={gameState} />;
		case "PLAYING":
			return <PlayingScreen data={gameState} ws={ws} />;
		case "RESULTS":
			return <ResultsScreen data={gameState} />;
		case "END":
			return <EndScreen data={gameState} />;
		case "RANKING":
			return <ResultsScreen data={gameState} />;
		default:
			console.log("Invalid game mode");
			navigate("/error");
			return null;
	}
}

export default GameScreen;
