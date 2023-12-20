import uvicorn
from main import app  # Asume que tu aplicación FastAPI está en main.py

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)