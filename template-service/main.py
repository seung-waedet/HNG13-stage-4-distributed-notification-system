from fastapi import FastAPI, HTTPException
import json

app = FastAPI(title="Template Service")


@app.get("/api/v1/templates/{code}")
def get_template(code: str):
    """
    Fetch a notification template by its code.
    Example: GET /api/v1/templates/welcome_email
    """
    # Load templates from file (you could later connect this to a DB)
    with open("templates.json", "r") as f:
      templates = json.load(f)
    template = templates.get(code)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"code": code, "template": template}


@app.get("/")
def root():
    """
    Root endpoint — simple welcome message.
    """
    return {"message": "Welcome to the Template Service"}

@app.get("/health")
def health_check():
    """
    Health check endpoint — for CI/CD, monitoring, or orchestration tools.
    """
    return {"status": "ok", "service": "template-service"}
