# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Player, Leaderboard
from bio_utils import evaluate_organism, calculate_traits, calculate_folding_stability, translate_sequence

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests from the Next.js frontend

# Load config
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Use SQLite locally inside the backend folder
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'synthetica.db')
    DATABASE_URL = f"sqlite:///{db_path}"
else:
    # Support pure-python pg8000 dialect for deployment
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Helper for calculation rules
BASE_POINTS = 1000
MUTATION_PENALTY = 100
TIME_PENALTY = 2
MIN_SCORE = 100

def compute_score(mutations_used, time_seconds, survived):
    if not survived:
        return 0, 0
    mutation_penalty = MUTATION_PENALTY * mutations_used
    time_penalty = TIME_PENALTY * int(time_seconds)
    raw_score = BASE_POINTS - mutation_penalty - time_penalty
    score = max(MIN_SCORE, raw_score)
    stars = 3 if score >= 700 else (2 if score >= 400 else 1)
    return score, stars

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "Welcome to the Synthetica: The Genome Editor API",
        "status": "online",
        "endpoints": {
            "health": "/api/health",
            "register": "/api/auth/register",
            "evaluate": "/api/evaluate",
            "leaderboard": "/api/leaderboard"
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health():
    try:
        # Simple test to make sure DB connection works
        db.session.execute(db.select(1)).scalar()
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    
    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400
        
    # Check if user already exists
    player = Player.query.filter_by(username=username).first()
    if player:
        return jsonify({
            "success": True,
            "playerId": player.id,
            "token": player.token,
            "username": player.username
        }), 200
        
    # Register new player
    try:
        player = Player(username=username)
        db.session.add(player)
        db.session.commit()
        return jsonify({
            "success": True,
            "playerId": player.id,
            "token": player.token,
            "username": player.username
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json() or {}
    puzzle_id = data.get('puzzleId')
    sequence = data.get('sequence', '').strip().upper()
    mutations = data.get('mutations', [])
    time_seconds = data.get('timeSeconds', 0)
    
    if not puzzle_id or not sequence:
        return jsonify({"success": False, "message": "Missing puzzleId or sequence"}), 400
        
    try:
        # Evaluate DNA viability and properties
        eval_result = evaluate_organism(puzzle_id, sequence)
        survived = eval_result["survived"]
        
        # Scoring logic
        score, stars = compute_score(len(mutations), time_seconds, survived)
        
        # Prepare evaluation response payload matching Next.js types
        compilation_result = {
            "survived": survived,
            "score": score,
            "stars": stars,
            "mutationsUsed": len(mutations),
            "timeSeconds": time_seconds,
            "proteinStructure": {
                "aminoAcids": eval_result["aminoAcids"],
                "foldingStability": eval_result["stability"]
            },
            "survivalResult": {
                "environmentalStress": eval_result.get("failurePhase", 0) if not survived else 0, # stress/phase info
                "organismResilience": eval_result["stability"],
                "failurePoint": eval_result.get("failurePoint"),
                "failureReason": eval_result.get("failureReason"),
                "failurePhase": eval_result.get("failurePhase")
            },
            "traits": [
                {
                    "trait": trait_key,
                    "label": trait_key.replace("_", " ").title(),
                    "level": val,
                    "required": eval_result.get("required_level", 0),  # optional
                    "met": True  # check met status if needed per trait
                }
                for trait_key, val in eval_result["traits"].items()
            ]
        }
        
        # Fill met status for traits
        puzzle_reqs = eval_result.get("target_traits", {})
        for t in compilation_result["traits"]:
            req_min = eval_result.get("target_traits", {}).get(t["trait"], 0)
            t["required"] = req_min
            t["met"] = t["level"] >= req_min
            
        return jsonify({
            "success": True,
            "result": compilation_result
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    puzzle_id = request.args.get('puzzleId')
    
    try:
        query = Leaderboard.query
        if puzzle_id:
            query = query.filter_by(puzzle_id=puzzle_id)
            
        # Top scores: higher score first, then fewer mutations, then faster time
        results = query.order_by(
            Leaderboard.score.desc(),
            Leaderboard.mutations_used.asc(),
            Leaderboard.time_seconds.asc()
        ).limit(10).all()
        
        total_players = db.session.query(db.func.count(db.distinct(Leaderboard.player_name))).scalar()
        
        entries = []
        for idx, entry in enumerate(results):
            # Compute stars for formatting
            _, stars = compute_score(entry.mutations_used, entry.time_seconds, True)
            data = entry.to_dict(rank=idx + 1)
            data["stars"] = stars
            entries.append(data)
            
        return jsonify({
            "entries": entries,
            "totalPlayers": total_players or 0
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/leaderboard', methods=['POST'])
def submit_score():
    data = request.get_json() or {}
    puzzle_id = data.get('puzzleId')
    score = data.get('score')
    mutations_used = data.get('mutationsUsed')
    time_seconds = data.get('timeSeconds')
    sequence = data.get('sequence')
    player_name = data.get('playerName', '').strip()
    
    if not all([puzzle_id, score is not None, mutations_used is not None, time_seconds is not None, sequence, player_name]):
        return jsonify({"success": False, "message": "Missing required score parameters"}), 400
        
    try:
        # Check authorization if authorization header is provided
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            player = Player.query.filter_by(token=token).first()
            if player and player.username != player_name:
                return jsonify({"success": False, "message": "Unauthorized player identity"}), 403
                
        entry = Leaderboard(
            puzzle_id=puzzle_id,
            player_name=player_name,
            score=score,
            mutations_used=mutations_used,
            time_seconds=time_seconds,
            sequence=sequence
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify({"success": True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    # Run locally
    app.run(host='0.0.0.0', port=5000, debug=True)
