from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://delightful-sand-0a1c96803.4.azurestaticapps.net"],  # Añade aquí el dominio de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hola")
def hola_mundo():
    return {"mensaje": "Hola Mundo"}
