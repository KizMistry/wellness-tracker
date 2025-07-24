from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from models import db
from routes import routes
import os
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB + migrations
db.init_app(app)
migrate = Migrate(app, db)

@app.route('/')
def home():
    return 'Hello, Wellness Tracker'

app.register_blueprint(routes)

if __name__ == '__main__':
    app.run(debug=True)
