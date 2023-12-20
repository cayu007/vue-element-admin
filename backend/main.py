from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def leer_raiz():
    return {"Hola": "Mundo"}
