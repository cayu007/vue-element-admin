from fastapi import FastAPI

app = FastAPI()

@app.get("/hola")
def leer_raiz():
    return {"Hola": "Mundo"}
