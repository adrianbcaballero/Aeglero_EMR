from flask import Flask, g
from flask_cors import CORS
import config
from extensions import db


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = config.DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = config.SECRET_KEY

    origins = config.CORS_ORIGINS
    if isinstance(origins, str):
        origins = [o.strip() for o in origins.split(",") if o.strip()]

    CORS(app, origins=origins)


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

    @app.after_request
    def add_security_headers(response):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains" # use only over HTTPS in production
        response.headers["X-Content-Type-Options"] = "nosniff" #prvent browser from reading response as different MIME type (script as a image)
        response.headers["X-Frame-Options"] = "DENY" # prevent clickjacking
        response.headers["X-XSS-Protection"] = "1; mode=block" # enable basic XSS protection in older browsers (modern browsers use CSP instead)
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'" # restrict all content to same origin, prevent framing
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin" # Strips the header down if navigating to a different origin, but sends full URL when navigating within the same origin. This is a good balance between privacy and functionality for an EMR.
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate" # prevent caching of sensitive data
        response.headers["Pragma"] = "no-cache" # HTTP 1.0 backward compatibility for no-cache
        return response

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
