from fastapi import FastAPI, Response, HTTPException, WebSocket, WebSocketDisconnect, WebSocketException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Json
import json
from datetime import datetime
from sqlalchemy import create_engine, func, or_
from sqlalchemy.orm import sessionmaker
from typing import List, Optional, Literal
import random
from dataclasses import dataclass
from starlette.websockets import WebSocketState
import json
import asyncio
import csv
import jwt
from io import StringIO
from .config import Settings

from .db_config import Assessment, Question, AssessmentInstance, User, Answer

settings = Settings()

USERS_TOKEN = {}
ADMIN_TOKEN = None

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000"],  # Permite las solicitudes desde el puerto 3000
	allow_origin_regex='http://.*:3000',
	allow_credentials=True,
	allow_methods=["*"],  # Permite todos los métodos
	allow_headers=["*"],  # Permite todos los encabezados
)

engine = create_engine('sqlite:///app/db/local.db')
Session = sessionmaker(bind=engine)
session = Session()

# Modelo de datos para el login
class JSON_Login(BaseModel):
	username: str
	password: Optional[str]

class JSON_User_Login(BaseModel):
	pin: str

class JSON_User_Input(BaseModel):
	name: str
	email: str
	order: int
	group: int
	voteEveryone: bool

class JSON_SelectOptions(BaseModel):
	title: str

	def to_dict(self):
		return {
			"title": self.title
		}

	@classmethod
	def from_dict(cls, data):
		return cls(**data)

class JSON_Question_Input(BaseModel):
	title: str
	image: Optional[str]
	questionType: Literal['text', 'number', 'select']
	questionOrder: int
	selectOptions: Optional[List[JSON_SelectOptions]]

class JSON_Assessment_Input(BaseModel):
	title: str
	image: Optional[str]
	questions: List[JSON_Question_Input]

class JSON_AssessmentInstance_Input(BaseModel):
	title: str

class JSON_AssessmentInstance_Users_Input(BaseModel):
	users: List[JSON_User_Input]

class JSON_User_Login(BaseModel):
	pin: str

class JSON_Answer_Input(BaseModel):
	question_id: int
	answerText: str

class JSON_User_Answer_Inputs(BaseModel):
	answers: List[JSON_Answer_Input]

class JSON_Question_Edit_Input(BaseModel):
	id: Optional[int]
	title: Optional[str]
	image: Optional[str]
	questionType: Literal['text', 'number', 'select']
	questionOrder: Optional[int]
	selectOptions: Optional[List[JSON_SelectOptions]]

class JSON_Assessment_Edit_Input(BaseModel):
	title: Optional[str]
	image: Optional[str]
	questions: Optional[List[JSON_Question_Edit_Input]]
	deletedQuestionsIds: Optional[List[int]]

# Modelos de los JSON de salida

class JSON_Question_Output(BaseModel):
	id: int
	assessment_id: int
	title: str
	image: Optional[str]
	questionType: Literal['text', 'number', 'select']
	questionOrder: int
	selectOptions: Optional[List[JSON_SelectOptions]]

class JSON_User_Output(BaseModel):
	id: int
	name: str
	email: str
	order: int
	group: int
	pin: str
	voteEveryone: bool

class JSON_Answer_Output(BaseModel):
	id: int
	assessment_instance_id: int
	question_id: int
	grading_user_id: int
	graded_user_id: int
	answerText: str
	date: datetime

class JSON_Assessment_Output(BaseModel):
	id: int
	title: str
	image: Optional[str]
	archived: bool
	questions: Optional[List[JSON_Question_Output]]

class JSON_AssessmentInstance_Output(BaseModel):
	id: int
	title: str
	assessment_id: int
	users: Optional[List[JSON_User_Output]]
	actual_user: Optional[JSON_User_Output]
	active: bool
	finished: bool
	answers: Optional[List[JSON_Answer_Output]]
	assessment: Optional[JSON_Assessment_Output]

class JSON_Assessment_AssessmentInstances_Output(BaseModel):
	id: int
	title: str
	assessmentInstances: Optional[List[JSON_AssessmentInstance_Output]]

class JSON_Assessment_Full_Output(BaseModel):
	id: int
	title: str
	image: Optional[str]
	archived: bool
	createdAt: datetime
	updatedAt: datetime
	questions: Optional[List[JSON_Question_Output]]
	assessmentInstances: Optional[List[JSON_AssessmentInstance_Output]]
	createdAt: datetime
	updatedAt: datetime

@dataclass
class Connection:
	is_admin: bool
	websocket: WebSocket
class ConnectionManager:
	def __init__(self):
		self.active_connections: list[Connection] = []

	async def connect(self, websocket: WebSocket, is_admin: bool = False):
		await websocket.accept()
		self.active_connections.append(Connection(is_admin, websocket))

	def disconnect(self, websocket: WebSocket, is_admin: bool = False):
		self.active_connections.remove(Connection(is_admin, websocket))

	async def send_personal_message(self, message: Json, websocket: WebSocket):
		await websocket.send_text(message)

	async def broadcast_admin(self, message: Json):
		for connection in self.active_connections:
			if connection.is_admin is True:
				await connection.websocket.send_text(message)

	async def broadcast_users(self, message: Json):
		for connection in self.active_connections:
			if connection.is_admin is False:
				await connection.websocket.send_text(message)

	async def receive_text(self, websocket: WebSocket):
		message = await websocket.receive_text()
		return message

manager = ConnectionManager()

# FUNCIONES
async def check_is_admin(token: str):
	if not token:
		raise HTTPException(status_code=401, detail="Fallo de sesión")
	token_payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
	if not token_payload.get('is_admin'):
		raise HTTPException(status_code=401, detail="No eres administrador")
	return True

async def is_admin(token: str):
	if not token:
		raise HTTPException(status_code=401, detail="Fallo de sesión")
	token_payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
	if not token_payload.get('is_admin'):
		return False
	return True

async def get_token_user_id(token: str):
	if not token:
		raise HTTPException(status_code=401, detail="Fallo de sesión")
	token_payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
	if token_payload.get('is_admin'):
		raise HTTPException(status_code=401, detail="Eres administrador")
	return token_payload.get('user_id')

# RUTAS DE SESION
@app.post("/login")
async def login(input_data: JSON_Login):
	user = input_data.username
	password = input_data.password

	if user == settings.admin_user:
		if password == settings.admin_password:
			token = jwt.encode({"is_admin": True}, settings.jwt_secret, algorithm="HS256")
			return {"detail": "Autenticación como administrador exitosa", "token": token}
		else:
			raise HTTPException(status_code=401, detail="Nombre o contraseña incorrecta")

# RUTAS DE ASSESSMENTS
@app.get("/assessment/all/token={token}", response_model=List[JSON_Assessment_Full_Output])
async def get_all_assessments(token: str):
	await check_is_admin(token)
	try:
		all_assessments = session.query(Assessment).filter(Assessment.actual_assessment_id.is_(None)).all()

		if not all_assessments:
			raise HTTPException(status_code=404, detail="No hay assessment")

		response = []

		for assessment in all_assessments:
			assessment_data = JSON_Assessment_Full_Output(
				id=assessment.id,
				title=assessment.title,
				image=assessment.image,
				archived=assessment.archived,
				createdAt=assessment.createdAt.isoformat() if assessment.createdAt else None,
				updatedAt=assessment.updatedAt.isoformat() if assessment.updatedAt else None,
				questions=None,
				assessmentInstances=None
			)

			response.append(assessment_data)

		return response
	except HTTPException as e:
		raise e
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error al obtener las evaluaciones: {str(e)}")
	finally:
		session.close()

@app.get("/assessment/{ID}/view/token={token}", response_model=JSON_Assessment_Full_Output)
async def get_assessment_by_ID(token: str, ID: int):
	await check_is_admin(token)
	try:
		assessment = session.query(Assessment).filter(Assessment.id == ID).first()
		if assessment is None:
			raise HTTPException(status_code=404, detail="Assessment no encontrado")

		questions_data = [
			JSON_Question_Output(
				id=question.id,
				assessment_id=question.assessment_id,
				title=question.title,
				image=question.image,
				questionType=question.questionType,
				questionOrder=question.questionOrder,
				selectOptions=[JSON_SelectOptions(title=option['title']) for option in question.selectOptions]
			) for question in assessment.questions
		]

		response = JSON_Assessment_Full_Output(
			id=assessment.id,
			title=assessment.title,
			image=assessment.image,
			archived=assessment.archived,
			createdAt=assessment.createdAt,
			updatedAt=assessment.updatedAt,
			questions=questions_data,
			assessmentInstances=None
		)

		return response
	except HTTPException as e:
		raise e
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error al obtener la evaluación: {str(e)}")
	finally:
		session.close()

@app.delete("/assessment/{ID}/delete/token={token}")
async def delete_assessment_by_ID(token: str, ID: int):
	await check_is_admin(token)
	try:
		assessments_to_delete = session.query(Assessment).filter(or_(Assessment.id == ID, Assessment.actual_assessment_id == ID)).all()

		if not assessments_to_delete:
			raise HTTPException(status_code=404, detail="Assessment no encontrado")

		# Eliminar todos los Assessments encontrados
		for assessment in assessments_to_delete:
			session.delete(assessment)

		session.commit()

	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al eliminar la evaluación: {str(e)}")
	finally:
		session.close()

@app.post("/assessment/{ID}/archive/token={token}")
async def toggle_archive_assessment(token: str, ID: int):
	await check_is_admin(token)
	try:
		assessment = session.query(Assessment).filter(Assessment.id == ID).first()
		if assessment is None:
			raise HTTPException(status_code=404, detail="Assessment no encontrado")

		assessment.archived = not assessment.archived
		assessment.updatedAt = datetime.now()
		session.commit()
		return {"detail": "Assessment archivado" if assessment.archived else "Assessment desarchivado"}

	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al archivar la evaluación: {str(e)}")
	finally:
		session.close()

@app.post("/assessment/create/token={token}")
async def create_assessment(token: str, input_data: JSON_Assessment_Input):
	await check_is_admin(token)
	try:
		existing_assessment = session.query(Assessment).filter(Assessment.title == input_data.title).first()

		if existing_assessment is not None:
			raise HTTPException(status_code=400, detail="Ya existe un assessment con este título")

		new_assessment = Assessment(
			title=input_data.title,
			image=input_data.image,
			createdAt=datetime.now(),
			updatedAt=datetime.now()
		)
		session.add(new_assessment)
		session.flush()

		if not input_data.questions:
			raise HTTPException(status_code=400, detail="No hay pregunta_raws para guardar")

		for question_data in input_data.questions:
			new_question = Question(
				assessment_id=new_assessment.id,
				title=question_data.title,
				image=question_data.image,
				questionType=question_data.questionType,
				questionOrder=question_data.questionOrder,
				selectOptions=[option.to_dict() for option in question_data.selectOptions],
				createdAt=datetime.now(),
				updatedAt=datetime.now()
			)
			session.add(new_question)
			session.flush()

		session.commit()
		return {"detail": "Assessment creado correctamente con ID: {}".format(new_assessment.id)}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al crear el assessment: {str(e)}")
	finally:
		session.close()

@app.put("/assessment/{ID}/edit/token={token}")
async def edit_assessment(token: str, ID: int, input_data: JSON_Assessment_Edit_Input):
	await check_is_admin(token)
	try:
		assessment = session.query(Assessment).filter(Assessment.id == ID).first()
		if assessment is None:
			raise HTTPException(status_code=404, detail="Assessment no encontrado")
		if assessment.assessmentInstances:
			new_assessment = Assessment(
				title=input_data.title,
				image=input_data.image,
				createdAt=datetime.now(),
				updatedAt=datetime.now()
			)
			session.add(new_assessment)
			session.flush()

			if not input_data.questions:
				raise HTTPException(status_code=400, detail="No hay preguntas para guardar")

			for question_data in input_data.questions:
				new_question = Question(
					assessment_id=new_assessment.id,
					title=question_data.title,
					image=question_data.image,
					questionType=question_data.questionType,
					questionOrder=question_data.questionOrder,
					selectOptions=[option.to_dict() for option in question_data.selectOptions]
				)
				session.add(new_question)
				session.flush()

			session.commit()

			assessments_to_update = session.query(Assessment).filter(or_(Assessment.id == ID, Assessment.actual_assessment_id == ID)).all()
			for assessment in assessments_to_update:
				assessment.actual_assessment_id = new_assessment.id
		else:
			if input_data.title:
				assessment.title = input_data.title
			if input_data.image:
				assessment.image = input_data.image
			if input_data.questions:
				for question_data in input_data.questions:
					if question_data.id:
						question = session.query(Question).filter(Question.id == question_data.id).first()
						if question:
							question.title = question_data.title
							question.image = question_data.image
							question.questionType = question_data.questionType
							question.questionOrder = question_data.questionOrder
							question.selectOptions = [option.to_dict() for option in question_data.selectOptions]
					else:
						new_question = Question(
							assessment_id=assessment.id,
							title=question_data.title,
							image=question_data.image,
							questionType=question_data.questionType,
							questionOrder=question_data.questionOrder,
							selectOptions=[option.to_dict() for option in question_data.selectOptions]
						)
						session.add(new_question)

			if input_data.deletedQuestionsIds:
				for question_id in input_data.deletedQuestionsIds:
					question = session.query(Question).filter(Question.id == question_id).first()
					if question:
						session.delete(question)

		session.commit()
		return {"detail": "Assessment editado correctamente"}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al editar la evaluación: {str(e)}")
	finally:
		session.close()

# RUTAS DE ASSESSMENT INSTANCES
@app.get("/assessment/{id}/assessment-instance/all/token={token}", response_model=JSON_Assessment_AssessmentInstances_Output)
async def get_all_assessment_instances(token: str, id: int):
	await check_is_admin(token)
	try:
		assessment = session.query(Assessment).filter(Assessment.id == id).first()
		print(assessment)
		if not assessment:
			raise HTTPException(status_code=404, detail="Evaluación no encontrada")

		assessmentInstances_data = []
		for instance in assessment.assessmentInstances:
			response_data = JSON_AssessmentInstance_Output(
				id=instance.id,
				title=instance.title,
				assessment_id=instance.assessment_id,
				users=sorted(
					[
						JSON_User_Output(
							id=user.id,
							name=user.name,
							email=user.email,
							order=user.order,
							group=user.group,
							pin=user.pin,
							voteEveryone=user.voteEveryone
						) for user in instance.users
					],
					key=lambda user: user.order
				),
				actual_user=None,
				active=instance.active,
				finished=instance.finished,
				answers=None,
				assessment=None
			)
			assessmentInstances_data.append(response_data)
		response = JSON_Assessment_AssessmentInstances_Output(
			id=assessment.id,
			title=assessment.title,
			assessmentInstances=assessmentInstances_data
		)
		return response
	except HTTPException as e:
		raise e
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error al obtener las evaluaciones: {str(e)}")
	finally:
		session.close()

@app.post("/assessment/{id}/assessment-instance/create/token={token}")
async def create_assessment_instance(token: str, id: int, input_data: JSON_AssessmentInstance_Input):
	await check_is_admin(token)
	try:
		assessment = session.query(Assessment).filter(Assessment.id == id).first()
		if not assessment:
			raise HTTPException(status_code=404, detail="Evaluación no encontrada")

		new_assessmentInstance = AssessmentInstance(
			title=input_data.title,
			assessment_id=assessment.id,
		)
		session.add(new_assessmentInstance)
		session.flush()

		session.commit()

		return {"detail": "Evaluación guardada correctamente con ID: {}".format(new_assessmentInstance.id)}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al guardar evaluación: {str(e)}")
	finally:
		session.close()

@app.get("/assessment-instance/active/token={token}", response_model=JSON_AssessmentInstance_Output)
async def get_active_assessment_instance(token: str):
	try:
		token_is_admin = await (is_admin(token))
		users_data = None
		answers_data = None
		assessment_data = None
		assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.active == True).first()
		if not assessmentInstance:
			raise HTTPException(status_code=404, detail="Evaluación no encontrada")
		actual_user = session.query(User).filter(User.id == assessmentInstance.actual_user_id).first()
		actual_user_data = JSON_User_Output(
			id=actual_user.id,
			name=actual_user.name,
			email=actual_user.email,
			order=actual_user.order,
			group=actual_user.group,
			pin=actual_user.pin,
			voteEveryone=actual_user.voteEveryone
		) if actual_user else None

		answers = session.query(Answer).filter(Answer.assessment_instance_id == assessmentInstance.id, Answer.graded_user_id == actual_user.id).all()
		if len(answers) > 0:
			answers_data = [
				JSON_Answer_Output(
					id=answer.id,
					assessment_instance_id=answer.assessment_instance_id,
					question_id=answer.question_id,
					grading_user_id=answer.grading_user_id,
					graded_user_id=answer.graded_user_id,
					answerText=answer.answerText,
					date=answer.date
				) for answer in answers
			]
		if token_is_admin:
			users_data = sorted(
					[
					JSON_User_Output(
						id=user.id,
						name=user.name,
						email=user.email,
						order=user.order,
						group=user.group,
						pin=user.pin,
						voteEveryone=user.voteEveryone
					) for user in assessmentInstance.users
				],
				key=lambda user: user.order
			)
		else:
			user_id = await get_token_user_id(token)
			user = session.query(User).filter(User.id == user_id).first()
			if not user:
				raise HTTPException(status_code=404, detail="Usuario no encontrado")

			if user.assessment_instance_id != assessmentInstance.id:
				raise HTTPException(status_code=404, detail="Usuario no encontrado en esta evaluación")

			assessment = session.query(Assessment).filter(Assessment.id == assessmentInstance.assessment_id).first()
			assessment_data = JSON_Assessment_Output(
				id=assessment.id,
				title=assessment.title,
				image=assessment.image,
				archived=assessment.archived,
				questions= sorted(
					[
						JSON_Question_Output(
							id=question.id,
							assessment_id=question.assessment_id,
							title=question.title,
							image=question.image,
							questionType=question.questionType,
							questionOrder=question.questionOrder,
							selectOptions= [JSON_SelectOptions.from_dict(option) for option in question.selectOptions]
						) for question in assessment.questions
					],
					key=lambda question: question.questionOrder
				)
			)
			if len(answers) > 0:
				filtered_answers = [answer for answer in answers if (answer.grading_user_id == user.id and answer.graded_user_id == actual_user.id)]
				answers_data = [
					JSON_Answer_Output(
						id=answer.id,
						assessment_instance_id=answer.assessment_instance_id,
						question_id=answer.question_id,
						grading_user_id=answer.grading_user_id,
						graded_user_id=answer.graded_user_id,
						answerText=answer.answerText,
						date=answer.date
					) for answer in filtered_answers
				]

			if not user.voteEveryone and user.group != actual_user.group or actual_user.id == user.id:
				assessment_data = None
				actual_user_data = None

		response = JSON_AssessmentInstance_Output(
			id=assessmentInstance.id,
			title=assessmentInstance.title,
			assessment_id=assessmentInstance.assessment_id,
			users=users_data,
			actual_user=actual_user_data,
			active=assessmentInstance.active,
			finished=assessmentInstance.finished,
			answers=answers_data,
			assessment=assessment_data
		)
		return response
	except HTTPException as e:
		raise e
	except Exception as e:
		print("/active", e)
		raise HTTPException(status_code=500, detail=f"Error al obtener la evaluación: {str(e)}")
	finally:
		session.close()

@app.get("/assessment-instance/{ID}/token={token}", response_model=JSON_AssessmentInstance_Output)
async def get_assessment_instance_by_ID(token: str, ID: int):
	token_is_admin = await (check_is_admin(token))
	if token_is_admin:
		try:
			assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.id == ID).first()
			if not assessmentInstance:
				raise HTTPException(status_code=404, detail="Evaluación no encontrada")

			users_data = sorted(
				[
					JSON_User_Output(
						id=user.id,
						name=user.name,
						email=user.email,
						order=user.order,
						group=user.group,
						pin=user.pin,
						voteEveryone=user.voteEveryone
					) for user in assessmentInstance.users
				],
				key=lambda user: user.order
			)

			assessment = session.query(Assessment).filter(Assessment.id == assessmentInstance.assessment_id).first()
			if not assessment:
				raise HTTPException(status_code=404, detail="Evaluación no encontrada")

			assessment_data = JSON_Assessment_Output(
				id=assessment.id,
				title=assessment.title,
				image=assessment.image,
				archived=assessment.archived,
				questions=sorted(
					[
						JSON_Question_Output(
							id=question.id,
							assessment_id=question.assessment_id,
							title=question.title,
							image=question.image,
							questionType=question.questionType,
							questionOrder=question.questionOrder,
							selectOptions=[JSON_SelectOptions.from_dict(option) for option in question.selectOptions]
						) for question in assessment.questions
					],
					key=lambda question: question.questionOrder
				)
			)

			answers = session.query(Answer).filter(Answer.assessment_instance_id == assessmentInstance.id).all()
			if len(answers) > 0:
				answers_data = [
					JSON_Answer_Output(
						id=answer.id,
						assessment_instance_id=answer.assessment_instance_id,
						question_id=answer.question_id,
						grading_user_id=answer.grading_user_id,
						graded_user_id=answer.graded_user_id,
						answerText=answer.answerText,
						date=answer.date
					) for answer in answers
				]
			else:
				answers_data = None

			response = JSON_AssessmentInstance_Output(
				id=assessmentInstance.id,
				title=assessmentInstance.title,
				assessment_id=assessmentInstance.assessment_id,
				users=users_data,
				active=assessmentInstance.active,
				actual_user=None,
				finished=assessmentInstance.finished,
				answers=answers_data,
				assessment=assessment_data
			)

			return response
		except HTTPException as e:
			raise e
		except Exception as e:
			raise HTTPException(status_code=500, detail=f"Error al obtener la evaluación: {str(e)}")
		finally:
			session.close()
	else:
		user_id = await get_token_user_id(token)
		try:
			user = session.query(User).filter(User.id == user_id).first()
			if not user:
				raise HTTPException(status_code=404, detail="Usuario no encontrado")

			assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.id == ID).first()
			if not assessmentInstance:
				raise HTTPException(status_code=404, detail="Evaluación no encontrada")

			if user.assessment_instance_id != assessmentInstance.id:
				raise HTTPException(status_code=404, detail="Usuario no encontrado en esta evaluación")

			assessment = session.query(Assessment).filter(Assessment.id == assessmentInstance.assessment_id).first()

			response = JSON_AssessmentInstance_Output(
				id=assessmentInstance.id,
				title=assessmentInstance.title,
				assessment_id=assessmentInstance.assessment_id,
				users=None,
				actual_user=None,
				active=assessmentInstance.active,
				finished=assessmentInstance.finished,
				answers=None,
				assessment=JSON_Assessment_Output(
					id=assessment.id,
					title=assessment.title,
					image=assessment.image,
					archived=assessment.archived,
					questions=sorted(
						[
							JSON_Question_Output(
								id=question.id,
								assessment_id=question.assessment_id,
								title=question.title,
								image=question.image,
								questionType=question.questionType,
								questionOrder=question.questionOrder,
								selectOptions=[JSON_SelectOptions.from_dict(option) for option in question.selectOptions]
							) for question in assessment.questions
						],
						key=lambda question: question.questionOrder
					)
				)
			)

			return response
		except HTTPException as e:
			raise e
		except Exception as e:
			raise HTTPException(status_code=500, detail=f"Error al obtener la evaluación: {str(e)}")
		finally:
			session.close()

def generate_unique_pin(session, assessment_instance_id: int) -> str:
	while True:
		pin = "".join([str(random.randint(0, 9)) for _ in range(6)])
		existing_user = session.query(User).filter_by(assessment_instance_id=assessment_instance_id, pin=pin).first()
		if not existing_user:
			return pin

@app.post("/assessment-instance/{ID}/users/upload/token={token}")
async def add_users_from_csv(token: str, ID: int, file: UploadFile = File(...)):
	await check_is_admin(token)
	try:
		assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.id == ID).first()
		if not assessmentInstance:
			raise HTTPException(status_code=404, detail="Evaluación no encontrada")

		content = await file.read()
		file_content = StringIO(content.decode("utf-8"))
		csv_reader = csv.DictReader(file_content)

		for row in csv_reader:
			unique_pin = generate_unique_pin(session, assessmentInstance.id)
			new_user = User(
				name=row["name"],
				email=row["email"],
				assessment_instance_id=assessmentInstance.id,
				order=row["order"],
				group=row["group"],
				pin=unique_pin,
				voteEveryone=row["voteEveryone"] == "True" #TODO voteEveryone se tiene que rellenar como "True" para que sea True, con cualquier otro valor será False
			)
			session.add(new_user)
			session.flush()

		session.commit()

		return {"detail": "Usuarios guardados correctamente"}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al guardar usuarios: {str(e)}")
	finally:
		session.close()

@app.delete("/assessment-instance/{ID}/delete/token={token}")
async def delete_assessment_instance_by_ID(token: str, ID: int):
	await check_is_admin(token)
	try:
		assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.id == ID).first()
		if not assessmentInstance:
			raise HTTPException(status_code=404, detail="Evaluación no encontrada")

		session.delete(assessmentInstance)
		session.commit()

		return {"detail": "Evaluación eliminada correctamente"}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		raise HTTPException(status_code=500, detail=f"Error al eliminar la evaluación: {str(e)}")
	finally:
		session.close()

@app.websocket("/assessment-instance/{id}/start/token={token}")
async def start_assessment_instance(websocket: WebSocket,id: int, token: str):
	await manager.connect(websocket, is_admin=True)
	await check_is_admin(token)
	try:
		assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.id == id).first()
		if not assessmentInstance:
			raise WebSocketException(code=1003, reason="Evaluación no encontrada")
		if assessmentInstance.active is True:
			raise WebSocketException(code=1003, reason="Evaluación ya está activa")
		if assessmentInstance.finished is True:
			raise WebSocketException(code=1003, reason="Evaluación ya está finalizada")
		active_assessment_instance = session.query(AssessmentInstance).filter(AssessmentInstance.active == True).first()
		if active_assessment_instance:
			raise WebSocketException(code=1003, reason="Ya hay una evaluación activa")
		assessmentInstance.active = True
		users = session.query(User).filter(User.assessment_instance_id == id).all()
		sorted_users = sorted(users, key=lambda user: user.order)
		filtered_users = [user for user in sorted_users if user.order != -1]
		assessmentInstance.actual_user_id = filtered_users[0].id
		session.commit()
		info = {
			"mode": "LOBBY",
			"assessment_instance_id": id,
			"actual_user_id": assessmentInstance.actual_user_id,
			"actual_user_name": filtered_users[0].name,
		}
		info_json = json.dumps(info)
		print(info_json)
		await manager.send_personal_message(info_json, websocket=websocket)
		try:
			while True:
				message = await manager.receive_text(websocket)
				if message == "CLOSE":
					assessmentInstance.active = False
					session.commit()
					info = {
						"event": "CLOSE",
					}
					info_json = json.dumps(info)
					await manager.broadcast_admin(info_json)
					await manager.broadcast_users(info_json)
					await manager.disconnect(websocket, is_admin=True)
					break
				if message == "START":
					info = {
						"mode": "PLAYING",
						"event": "REFRESH"
					}
					info_json = json.dumps(info)
					await manager.broadcast_admin(info_json)
					await manager.broadcast_users(info_json)
		except WebSocketDisconnect:
			manager.disconnect(websocket, is_admin=True)
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		print("/start", e)
		raise HTTPException(status_code=500, detail=f"Error al iniciar la evaluación: {str(e)}")
	finally:
		session.close()

@app.post("/next/token={token}")
async def next_user_assessment_instance(token: str):
	await check_is_admin(token)
	try:
		assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.active == True).first()
		if not assessmentInstance:
			raise HTTPException(status_code=404, detail="No hay evaluación activa")

		current_user = session.query(User).filter(User.id == assessmentInstance.actual_user_id).first()
		if not current_user:
			raise HTTPException(status_code=404, detail="No hay usuario actual")
		print('current user', current_user.order)
		assessment_users = session.query(User).filter(User.assessment_instance_id == assessmentInstance.id).all()
		assessment_users = sorted(assessment_users, key=lambda user: user.order)
		assessment_users = filter(lambda user: user.order != -1, assessment_users)
		next_user = None
		for user in assessment_users:
			if user.order > current_user.order:
				next_user = user
				break
		if not next_user:
			assessmentInstance.actual_user_id = None
			assessmentInstance.active = False
			assessmentInstance.finished = True
			session.commit()
			info = {
				"mode": "END",
				"event": "FINISH",
			}
			info_json = json.dumps(info)
			await manager.broadcast_admin(info_json)
			await manager.broadcast_users(info_json)
			return {"detail": "Fin de la evaluación"}
		else:
			assessmentInstance.actual_user_id = next_user.id
			session.commit()
			info = {
				"mode": "LOBBY",
				"event": "REFRESH",
			}
			info_json = json.dumps(info)
			await manager.broadcast_admin(info_json)
			await manager.broadcast_users(info_json)
		return {"detail": "Siguiente usuario"}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		print(e)
		raise HTTPException(status_code=500, detail=f"Error al pasar al siguiente usuario: {str(e)}")
	finally:
		session.close()

# RUTAS DE USUARIOS
@app.post("/user-login")
async def login(input_data: JSON_User_Login):
	active_assessment_instance = session.query(AssessmentInstance).filter(AssessmentInstance.active == True).first()
	if not active_assessment_instance:
		raise HTTPException(status_code=404, detail="No hay evaluación activa")
	trim_pin = input_data.pin.strip()
	user = session.query(User).filter(User.pin == trim_pin, User.assessment_instance_id == active_assessment_instance.id).first()
	if not user:
		raise HTTPException(status_code=404, detail="Usuario no encontrado")

	token = jwt.encode({"user_id": user.id}, settings.jwt_secret, algorithm="HS256")
	return {"detail": "Autenticación exitosa", "token": token}

@app.websocket("/play/token={token}")
async def play(websocket: WebSocket, token: str):
	try:
		await manager.connect(websocket)
		user_id = await get_token_user_id(token)
		info = {
				"mode": "LOBBY",
			}
		info_json = json.dumps(info)
		await manager.send_personal_message(info_json, websocket=websocket)
		user = session.query(User).filter(User.id == user_id).first()
		if not user:
			raise WebSocketException(code=1003, reason="Usuario no encontrado")
		user = {
			"mode": "LOBBY",
			"event": "CONNECT",
			"user_id": user_id,
			"name": user.name,
		}
		user_json = json.dumps(user)
		await manager.broadcast_admin(user_json)
		#  si se desconectam enviar mensaje

		while True:
			message = await manager.receive_text(websocket)
			if message == "CLOSE":
				await manager.disconnect(websocket)
				break
	except WebSocketDisconnect:
		manager.disconnect(websocket)
		info = {
			"event": "DISCONNECT",
			"user_id": user_id
		}
		info_json = json.dumps(info)
		await manager.broadcast_admin(info_json)
	except HTTPException as e:
		raise e
	except Exception as e:
		print("/play", e)
		raise HTTPException(status_code=500, detail=f"Error al iniciar la evaluación: {str(e)}")
	finally:
		session.close()

@app.post("/user/answer/token={token}")
async def add_user_answer(token: str, input_data: JSON_User_Answer_Inputs):
	try:
		user_id = await get_token_user_id(token)
		assessmentInstance = session.query(AssessmentInstance).filter(AssessmentInstance.active == True).first()
		if not assessmentInstance:
			raise HTTPException(status_code=404, detail="No hay evaluación activa")
		user = session.query(User).filter(User.id == user_id, User.assessment_instance_id == assessmentInstance.id).first()
		if not user:
			raise HTTPException(status_code=404, detail="Usuario no encontrado")

		for answer_data in input_data.answers:
			print(answer_data)
			print(answer_data.question_id)
			print(answer_data.answerText)
			new_answer = Answer(
				assessment_instance_id=assessmentInstance.id,
				question_id=answer_data.question_id,
				grading_user_id=user.id,
				graded_user_id=assessmentInstance.actual_user_id,
				answerText=answer_data.answerText,
				date=datetime.now()
			)
			session.add(new_answer)
			session.flush()

		session.commit()
		info = {
			"mode": "PLAYING",
			"event": "REFRESH",
			"user_id": user_id,
		}
		# await manager.send_personal_message(json.dumps(info))
		await manager.broadcast_admin(json.dumps(info))
		return {"detail": "Respuestas guardadas correctamente"}
	except HTTPException as e:
		raise e
	except Exception as e:
		session.rollback()
		print(e)
		raise HTTPException(status_code=500, detail=f"Error al guardar respuestas: {str(e)}")
	finally:
		session.close()
