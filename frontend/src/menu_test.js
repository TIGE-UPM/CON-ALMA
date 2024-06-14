import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MenuTest() {
	const [tests, setTests] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [archiveFilter, setArchiveFilter] = useState("todos");
	const [playedFilter, setPlayedFilter] = useState("todos");
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const fileInputRef = useRef(null);

	const triggerFileInput = () => {
		fileInputRef.current.click();
	};
	useEffect(() => {
		fetchTests();
	}, [token]);

	const fetchTests = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/test/all/token=${token}`
			);
			if (!response.ok) {
				if (response.status === 404) {
					setTests([]);
				} else {
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
			} else {
				const data = await response.json();
				setTests(data);
			}
		} catch (error) {
			console.error("Fetch error:", error);
			navigate("/error");
		}
	};

	const handleInfo = (testId) => {
		navigate(`/menu/test/${testId}`);
	};

	const handleArchiveToggle = async (testId, archivedStatus) => {
		try {
			const response = await fetch(
				`http://localhost:8000/test/${testId}/archive/token=${token}`,
				{ method: "POST" }
			);
			if (!response.ok) {
				// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
				throw new Error(
					`Error ${response.status}: ${response.statusText}`
				);
			}
			fetchTests();
		} catch (error) {
			console.error("Fetch error:", error);
			// Redireccionar a la página de error sin pasar el código de estado como parámetro
			navigate("/error");
		}
	};

	const handleDelete = async (testId) => {
		if (window.confirm("¿Estás seguro de eliminar el test?")) {
			try {
				const response = await fetch(
					`http://localhost:8000/test/${testId}/delete/token=${token}`,
					{ method: "DELETE" }
				);
				if (!response.ok) {
					// Si el estado de la respuesta no es OK, arrojar un error con el código de estado
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}
				fetchTests();
			} catch (error) {
				console.error("Fetch error:", error);
				// Redireccionar a la página de error sin pasar el código de estado como parámetro
				navigate("/error");
			}
		}
	};

	const handleNewTest = () => {
		navigate("/menu/test/new");
	};

	const handleImportTest = async () => {
		const file = fileInputRef.current.files[0];
		if (!file) {
			alert("Por favor, selecciona un archivo .lgqz.");
			return;
		}

		if (!file.name.endsWith(".lgqz")) {
			alert("El archivo no tiene la extensión .lgqz");
			return;
		}

		const reader = new FileReader();
		reader.onload = async (event) => {
			try {
				const jsonData = JSON.parse(event.target.result);
				// Suponiendo que tienes 'token' disponible
				const response = await fetch(
					`http://localhost:8000/test/create/token=${token}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(jsonData),
					}
				);

				if (!response.ok) {
					throw new Error(
						`Error ${response.status}: ${response.statusText}`
					);
				}

				alert("Test importado con éxito");
				window.location.reload(true);
			} catch (error) {
				console.error("Fetch error:", error);
				navigate("/error");
			}
		};

		reader.onerror = () => {
			console.error("Error al leer el archivo");
			alert("Error al leer el archivo");
		};

		reader.readAsText(file);
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value.toLowerCase());
	};

	const handleResetFilters = () => {
		setSearchTerm("");
		setArchiveFilter("todos");
		setPlayedFilter("todos");
	};

	const filteredTests = tests.filter((test) => {
		const archiveCondition =
			archiveFilter === "todos" ||
			(archiveFilter === "archivados" && test.archived) ||
			(archiveFilter === "noArchivados" && !test.archived);
		const playedCondition =
			playedFilter === "todos" ||
			(playedFilter === "jugados" && test.played > 0) ||
			(playedFilter === "noJugados" && test.played === 0);

		return (
			test.title.toLowerCase().includes(searchTerm) &&
			archiveCondition &&
			playedCondition
		);
	});

	const defaultImage = "";

	/*<button className="btn btn-danger" onClick={() => handleDelete(test.id)}>
		Eliminar
	</button>;
	
	<button
		className="btn btn-warning me-2" // Agregado me-2 para dar margen extra
		onClick={() =>
			handleArchiveToggle(
				test.id,
				!test.archived
			)
		}
	>
		{test.archived
			? "Desarchivar"
			: "Archivar"}
	</button>*/

	return (
		<div className="container-fluid">
			{" "}
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
				<aside className="col-md-3">
					<button
						className="btn btn-success mb-3 w-100"
						onClick={handleNewTest}
					>
						Nuevo Test
					</button>
					<button
						className="btn btn-primary mb-3 w-100"
						onClick={triggerFileInput}
					>
						Importar Test
					</button>
					<input
						type="file"
						ref={fileInputRef}
						accept=".lgqz"
						style={{ display: "none" }}
						onChange={handleImportTest}
					/>
					<input
						type="text"
						className="form-control mb-3 w-100"
						placeholder="Buscar Test"
						value={searchTerm}
						onChange={handleSearchChange}
					/>

					<div className="bg-light p-2 rounded-3 mb-3">
						<div className="nav nav-pills nav-fill">
							<button
								className={`nav-link ${
									archiveFilter === "todos"
										? "active bg-primary text-white"
										: "bg-light"
								}`}
								onClick={(e) => {
									e.preventDefault();
									setArchiveFilter("todos");
								}}
							>
								Todos
							</button>
							<button
								className={`nav-link ${
									archiveFilter === "archivados"
										? "active bg-primary text-white"
										: "bg-light"
								}`}
								onClick={(e) => {
									e.preventDefault();
									setArchiveFilter("archivados");
								}}
							>
								Archivados
							</button>
							<button
								className={`nav-link ${
									archiveFilter === "noArchivados"
										? "active bg-primary text-white"
										: "bg-light"
								}`}
								onClick={(e) => {
									e.preventDefault();
									setArchiveFilter("noArchivados");
								}}
							>
								No
								<br />
								Archivados
							</button>
						</div>
					</div>

					<div className="bg-light p-2 rounded-3 mb-3">
						<div className="nav nav-pills nav-fill">
							<button
								className={`nav-link ${
									playedFilter === "todos"
										? "active bg-primary text-white"
										: "bg-light"
								}`}
								onClick={(e) => {
									e.preventDefault();
									setPlayedFilter("todos");
								}}
							>
								Todos
							</button>
							<button
								className={`nav-link ${
									playedFilter === "jugados"
										? "active bg-primary text-white"
										: "bg-light"
								}`}
								onClick={(e) => {
									e.preventDefault();
									setPlayedFilter("jugados");
								}}
							>
								Jugados
							</button>
							<button
								className={`nav-link ${
									playedFilter === "noJugados"
										? "active bg-primary text-white"
										: "bg-light"
								}`}
								onClick={(e) => {
									e.preventDefault();
									setPlayedFilter("noJugados");
								}}
							>
								No Jugados
							</button>
						</div>
					</div>

					<button
						className="btn btn-secondary mb-3 w-100"
						onClick={handleResetFilters}
					>
						Resetear Filtros
					</button>
				</aside>

				<section className="col-md-9">
					{tests.length === 0 ? <h2>No hay resultados</h2> : ""}
					{filteredTests ? (
						<div className="row">
							{filteredTests.map((test) => (
								<div
									key={test.id}
									className="col-md-4 mb-4 d-flex align-items-stretch"
								>
									<div
										className="card"
										style={{ width: "100%" }}
									>
										<img
											src={
												test.image ||
												`${process.env.PUBLIC_URL}/default-banner.png`
											}
											className="card-img-top img-fluid"
											style={{
												maxHeight: "150px",
												objectFit: "cover",
											}}
											alt={`Test ${test.title}`}
											onError={(e) => {
												e.target.onerror = null;
												e.target.src = `${process.env.PUBLIC_URL}/default-banner.png`;
											}}
										/>
										<div className="card-body d-flex flex-column">
											<h5 className="card-title">
												{test.title}
											</h5>
											<p className="card-text">
												Jugado: {test.played} veces
											</p>
											<p className="card-text">
												Creado:{" "}
												{new Date(
													test.createdAt
												).toLocaleDateString()}
											</p>
											<div className="mt-auto d-flex justify-content-between">
												<button
													className="btn btn-info"
													onClick={() =>
														handleInfo(test.id)
													}
												>
													Info
												</button>
												<div className="d-flex"></div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p>Cargando detalles del juego...</p>
					)}
				</section>
			</div>
		</div>
	);
}

export default MenuTest;
