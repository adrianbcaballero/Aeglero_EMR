from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = config.DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = config.SECRET_KEY

    CORS(app, origins=config.CORS_ORIGINS)

    db.init_app(app)

    import models

    with app.app_context():
        db.create_all()

    @app.get("/health")
    def health():
        return {"ok": True}

    # tables will be created once models exist (Step 2)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
