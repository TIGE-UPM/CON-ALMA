from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Enum, Float, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Test(Base):
	__tablename__ = 'test'
	id = Column(Integer, primary_key=True, autoincrement=True)  
	title = Column(String, nullable=False)
	image = Column(String)
	archived = Column(Boolean, default=False)
	actual_test_id = Column(Integer, default=None)
	createdAt = Column(DateTime)
	updatedAt = Column(DateTime)
	questions = relationship("Question", backref="test", cascade="all, delete-orphan")
	games = relationship("Game", backref="test", cascade="all, delete-orphan")

class Question(Base):
	__tablename__ = 'question'
	id = Column(Integer, primary_key=True, autoincrement=True)
	test_id = Column(Integer, ForeignKey('test.id'))
	title = Column(String, nullable=False)
	image = Column(String)
	#questionType = Column(Enum('unica', 'multiple'), nullable=False)
	allocatedTime = Column(Integer, nullable=False)
	questionOrder = Column(Integer)
	weight = Column(Integer, nullable=False)
	answers = relationship("Answer", backref="question", cascade="all, delete-orphan")
	solutions = relationship("Solution", backref="question", cascade="all, delete-orphan")

class Answer(Base):
	__tablename__ = 'answer'
	id = Column(Integer, primary_key=True, autoincrement=True)
	question_id = Column(Integer, ForeignKey('question.id'))
	title = Column(String, nullable=False)
	isCorrect = Column(Boolean, nullable=False)
	solutions = relationship("Solution", backref="answer", cascade="all, delete-orphan")

class Player(Base):
	__tablename__ = 'player'
	id = Column(Integer, primary_key=True, autoincrement=True)
	name = Column(String, nullable=False, unique=True)
	createdAt = Column(DateTime)
	results = relationship("Result", backref="player", cascade="all, delete-orphan")

class Game(Base):
	__tablename__ = 'game'
	id = Column(Integer, primary_key=True, autoincrement=True)
	test_id = Column(Integer, ForeignKey('test.id'))
	playedAt = Column(DateTime)
	results = relationship("Result", backref="game", cascade="all, delete-orphan")

class Result(Base):
	__tablename__ = 'result'
	id = Column(Integer, primary_key=True, autoincrement=True)
	player_id = Column(Integer, ForeignKey('player.id'))
	game_id = Column(Integer, ForeignKey('game.id'))
	score = Column(Integer, nullable=False)
	solutions = relationship("Solution", backref="result", cascade="all, delete-orphan")

class Solution(Base):
	__tablename__ = 'solution'
	id = Column(Integer, primary_key=True, autoincrement=True)
	result_id = Column(Integer, ForeignKey('result.id'))
	question_id = Column(Integer, ForeignKey('question.id'))
	answer_id = Column(Integer, ForeignKey('answer.id'))
	time = Column(Float, nullable=False)

engine = create_engine('sqlite:///app/db/local.db')
Base.metadata.create_all(engine)
