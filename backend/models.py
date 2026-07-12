# models.py
import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False)
    token = db.Column(db.String(36), default=lambda: str(uuid.uuid4()), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "playerId": self.id,
            "username": self.username,
            "token": self.token
        }

class Leaderboard(db.Model):
    __tablename__ = 'leaderboard'
    
    id = db.Column(db.Integer, primary_key=True)
    puzzle_id = db.Column(db.String(100), nullable=False)
    player_name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    mutations_used = db.Column(db.Integer, nullable=False)
    time_seconds = db.Column(db.Integer, nullable=False)
    sequence = db.Column(db.Text, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, rank=None):
        data = {
            "playerName": self.player_name,
            "score": self.score,
            "mutationsUsed": self.mutations_used,
            "timeSeconds": self.time_seconds,
            "completedAt": self.completed_at.isoformat() + "Z"
        }
        if rank is not None:
            data["rank"] = rank
        return data
