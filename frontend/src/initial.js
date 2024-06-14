import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Initial() {
	const [pin, setPin] = useState(0);
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	function handleSubmit(e) {
		e.preventDefault();
		if (!pin || !name) {
			setError("Debes ingresar un PIN y un nombre");
			return;
		}
		setError("");
		navigate(`/game/${pin}/${name}`);
	}

	function handleAdminClick() {
		navigate("/login");
	}

	return (
		<div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light position-relative">
			{/* Botón Admin en la parte superior derecha */}
			<button
				type="button"
				className="btn btn-secondary position-absolute top-0 end-0 m-3"
				onClick={handleAdminClick}
			>
				Admin
			</button>

			<div className="card p-4 mb-2" style={{ maxWidth: "400px" }}>
				<div className="card-body">
					<form onSubmit={handleSubmit}>
						<h3 className="card-title text-center mb-3">Jugar</h3>
						{/* Campo Usuario */}
						<div className="mb-3">
							<label htmlFor="Pin" className="form-label">
								Pin
							</label>
							<input
								type="text"
								className="form-control"
								id="pin"
								value={pin != 0 ? pin : ""}
								onChange={(e) => setPin(e.target.value)}
								placeholder="PIN"
							/>
						</div>

						{/* Campo Contraseña */}
						<div className="mb-4">
							<label htmlFor="name" className="form-label">
								Nombre
							</label>
							<input
								type="text"
								className="form-control"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Nombre"
							/>
						</div>

						<button
							type="submit"
							className="btn btn-primary w-100 mb-2"
						>
							Entrar
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

export default Initial;
