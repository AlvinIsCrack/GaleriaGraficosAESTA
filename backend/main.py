from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración de CORS propia de FastApi (https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware) para nada restrictiva, por motivos del desafío y evitar problemas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1",
        "http://127.0.0.1:8000",
        "http://localhost",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "API OK"}

# Endpoint del desafio con JSON
@app.get("/api/chart-data")
async def data():
    return {"message": "OK"}