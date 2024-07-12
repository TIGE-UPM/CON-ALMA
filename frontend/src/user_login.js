import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserLogin() {
	const [pin, setPin] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			// const response = await fetch("http://localhost:8000/user-login/",
			const response = await fetch(`http://${process.env.REACT_APP_IP}:8000/user-login/`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ pin }),
			});

			const data = await response.json();
			console.log(data);
			if (response.ok) {
				localStorage.setItem("token", data.token);
				navigate("/menu/assessment");
			} else {
				setError(data.detail || "Error de autenticación");
			}
		} catch (error) {
			setError("PIN incorrecto");
		}
	};

	const handgleReturn = () => {
		navigate("/");
	};

	return (
		<div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
			<div className="card p-4 mb-2" style={{ maxWidth: "400px" }}>
				{" "}
				<div className="card-body">
					<form onSubmit={handleSubmit}>
						<h3 className="card-title text-center mb-3">
							Iniciar Sesión
						</h3>

						<div className="mb-3">
							<label htmlFor="pin" className="form-label">
								PIN proporcionado por el profesor
							</label>
							<input
								type="text"
								className="form-control"
								id="pin"
								value={pin}
								onChange={(e) => setPin(e.target.value)}
								placeholder="PIN"
							/>
						</div>
						<button
							type="submit"
							className="btn btn-primary w-100 mb-2"
						>
							Iniciar Sesión
						</button>

						<button
							className="btn btn-secondary w-100 mb-2"
							onClick={handgleReturn}
						>
							Volver
						</button>
					</form>
				</div>
			</div>
			{error && (
				<div
					className="alert alert-danger"
					style={{ maxWidth: "400px" }}
				>
					{error}
				</div>
			)}
		</div>
	);
}

export default UserLogin;
