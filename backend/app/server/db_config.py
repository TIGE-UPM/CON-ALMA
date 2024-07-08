from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Enum, JSON, Float, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Assessment(Base):
	__tablename__ = 'assessment'
	id = Column(Integer, primary_key=True, autoincrement=True)
	title = Column(String, nullable=False)
	image = Column(String)
	archived = Column(Boolean, default=False)
	actual_assessment_id = Column(Integer, default=None)
	questions = relationship("Question", backref="assessment", cascade="all, delete-orphan")
	assessmentInstances = relationship("AssessmentInstance", backref="assessment", cascade="all, delete-orphan")
	createdAt = Column(DateTime)
	updatedAt = Column(DateTime)

class Question(Base):
	__tablename__ = 'question'
	id = Column(Integer, primary_key=True, autoincrement=True)
	assessment_id = Column(Integer, ForeignKey('assessment.id'), nullable=False)
	title = Column(String, nullable=False)
	image = Column(String)
	questionType = Column(Enum('text', 'number', 'select'), nullable=False)
	questionOrder = Column(Integer, nullable=False)
	selectOptions = Column(JSON)
	createdAt = Column(DateTime)
	updatedAt = Column(DateTime)

class AssessmentInstance(Base):
	__tablename__ = 'assessment_instance'
	id = Column(Integer, primary_key=True, autoincrement=True)
	title = Column(String, nullable=False)
	assessment_id = Column(Integer, ForeignKey('assessment.id'), nullable=False)
	users = relationship("User", backref="assessment_instance", cascade="all, delete-orphan", foreign_keys='User.assessment_instance_id')
	actual_user_id = Column(Integer, ForeignKey('user.id'), default=None, nullable=True)
	active = Column(Boolean, default=False)
	finished = Column(Boolean, default=False)
	answers = relationship("Answer", backref="assessment_instance", cascade="all, delete-orphan")
	createdAt = Column(DateTime)
	updatedAt = Column(DateTime)


class User(Base):
	__tablename__ = 'user'
	id = Column(Integer, primary_key=True, autoincrement=True)
	name = Column(String, nullable=False)
	email = Column(String, nullable=False)
	assessment_instance_id = Column(Integer, ForeignKey('assessment_instance.id'), nullable=False)
	order = Column(Integer, nullable=False)
	group = Column(Integer, nullable=False)
	pin = Column(String, nullable=False)
	voteEveryone = Column(Boolean, default=False)
	createdAt = Column(DateTime)
	updatedAt = Column(DateTime)

	__table_args__ = (
			UniqueConstraint('assessment_instance_id', 'order', name='unique_assessment_instance_order'),
			UniqueConstraint('assessment_instance_id', 'pin', name='unique_assessment_instance_pin'),
			UniqueConstraint('assessment_instance_id', 'name', name='unique_assessment_instance_name'),
			UniqueConstraint('assessment_instance_id', 'email', name='unique_assessment_instance_email'),
		)

class Answer(Base):
	__tablename__ = 'answer'
	id = Column(Integer, primary_key=True, autoincrement=True)
	assessment_instance_id = Column(Integer, ForeignKey('assessment_instance.id'), nullable=False)
	question_id = Column(Integer, ForeignKey('question.id'), nullable=False)
	grading_user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
	graded_user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
	answerText = Column(String)
	date = Column(DateTime)
	createdAt = Column(DateTime)
	updatedAt = Column(DateTime)

	__table_args__ = (
			UniqueConstraint('assessment_instance_id', 'question_id', 'grading_user_id', 'graded_user_id', name='unique_assessment_instance_question_grading_user_graded_user'),
			CheckConstraint('grading_user_id != graded_user_id', name='check_grading_graded_user_different'),
		)

# class Game(Base):
# 	__tablename__ = 'game'
# 	id = Column(Integer, primary_key=True, autoincrement=True)
# 	test_id = Column(Integer, ForeignKey('test.id'))
# 	playedAt = Column(DateTime)
# 	results = relationship("Result", backref="game", cascade="all, delete-orphan")

# class Result(Base):
# 	__tablename__ = 'result'
# 	id = Column(Integer, primary_key=True, autoincrement=True)
# 	player_id = Column(Integer, ForeignKey('player.id'))
# 	game_id = Column(Integer, ForeignKey('game.id'))
# 	score = Column(Integer, nullable=False)
# 	solutions = relationship("Solution", backref="result", cascade="all, delete-orphan")

# class Solution(Base):
# 	__tablename__ = 'solution'
# 	id = Column(Integer, primary_key=True, autoincrement=True)
# 	result_id = Column(Integer, ForeignKey('result.id'))
# 	question_id = Column(Integer, ForeignKey('question.id'))
# 	answer_id = Column(Integer, ForeignKey('answer.id'))
# 	time = Column(Float, nullable=False)

engine = create_engine('sqlite:///app/db/local.db')
Base.metadata.create_all(engine)
