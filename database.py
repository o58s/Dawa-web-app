from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:Xaseelkhsroo_1@localhost:5432/Dawa"
    SQLALCHEMY_TRACK_MODIFICATIONS = False