import React, {useState, useCallback, useEffect} from "react";
import { useNavigate } from "react-router-dom";

function PlayingScreen({ data, ws, connectedUsers, assessmentInstanceId }) {
	const colors = ["#FF7043", "#FFCA28", "#29B6F6", "#66BB6A"];
	const navigate = useNavigate();
	const [assessmentInstance, setAssessmentInstance] = useState(null);
	const [gameState, setGameState] = useState(data);
	const token = localStorage.getItem("token");
	const [currentGradingUsers, setCurrentGradingUsers] = useState([]);

	console.log(data);
	const handleNext = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/next/token=${token}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: null,
				}
			);

			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
		} catch (error) {
			console.error("Fetch error:", error);
			navigate("/error");
		}
	};

	const fetchAssessmentInstance = useCallback(async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/assessment-instance/active/token=${token}`
			);
			if (!response.ok) {
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			const data = await response.json();
			setAssessmentInstance(data);
			const gradingUsers = data.users.filter((user) => (user.voteEveryone || user.group === data.actual_user.group) && user.id !== data.actual_user.id);
			const filteredGradingUsers = gradingUsers.filter((user) => connectedUsers.some((connectedUser) => connectedUser.id === user.id));
			filteredGradingUsers.forEach((user) => {
				user.voted = false;
				if (data.answers && data.answers.some((answer) => answer.grading_user_id === user.id && answer.graded_user_id === data.actual_user.id)) {
					user.voted = true;
				}
			});
			console.log(filteredGradingUsers);
			setCurrentGradingUsers(filteredGradingUsers);
		} catch (error) {
			console.error("Fetch error:", error);
			navigate("/error");
		}
	}, [gameState.event, token]);

	useEffect(() => {
		fetchAssessmentInstance();
	}, [fetchAssessmentInstance]);

	useEffect(() => {
		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.event === "REFRESH") {
				fetchAssessmentInstance();
			}
			if(data.event === "FINISH") {
				ws.send("CLOSE");
				navigate(`/menu/assessment-instance/${assessmentInstanceId}`);
			}
			// if (data.event === "DISCONNECT") {
			// 	// remove user from connectedUsers
			// 	setConnectedUsers((prev) => prev.filter((user) => user.id !== data.user_id));
			// }
			setGameState(data);

			console.log(data);
		};
	}, [ws.onmessage]);

	useEffect(() => {
		console.log("currentGradingUsers updated", currentGradingUsers);
	  }, [currentGradingUsers]);

	return (
		<div
			className="container-fluid"
			style={{
				overflow: "hidden", // Esto ocultará las barras de desplazamiento si el contenido desborda
				padding: "0 20px", // Agregamos padding horizontal pero eliminamos el vertical
			}}
		>
			<div className="row mb-2">
				<div className="col-12 text-center">
					<h2 style={{ marginTop: "10px", marginBottom: "10px" }}>
						Evaluación: {assessmentInstance?.title}
					</h2>
				</div>
			</div>
			{/* show current graded user */}
			<div className="row mb-2">
				<div className="col-12 text-center">
					<h3 style={{ marginTop: "10px", marginBottom: "10px" }}>
						Se está evaluando a {assessmentInstance?.actual_user.name}
					</h3>
				</div>
			</div>
			{!currentGradingUsers.length ? (
				<div>
						<h3>No hay usuarios evaluando</h3>
				</div>
			): (
				<div>
					<h3 className="text-center">Usuarios que están evaluando</h3>
					<h5 className="text-center">Evaluado: <strong>{currentGradingUsers.filter((user) => user.voted).length}</strong> (de un total de {currentGradingUsers.length})</h5>
					<table className="table table-borderless text-center">
						<thead>
							<tr>
								<th>Nombre</th>
								<th>Ha evaluado</th>
							</tr>
						</thead>
						<tbody>
							{currentGradingUsers.map((user) => (
								<tr key={user.id}>
									<td>{user.name}</td>
									<td>{user.voted ? "Si ✅" : "No ❌"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* <div className="row mb-2">
				<div className="col-12 text-center">
					<h2 style={{ marginTop: "10px", marginBottom: "10px" }}>
						{questionInfo.question_title}
					</h2>
				</div>
			</div> */}

			{/* <div className="row mb-4 align-items-center">
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
			</div> */}

			{/* Respuestas en dos niveles con el mismo alto */}
			{/* <div className="row justify-content-center">
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
			</div> */}
			{/* <div className="row justify-content-center">
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
			</div> */}

			<div className="row">
				<div className="col text-center">
					<button
						onClick={handleNext}
						className="btn btn-success btn-lg"
					>
						Siguiente usuario
					</button>
				</div>
			</div>
		</div>
	);
}

export default PlayingScreen;
