from flask import Flask, g
from flask_cors import CORS
import config
from extensions import db


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = config.DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = config.SECRET_KEY

    CORS(app, origins=config.CORS_ORIGINS)

    db.init_app(app)


    from routes.auth import auth_bp
    from auth_middleware import require_auth

    app.register_blueprint(auth_bp)

    from routes.patients import patients_bp
    app.register_blueprint(patients_bp)

    from routes.users import users_bp
    app.register_blueprint(users_bp)

    from routes.clinical import clinical_bp
    app.register_blueprint(clinical_bp)

    from routes.audit import audit_bp
    app.register_blueprint(audit_bp)

    import models
    with app.app_context():
        db.create_all()

    @app.get("/health")
    def health():
        return {"ok": True}
    
    @app.get("/api/protected/ping")
    @require_auth()
    def protected_ping():
        return {"ok": True, "user": {"id": g.user.id, "username": g.user.username, "role": g.user.role}}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
