from flask import Flask
from flask_cors import CORS
from database import db, Config
from routes.auth import auth_bp
from routes.search import search_bp
from routes.drug import drug_bp
from routes.routes_prediction import prediction_bp
from routes.dsisease import disease_bp
from routes.protein import protein_bp

app = Flask(__name__)
app.config.from_object(Config)

# Allow the frontend (running on a different origin / file://) to call the API
CORS(app)

db.init_app(app)


app.register_blueprint(auth_bp)
app.register_blueprint(search_bp)
app.register_blueprint(drug_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(disease_bp)
app.register_blueprint(protein_bp)

@app.route("/")
def home():
    return "Backend is running"

if __name__ == "__main__":
    app.run(debug=True)