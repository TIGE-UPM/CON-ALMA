import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PlayingScreen({ data, ws }) {
	const [assessmentInstance, setAssessmentInstance] = useState(null);
	const [answers, setAnswers] = useState([]);
	const navigate = useNavigate();
	const [gameState, setGameState] = useState(data);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const token = localStorage.getItem("token");
	const colors = ["#FF7043", "#FFCA28", "#29B6F6", "#66BB6A"];

	const handleAnswerChange = (questionId, value) => {
		const updatedAnswers = answers.map((answer) =>
			answer.question_id == questionId ? { ...answer, answerText: value } : answer
		);
		setAnswers(updatedAnswers);
	};


	const submitForm = async () => {
		try {
			const body = {
				answers: answers,
			}
			const response = await fetch(
				`http://localhost:8000/user/answer/token=${token}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				}
			);

			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			setIsSubmitted(true);
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
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			const data = await response.json();
			setAssessmentInstance(data);
			const initialAnswers = data.assessment.questions.map((question) => ({
				question_id: question.id,
				answerText: "",
			}));
			setAnswers(initialAnswers);
			setIsSubmitted(false);
			console.log(data);
			if (data.answers && data.answers.length > 0) {
				setAnswers(data.answers);
				setIsSubmitted(true);
			}
		} catch (error) {
			console.error("Fetch error:", error);
			navigate("/error");
		}
	}, [gameState.event, token]);

	useEffect(() => {
		fetchAssessmentInstance();
	}, [fetchAssessmentInstance]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		await submitForm();
		await fetchAssessmentInstance();
	};

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.event === "REFRESH") {
			fetchAssessmentInstance();
		}
		if (data.event === "FINISH") {
			ws.send("CLOSE");
		}
		setGameState(data);

		console.log(data);
	};

	if (!assessmentInstance) return <div>Cargando...</div>;
	if (!assessmentInstance.assessment) return <div>Espera, no te toca evaluar todavia...</div>;
	return (
		<form onSubmit={handleSubmit}>
			<section className="col-md-10">
				{assessmentInstance.assessment && (
					<div className="card">
						<img
							src={assessmentInstance.assessment.image}
							className="card-img-top img-fluid"
							style={{
								maxHeight: "150px",
								objectFit: "cover",
								width: "100%",
							}}
							alt={`Assessment ${assessmentInstance.assessment.title}`}
							onError={(e) => {
								e.target.onerror = null;
								e.target.src = `${process.env.PUBLIC_URL}/default-banner.png`;
							}}
						/>
						<div className="card-body">
							<h2 className="card-title">{assessmentInstance.title}</h2>
							<h5 className="card-text">
								Estas evaluando a {assessmentInstance.actual_user.name}
							</h5>
							{assessmentInstance.assessment.questions.map((question, index) => {
								return (
									<div key={question.id} className="mb-3">
										<div
											className="d-flex"
											style={{
												backgroundColor: "#f8f9fa",
												borderRadius: "10px",
											}}
										>
											<div
												className="me-3"
												style={{
													backgroundImage: `url(${question.image}), url(${process.env.PUBLIC_URL}/default-banner.png)`,
													backgroundSize: "cover",
													backgroundPosition:
														"center",
													borderTopLeftRadius: "10px",
													borderBottomLeftRadius:
														"10px",
													width: "100px",
													minHeight: "150px",
												}}
												onError={(e) =>
													(e.currentTarget.style.backgroundImage = `url(${process.env.PUBLIC_URL}/default-banner.png)`)
												}
											></div>
											<div
												style={{
													flex: 1,
													padding: "10px",
												}}
											>
												<p>
													<strong>
														{question.title}
													</strong>
												</p>
												{question.questionType === 'number' && (
													<div key={question.id}>
														<input
															type='number'
															className="form-control"
															value={answers.find((a) => a.question_id === question.id)?.answerText || ''}
															onChange={(e) => handleAnswerChange(question.id, e.target.value)}
															disabled={isSubmitted}
														/>
													</div>
												)}
												{question.questionType === 'text' && (
													<div key={question.id}>
														<input
															type='text'
															className="form-control"
															value={answers.find((a) => a.question_id === question.id)?.answerText || ''}
															onChange={(e) => handleAnswerChange(question.id, e.target.value)}
															disabled={isSubmitted}
														/>
													</div>
												)}
												{question.questionType === 'select' && (
													<div key={question.id}>
														{question.selectOptions.map((option, _index) => (
															<div key={_index} className="form-check">
																<input
																	type="checkbox"
																	className="form-check-input"
																	checked={answers.find((a) => a.question_id === question.id)?.answerText === option.title}
																	onChange={(e) => handleAnswerChange(question.id, e.target.checked ? option.title : '')}
																	disabled={isSubmitted}
																/>
																<label className="form-label">{option.title}</label>
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									</div>
								);
							})}
							<button
								className="btn btn-success mb-3"
								onClick={submitForm}
								disabled={isSubmitted}
							>
								Guardar
							</button>
						</div>
					</div>
				)}
			</section>
		</form>
		// <form onSubmit={handleSubmit}>
		// 	<h1>{assessmentInstance.title}</h1>
		// 	<h2>Estás evaluando a {assessmentInstance.actual_user.name}</h2>
		// 	{assessmentInstance.assessment.questions.map((question) => {
		// 		const answer = assessmentInstance.answers ? assessmentInstance.answers.find(a => a.question_id === question.id) : null;
		// 		const initialValue = answer ? answer.answerText : '';

		// 		switch (question.questionType) {
		// 			case 'text':
		// 			case 'number':
		// 				return (
		// 					<div key={question.id}>
		// 					{/* <label>{question.title}</label> */}
		// 					<input
		// 						type={question.questionType === 'numeric' ? 'number' : 'text'}
		// 						value={answers[question.id] || initialValue}
		// 						onChange={(e) => handleChange(question.id, e.target.value)}
		// 						disabled={isSubmitted}
		// 					/>
		// 					</div>
		// 				);
		// 			case 'select':
		// 				return (
		// 					<div key={question.id}>
		// 					<label>{question.title}</label>
		// 					{question.selectOptions.map((option) => (
		// 						<div key={option}>
		// 						<input
		// 							type="checkbox"
		// 							checked={answers[question.id] ===option || initialValue.includes(option)}
		// 							onChange={(e) => handleChange(question.id, e.target.checked ? option : '')}
		// 							disabled={isSubmitted}
		// 						/>
		// 						<label>{option}</label>
		// 						</div>
		// 					))}
		// 					</div>
		// 				);
		// 			default:
		// 				return null;
		// 		}
		// 	})}
		// 	<button type="submit" disabled={isSubmitted}>Enviar Respuestas</button>
		// </form>
	);
}

export default PlayingScreen;
