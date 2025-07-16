from flask import Blueprint, request, jsonify, send_file, Response
from io import StringIO
import csv
from models import db, User, Mood
from collections import Counter
from datetime import datetime, timedelta
from dateutil import parser

routes = Blueprint('routes', __name__)

# --- USER ROUTES ---

@routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Check if username exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    # Create new user
    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user_id': new_user.id}), 201

@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username
        }
    }), 200



@routes.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'username': u.username} for u in users])


# --- MOOD ROUTES ---

# User Mood stats
@routes.route('/mood-stats', methods=['GET'])
def get_mood_stats():
    user_id = request.args.get('user_id', type=int)
    date_range = request.args.get('range', 'all')

    if not user_id:
        return jsonify({'message': 'Missing user_id'}), 400

    query = Mood.query.filter_by(user_id=user_id)
    
    now = datetime.utcnow()
    if date_range == "7days":
        query = query.filter(Mood.timestamp >= now - timedelta(days=7))
    elif date_range == "month":
        query = query.filter(Mood.timestamp >= now.replace(day=1))
    elif date_range == "custom":
        start = request.args.get("start")
        end = request.args.get("end")
        try:
            start_date = parser.isoparse(start)
            end_date = parser.isoparse(end) + timedelta(days=1) #includes the full end day
            query = query.filter(Mood.timestamp >= start_date, Mood.timestamp <= end_date)
        except Exception as e:
            print("Error parsing custom dates:", e)
            return jsonify({"error": "Invalid custom date range"}), 400

    moods = query.all()
    mood_counts = Counter([mood.mood.lower() for mood in moods])

    return jsonify(mood_counts)
# @routes.route('/mood-stats', methods=['GET'])
# def get_mood_stats():
#     user_id = request.args.get('user_id', type=int)
#     if not user_id:
#         return jsonify({'message': 'Missing user_id'}), 400

#     moods = Mood.query.filter_by(user_id=user_id).all()
#     mood_counts = Counter([mood.mood.lower() for mood in moods])

#     return jsonify(mood_counts)

# Post users Mood
# @routes.route('/moods', methods=['POST'])
# def create_mood():
#     data = request.get_json()
#     new_mood = Mood(mood=data['mood'], user_id=data['user_id'])
#     db.session.add(new_mood)
#     db.session.commit()
#     return jsonify({'message': 'Mood logged', 'id': new_mood.id}), 201
@routes.route('/moods', methods=['POST'])
def create_mood():
    data = request.get_json()
    
    mood_text = data.get('mood')
    user_id = data.get('user_id')
    note = data.get('note')  # grab note if sent, else None
    
    if not mood_text or not user_id:
        return jsonify({'message': 'mood and user_id are required'}), 400

    new_mood = Mood(mood=mood_text, user_id=user_id, note=note)
    db.session.add(new_mood)
    db.session.commit()
    
    return jsonify({'message': 'Mood logged', 'id': new_mood.id}), 201

@routes.route('/mood-trend', methods=['GET'])
def mood_trend():
    user_id = request.args.get('user_id', type=int)
    days = request.args.get('days', default=30, type=int)  # default to 30 days

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    start_date = datetime.utcnow() - timedelta(days=days)
    moods = Mood.query.filter(Mood.user_id == user_id, Mood.timestamp >= start_date).order_by(Mood.timestamp.asc()).all()

    MOOD_SCORES = {
        "ecstatic": 5, "happy": 4, "neutral": 3,
        "sad": 2, "anxious": 1, "angry": 1
    }

    mood_data = [
        {
            "date": mood.timestamp.strftime("%Y-%m-%d"),
            "score": MOOD_SCORES.get(mood.mood.lower(), 3)
        }
        for mood in moods
    ]

    return jsonify(mood_data)


# GET all moods for a user
@routes.route('/moods', methods=['GET'])
def get_moods():
    user_id = request.args.get('user_id')
    date_range = request.args.get('range', 'all')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    query = Mood.query.filter_by(user_id=user_id)

    now = datetime.utcnow()
    if date_range == "7days":
        query = query.filter(Mood.timestamp >= now - timedelta(days=7))
    elif date_range == "month":
        query = query.filter(Mood.timestamp >= now.replace(day=1))
    elif date_range == "custom":
        start = request.args.get("start")
        end = request.args.get("end")
        try:
            start_date = parser.isoparse(start)
            end_date = parser.isoparse(end) + timedelta(days=1) #includes the full end day
            query = query.filter(Mood.timestamp >= start_date, Mood.timestamp <= end_date)
        except Exception as e:
            print("Error parsing custom dates:", e)
            return jsonify({"error": "Invalid custom date range"}), 400
    

    moods = query.order_by(Mood.timestamp.desc()).all()
    return jsonify([
        {
            "id": mood.id,
            "mood": mood.mood,
            "note": mood.note,
            "timestamp": mood.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        } for mood in moods
    ])
    # try:
    #     moods = Mood.query.filter_by(user_id=user_id).order_by(Mood.timestamp.desc()).all()
    #     return jsonify([
    #         {
    #             "id": mood.id,
    #             "mood": mood.mood,
    #             "note": mood.note,
    #             "timestamp": mood.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    #         } for mood in moods
    #     ])
    # except Exception as e:
    #     print(e)
    #     return jsonify({"error": "Failed to fetch moods"}), 500
    

    
# Update Mood
@routes.route('/moods/<int:mood_id>', methods=['PATCH'])
def update_mood(mood_id):
    data = request.get_json()
    new_mood = data.get('mood')
    new_note = data.get('note')

    mood = Mood.query.get(mood_id)
    if not mood:
        return jsonify({'message': 'Mood not found'}), 404

    if new_mood:
        mood.mood = new_mood

    if new_note is not None:
        mood.note = new_note

    db.session.commit()
    return jsonify({'message': 'Mood updated'})


# Delete Mood
@routes.route('/moods/<int:mood_id>', methods=['DELETE'])
def delete_mood(mood_id):
    mood = Mood.query.get(mood_id)
    if not mood:
        return jsonify({'message': 'Mood not found'}), 404

    db.session.delete(mood)
    db.session.commit()
    return jsonify({'message': 'Mood deleted'})


# CSV route
@routes.route('/export-csv', methods=['GET'])
def export_csv():
    user_id = request.args.get('user_id')
    range_option = request.args.get('range', 'all')
    start = request.args.get('start')
    end = request.args.get('end')
    
    if not user_id:
        return {"error": "Missing user_id"}, 400

    query = Mood.query.filter_by(user_id=user_id)

    if range_option == "custom" and start and end:
        try:
            start_date = datetime.strptime(start, "%Y-%m-%d").date()
            end_date = datetime.strptime(end, "%Y-%m-%d").date()
            query = query.filter(Mood.timestamp.between(start_date, end_date + timedelta(days=1)))
        except ValueError:
            return {"error": "Invalid custom date format"}, 400
    elif range_option != "all":
        days_map = {
            "7days": 7,
            "month": 30,
            "90days": 90,
        }
        days = days_map.get(range_option)
        if days:
            since_date = datetime.utcnow().date() - timedelta(days=days)
            query = query.filter(Mood.timestamp >= since_date)

    moods = query.order_by(Mood.timestamp.desc()).all()

    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(['id', 'mood', 'note', 'timestamp'])

    for mood in moods:
        cw.writerow([mood.id, mood.mood, mood.note or '', mood.timestamp])

    output = si.getvalue()

    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=mood_history_user_{user_id}.csv"}
    )

# @routes.route('/export-csv', methods=['GET'])
# def export_csv():
#     user_id = request.args.get('user_id')
#     range_option = request.args.get('range', 'all')
#     start = request.args.get('start')
#     end = request.args.get('end')

#     if not user_id:
#         return {"error": "Missing user_id"}, 400

#     moods = Mood.query.filter_by(user_id=user_id).order_by(Mood.timestamp.desc()).all()

#     si = StringIO()
#     cw = csv.writer(si)
#     cw.writerow(['id', 'mood', 'note', 'timestamp'])

#     for mood in moods:
#         cw.writerow([mood.id, mood.mood, mood.note or '', mood.timestamp])

#     output = si.getvalue()

#     return Response(
#         output,
#         mimetype="text/csv",
#         headers={"Content-Disposition": f"attachment; filename=mood_history_user_{user_id}.csv"}
#     )