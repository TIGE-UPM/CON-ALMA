import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LobbyScreen from "./admin_game/lobby";
import LoadingScreen from "./admin_game/loading";
import PlayingScreen from "./admin_game/playing";
import ResultsScreen from "./admin_game/results";
import EndScreen from "./admin_game/end";
import RankingScreen from "./admin_game/ranking";

function GameScreen() {
	const { assessmentInstanceId } = useParams();
	const navigate = useNavigate();
	const [gameState, setGameState] = useState(null);
	const [connectedUsers, setConnectedUsers] = useState([]);
	const [ws, setWs] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const newWs = new WebSocket(
			`ws://localhost:8000/assessment-instance/${assessmentInstanceId}/start/token=${token}`
		);

		newWs.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.event === "CONNECT") {
				// append user to connectedUsers
				setConnectedUsers((prev) => [...prev, {id: data.user_id, name: data.name}]);
			}

			console.log(data);
			setGameState(data);
		};

		setWs(newWs);

		return () => {
			if (newWs) newWs.close();
		};
	}, [assessmentInstanceId]);

	if (!gameState) return <div>Cargando...</div>;
	switch (gameState.mode) {
		case "LOBBY":
			return <LobbyScreen data={gameState} ws={ws} connectedUsers={connectedUsers}/>;
		// case "LOADING":
		// 	return <LoadingScreen data={gameState} />;
		case "PLAYING":
			return <PlayingScreen data={gameState} ws={ws} connectedUsers={connectedUsers} assessmentInstanceId={assessmentInstanceId}/>;
		// case "RESULTS":
		// 	return <ResultsScreen data={gameState} ws={ws} />;
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
