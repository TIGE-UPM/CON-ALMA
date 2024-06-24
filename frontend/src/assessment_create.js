import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CreateAssessment() {
	const initialAssessmentState = {
		title: "",
		image: "",
		questions: [
			{
				title: "",
				image: "",
				questionType: "text",
				selectOptions: [
					{ title: "" },
					{ title: "" },
				],
			},
		],
	};

	const [formData, setFormData] = useState(initialAssessmentState);

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

	const updateSelectOption = (questionIndex, selectOptionIndex, field, value) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						selectOptions: question.selectOptions.map((selectOption, aIndex) =>
							aIndex === selectOptionIndex
								? { ...selectOption, [field]: value }
								: selectOption
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
					questionType: "text",
					selectOptions: [
						{ title: "" },
						{ title: "" },
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

	const addSelectOption = (questionIndex) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						selectOptions: [
							...question.selectOptions,
							{ title: "" },
						],
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const removeSelectOption = (questionIndex, selectOptionIndex) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						selectOptions: question.selectOptions.filter(
							(_, aIndex) => aIndex !== selectOptionIndex
						),
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const setCorrectSelectOption = (questionIndex, selectOptionIndex) => {
		const updatedQuestions = formData.questions.map((question, qIndex) =>
			qIndex === questionIndex
				? {
						...question,
						selectOptions: question.selectOptions.map((selectOption, aIndex) => ({
							...selectOption,
							isCorrect: aIndex === selectOptionIndex,
						})),
				  }
				: question
		);
		setFormData({ ...formData, questions: updatedQuestions });
	};

	const isValidForm = () => {
		if (!formData.title.trim()) {
			//console.log("El título del assessment está vacío.");
			return false;
		}

		for (const question of formData.questions) {
			if (!question.title.trim()) {
				//console.log("El título de la pregunta está vacío.");
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
				`http://localhost:8000/assessment/create/token=${token}`,
				{
					method: "POST",
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
			alert("Assessment creado con éxito");
			navigate("/menu/assessment");
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleCancel = () => {
		navigate("/menu/assessment");
	};

	// const canAddQuestion = () => formData.questions.length < 10;
	// const canAddSelectOption = (qIndex) =>
	// 	formData.questions[qIndex].selectOptions.length < 4;
	const canAddQuestion = () => true;
	const canAddSelectOption = () => true;
	const canRemoveSelectOption = (qIndex) =>
		formData.questions[qIndex].selectOptions.length > 2;
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
						onClick={() => navigate("/menu/assessment")}
						className="nav-link"
					>
						Assessment
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
						{/* ... (inputs para el título del assessment y para la imagen del assessment) */}
						<div className="mb-3">
							<label className="form-label">
								Título del Assessment
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
								{/* Div para tipo de pregunta con selector */}
								<div className="mb-3">
									<label className="form-label">
										Tipo de Pregunta
									</label>
									<select
										className="form-select"
										value={question.questionType}
										onChange={(e) =>
											updateQuestion(
												qIndex,
												"questionType",
												e.target.value
											)
										}
									>
										<option value="text">Texto</option>
										<option value="number">Numérica</option>
										<option value="select">Selección</option>
									</select>
								</div>
								{/* Div para opciones de selección */}
								{question.questionType === "select" && (
									<div className="mb-3">
										<h6>Opciones</h6>
										{question.selectOptions.map((selectOption, aIndex) => (
											<div
												key={aIndex}
												className="d-flex align-items-center mb-2"
											>
												<input
													type="text"
													className="form-control me-2"
													value={selectOption.title}
													onChange={(e) =>
														updateSelectOption(
															qIndex,
															aIndex,
															"title",
															e.target.value
														)
													}
													placeholder="Texto de la Opción"
												/>
												<button
													onClick={() =>
														removeSelectOption(qIndex, aIndex)
													}
													className="btn btn-danger ms-2"
													disabled={
														!canRemoveSelectOption(qIndex)
													}
												>
													Eliminar
												</button>
											</div>
										))}
										<div className="d-flex justify-content-end">
											<button
												onClick={() => addSelectOption(qIndex)}
												className="btn btn-primary mb-2"
												disabled={!canAddSelectOption(qIndex)}
											>
												Añadir
											</button>
										</div>
									</div>
								)}
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

export default CreateAssessment;
