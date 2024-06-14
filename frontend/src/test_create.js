import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CreateTest() {
	const initialTestState = {
		title: "",
		image: "",
		questions: [
			{
				title: "",
				image: "",
				allocatedTime: 30,
				weight: 10,
				answers: [
					{ title: "", isCorrect: true },
					{ title: "", isCorrect: false },
				],
			},
		],
	};

	const [formData, setFormData] = useState(initialTestState);

	const fileInputRef = useRef(null);
	const questionFileInputRefs = useRef({});

	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	const updateFormField = (field, value) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateQuestion = (questionIndex, field, value) => {
		const updatedQuestions = formData.questions.map((question, index) =>
			index === questionIndex ? { ...question, [field]: value } : question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const updateAnswer = (questionIndex, answerIndex, field, value) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						answers: question.answers.map((answer, aIndex) =>
							aIndex === answerIndex
								? { ...answer, [field]: value }
								: answer
						),
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const addQuestion = () => {
		setFormData({
			...formData,
			questions: [
				...formData.questions,
				{
					title: "",
					image: "",
					allocatedTime: 30,
					weight: 10,
					answers: [
						{ title: "", isCorrect: true },
						{ title: "", isCorrect: false },
					],
				},
			],
		});
	};

	const removeQuestion = (questionIndex) => {
		const updatedQuestions = formData.questions.filter(
			(_, index) => index !== questionIndex
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const addAnswer = (questionIndex) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						answers: [
							...question.answers,
							{ title: "", isCorrect: false },
						],
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const removeAnswer = (questionIndex, answerIndex) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						answers: question.answers.filter(
							(_, aIndex) => aIndex !== answerIndex
						),
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const setCorrectAnswer = (questionIndex, answerIndex) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						answers: question.answers.map((answer, aIndex) => ({
							...answer,
							isCorrect: aIndex === answerIndex,
						})),
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const isValidForm = () => {
		if (!formData.title.trim()) {
			//console.log("El título del test está vacío.");
			return false;
		}

		for (const question of formData.questions) {
			if (!question.title.trim()) {
				//console.log("El título de la pregunta está vacío.");
				return false;
			}

			if (question.allocatedTime <= 10 || question.weight <= 0) {
				/*console.log(
					"El tiempo asignado o el peso de la pregunta no es válido."
				);*/
				return false;
			}

			if (question.answers.length < 2) {
				//console.log("No hay suficientes respuestas para la pregunta.");
				return false;
			}

			let correctAnswerFound = false;
			for (const answer of question.answers) {
				if (!answer.title.trim()) {
					/*console.log(
						"Una respuesta marcada como correcta está vacía."
					);*/
					return false;
				}

				if (answer.isCorrect) {
					correctAnswerFound = true;
				}
			}

			if (!correctAnswerFound) {
				/*console.log(
					"No se encontró ninguna respuesta correcta para la pregunta."
				);*/
				return false;
			}
		}

		return true;
	};

	function handleImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			updateFormField("image", file.name);

			const reader = new FileReader();
			reader.onload = function (uploadEvent) {
				// Lógica de carga de imagen (si es necesario)
			};
			reader.readAsDataURL(file);
		}
	}

	function handleQuestionImageChange(event, qIndex) {
		const file = event.target.files[0];
		if (file) {
			updateQuestion(qIndex, "image", file.name);

			const reader = new FileReader();
			reader.onload = function (uploadEvent) {};
			reader.readAsDataURL(file);
		}
	}

	const handleSave = async () => {
		if (!isValidForm()) {
			alert("Por favor, rellena todos los campos correctamente.");
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:8000/test/create/token=${token}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			console.log(formData);
			alert("Test creado con éxito");
			navigate("/menu/test");
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleCancel = () => {
		navigate("/menu/test");
	};

	const canAddQuestion = () => formData.questions.length < 10;
	const canAddAnswer = (qIndex) =>
		formData.questions[qIndex].answers.length < 4;
	const canRemoveAnswer = (qIndex) =>
		formData.questions[qIndex].answers.length > 2;
	const hasCorrectAnswer = (qIndex) =>
		formData.questions[qIndex].answers.some((answer) => answer.isCorrect);
	const canRemoveQuestion = () => formData.questions.length > 1;

	function handleImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			updateFormField("image", file.name);

			const reader = new FileReader();
			reader.onload = function (uploadEvent) {};
			reader.readAsDataURL(file);
		}
	}

	const setQuestionFileInputRef = (input, index) => {
		questionFileInputRefs.current[index] = input;
	};

	function handleQuestionImageChange(event, qIndex) {
		const file = event.target.files[0];
		if (file) {
			updateFormField("image", file.name);

			const reader = new FileReader();
			reader.onload = function (uploadEvent) {};
			reader.readAsDataURL(file);
		}
	}

	const clearImage = () => {
		updateFormField("image", "");
	};

	const clearQuestionImage = (qIndex) => {
		updateQuestion(qIndex, "image", "");
	};

	return (
		<div className="container-fluid">
			{""}
			<nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
				<a className="navbar-brand" href="#">
					<img
						src={`${process.env.PUBLIC_URL}/logo.png`}
						alt="Logo"
						height="30"
					/>
				</a>
				<div className="navbar-nav">
					<a
						href="#"
						onClick={() => navigate("/menu/test")}
						className="nav-link"
					>
						Test
					</a>
					<a
						href="#"
						onClick={() => navigate("/menu/players")}
						className="nav-link"
					>
						Jugadores
					</a>
				</div>
				<button
					className="btn btn-danger ms-auto"
					onClick={() => {
						localStorage.removeItem("token");
						navigate("/login");
					}}
				>
					Logout
				</button>
			</nav>
			<div className="row">
				<aside className="col-md-2 d-flex flex-column">
					<button
						className="btn btn-success mb-3"
						onClick={handleSave}
						disabled={!isValidForm()}
					>
						Guardar
					</button>
					<button
						className="btn btn-danger mb-3"
						onClick={handleCancel}
					>
						Cancelar
					</button>
				</aside>
				<main className="col-md-10">
					<div className="card p-3">
						{/* ... (inputs para el título del test y para la imagen del test) */}
						<div className="mb-3">
							<label className="form-label">
								Título del Test
							</label>
							<input
								type="text"
								className="form-control"
								value={formData.title}
								onChange={(e) =>
									updateFormField("title", e.target.value)
								}
							/>
						</div>
						<div className="mb-3">
							<label className="form-label">
								URL de la Imagen
							</label>
							<div className="input-group">
								<input
									type="text"
									className="form-control"
									value={formData.image || ""} // Asegura que el valor no sea undefined
									onChange={(e) =>
										updateFormField("image", e.target.value)
									}
								/>
								<input
									type="file"
									style={{ display: "none" }}
									ref={fileInputRef}
									onChange={handleImageChange}
									accept="image/*"
								/>
								<button
									className="btn btn-outline-secondary"
									onClick={() => fileInputRef.current.click()}
								>
									Subir Imagen
								</button>
								<button
									className="btn btn-outline-danger"
									onClick={clearImage}
								>
									Borrar Imagen
								</button>
							</div>
						</div>
						{formData.questions.map((question, qIndex) => (
							<div
								key={qIndex}
								className="border p-3 mb-3 bg-light"
							>
								<div className="mb-3">
									<label className="form-label">
										Título de la Pregunta
									</label>
									<input
										type="text"
										className="form-control"
										value={question.title}
										onChange={(e) =>
											updateQuestion(
												qIndex,
												"title",
												e.target.value
											)
										}
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">
										URL de la Imagen de la Pregunta
									</label>
									<div className="input-group">
										<input
											type="text"
											className="form-control"
											value={question.image || ""}
											onChange={(e) =>
												updateQuestion(
													qIndex,
													"image",
													e.target.value
												)
											}
										/>
										<input
											type="file"
											style={{ display: "none" }}
											ref={(input) =>
												setQuestionFileInputRef(
													input,
													qIndex
												)
											}
											onChange={(e) =>
												handleQuestionImageChange(
													e,
													qIndex
												)
											}
											accept="image/*"
										/>
										<button
											className="btn btn-outline-secondary"
											onClick={() =>
												questionFileInputRefs.current[
													qIndex
												].click()
											}
										>
											Subir Imagen
										</button>
										<button
											className="btn btn-outline-danger"
											onClick={() =>
												clearQuestionImage(qIndex)
											}
										>
											Borrar Imagen
										</button>
									</div>
								</div>
								{/* Div contenedor para Tiempo Asignado y Puntos */}
								<div className="row mb-3">
									{/* Columna para Tiempo Asignado */}
									<div className="col">
										<label className="form-label">
											Tiempo Asignado (segundos)
										</label>
										<input
											type="number"
											className="form-control"
											value={question.allocatedTime}
											onChange={(e) =>
												updateQuestion(
													qIndex,
													"allocatedTime",
													parseInt(e.target.value, 10)
												)
											}
											min="10" // Puedes definir un mínimo
										/>
									</div>

									{/* Columna para Puntos */}
									<div className="col">
										<label className="form-label">
											Puntos
										</label>
										<input
											type="number"
											className="form-control"
											value={question.weight}
											onChange={(e) =>
												updateQuestion(
													qIndex,
													"weight",
													parseInt(e.target.value, 10)
												)
											}
											min="1" // Puedes definir un mínimo
										/>
									</div>
								</div>
								<br />
								<div className="mb-3">
									<h6>Respuestas</h6>
								</div>
								{question.answers.map((answer, aIndex) => (
									<div
										key={aIndex}
										className="d-flex align-items-center mb-2"
									>
										<input
											type="text"
											className="form-control me-2"
											value={answer.title}
											onChange={(e) =>
												updateAnswer(
													qIndex,
													aIndex,
													"title",
													e.target.value
												)
											}
											placeholder="Texto de la Respuesta"
										/>
										<input
											type="checkbox"
											className="form-check-input me-2"
											checked={answer.isCorrect}
											onChange={() =>
												setCorrectAnswer(qIndex, aIndex)
											}
										/>
										<label className="form-check-label me-2">
											Correcta
										</label>
										<button
											onClick={() =>
												removeAnswer(qIndex, aIndex)
											}
											className="btn btn-danger ms-2"
											disabled={
												!canRemoveAnswer(qIndex) ||
												!hasCorrectAnswer(qIndex)
											}
										>
											Eliminar
										</button>
									</div>
								))}
								<div className="d-flex justify-content-end">
									<button
										onClick={() => addAnswer(qIndex)}
										className="btn btn-primary mb-2"
										disabled={!canAddAnswer(qIndex)}
									>
										Añadir
									</button>
								</div>
								{canRemoveQuestion() && (
									<div className="d-grid gap-2">
										<button
											onClick={() =>
												removeQuestion(qIndex)
											}
											className="btn btn-danger"
											disabled={
												formData.questions.length <= 1
											}
										>
											Eliminar Pregunta
										</button>
									</div>
								)}
							</div>
						))}
						<div className="d-grid gap-2">
							<button
								onClick={addQuestion}
								className="btn btn-success"
								disabled={!canAddQuestion()}
							>
								Añadir Pregunta
							</button>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export default CreateTest;
