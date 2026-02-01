import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Configuración de CORS propia de FastApi
# (https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Se tienen las configuraciones para
        # Vite, en entorno de desarrollo para el desafío
        "http://127.0.0.1",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET"]
)


@app.get("/")
async def root():
    """
    De prueba, aunque en el frontend no se usa para nada de manera directa.
    """
    return {"message": "API OK"}

# Endpoint del desafio con JSON
@app.get("/api/chart-data")
async def get_chart_data() -> List[Dict[str, Any]]:
    """
    Endpoint principal de prueba para el desafío. Entrega datos ya procesados y generados.

    Nota: no soy aficionado al tema ni domino los términos o la realidad relacionada con los incendios, por lo que desconozco si la manera de generación simula una realidad. Sin embargo, es por motivos de simulación, y por amor al arte.
    """

    padding = 7
    total_days = 30
    extended_data = []
    now = datetime.now()

    heatwave_remaining_days = 0
    heatwave_intensity = 0
    
    for i in range(total_days + padding):
        days_ago = total_days + padding - 1 - i
        date_point = now - timedelta(days=days_ago)
        
        month = date_point.month
        is_summer = month == 12 or month <= 3
        
        if random.random() > 0.7: 
            base_noise = random.uniform(0.5, 1.5)
        else:
            base_noise = random.uniform(0, 0.5)

        # Lógica de Olas de Calor
        if heatwave_remaining_days > 0:
            heatwave_remaining_days -= 1
            heatwave_intensity *= random.uniform(0.4, 0.6)
        else:
            spike_chance = 0.08 if is_summer else 0.02
            if random.random() < spike_chance:
                heatwave_remaining_days = random.randint(1, 2) 
                heatwave_intensity = random.uniform(8, 14)

        # Calc. final
        value = base_noise + heatwave_intensity
        
        if not is_summer and heatwave_remaining_days == 0:
            value *= 0.4

        extended_data.append({
            "label": date_point.strftime("%d/%m"),
            "value": round(value, 0)
        })

    # Pre-calculo de promedio (Media móvil centrada)
    processed_with_avg = []
    n = len(extended_data)
    for i in range(n):
        start = max(0, i - 3)
        end = min(n, i + 4)
        subset = [d["value"] for d in extended_data[start:end]]
        avg = sum(subset) / len(subset)
        
        item = extended_data[i].copy()
        item["avgValue"] = round(avg, 2)
        processed_with_avg.append(item)

    # Corte de padding e indexación
    final_data = []
    for i, item in enumerate(processed_with_avg[padding:]):
        item["index"] = i
        final_data.append(item)

    return final_data

# Para ejecutar con simplemente 'python main.py'
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)