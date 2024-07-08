import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function CreateAssessmentInstance() {
	const { id } = useParams(); // id del assessment
	const initialAssessmentInstanceState = {
		title: "",
	};

	const [formData, setFormData] = useState(initialAssessmentInstanceState);

	const fileInputRef = useRef(null);

	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	const updateFormField = (field, value) => {
		setFormData({ ...formData, [field]: value });
	};


	const isValidForm = () => {
		if (!formData.title.trim()) {
			//console.log("El título del assessmentInstance está vacío.");
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!isValidForm()) {
			alert("Por favor, rellena todos los campos correctamente.");
			return;
		}

		try {
			const body = {
				title: formData.title,
			};
			const response = await fetch(
				`http://localhost:8000/assessment/${id}/assessment-instance/create/token=${token}`,
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
			alert("AssessmentInstance creado con éxito");
			navigate(`/menu/assessment/${id}/instances`);
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleCancel = () => {
		navigate(`/menu/assessment/${id}/instances`);
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
						onClick={() => navigate(`/menu/assessment/${id}/instances`)}
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
						{/* ... (inputs para el título del assessmentInstance y para la imagen del assessmentInstance) */}
						<div className="mb-3">
							<label className="form-label">
								Título de la Evaluación
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
					</div>
				</main>
			</div>
		</div>
	);
}

export default CreateAssessmentInstance;
