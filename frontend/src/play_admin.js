import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LobbyScreen from "./admin_game/lobby";
import LoadingScreen from "./admin_game/loading";
import PlayingScreen from "./admin_game/playing";
import ResultsScreen from "./admin_game/results";
import EndScreen from "./admin_game/end";
import RankingScreen from "./admin_game/ranking";

function GameScreen() {
	const { testId } = useParams();
	const navigate = useNavigate();
	const [gameState, setGameState] = useState(null);
	const [ws, setWs] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const newWs = new WebSocket(
			`ws://localhost:8000/play/test=${testId}/token=${token}`
		);

		newWs.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setGameState(data);
		};

		setWs(newWs);

		return () => {
			if (newWs) newWs.close();
		};
	}, [testId]);

	if (!gameState) return <div>Cargando...</div>;
	switch (gameState.mode) {
		case "LOBBY":
			return <LobbyScreen data={gameState} ws={ws} />;
		case "LOADING":
			return <LoadingScreen data={gameState} />;
		case "PLAYING":
			return <PlayingScreen data={gameState} ws={ws} />;
		case "RESULTS":
			return <ResultsScreen data={gameState} ws={ws} />;
		case "END":
			return <EndScreen data={gameState} ws={ws} testid={testId} />;
		case "RANKING":
			return <RankingScreen data={gameState} ws={ws} />;
		default:
			console.log("Invalid game mode");
			navigate("/error");
			return null;
	}
}

export default GameScreen;
