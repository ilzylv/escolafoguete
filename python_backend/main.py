from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

from verificacao_estrutural import calcular_verificacao_estrutural
from design_tubeiras import calcular_design_tubeira
from ezimpulse import calcular_performance_ezimpulse

app = FastAPI(title="Escola Foguete API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://escolafoguete-web.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerificacaoEstruturalRequest(BaseModel):
    e: Optional[float] = 3.175
    dext_c: Optional[float] = 76.2
    pmax: Optional[float] = 7
    te_c: Optional[float] = 150
    te_b: Optional[float] = 205
    d_p: Optional[float] = 9.03
    df_p: Optional[float] = 10
    te_p: Optional[float] = 400

class DesignTubeiraRequest(BaseModel):
    F: Optional[float] = 544.81
    p0: Optional[float] = 6106000
    pe: Optional[float] = 101320
    T0: Optional[float] = 1601.209
    k: Optional[float] = 1.136397
    R: Optional[float] = 234.918
    tipo: Optional[str] = "conica"

class PerformanceRequest(BaseModel):
    target_apogee_m: Optional[float] = 500.0
    burn_time_s: Optional[float] = 3.0
    rocket_empty_mass_kg: Optional[float] = 1.5
    propellant_mass_percent: Optional[float] = 20.0
    rocket_diameter_cm: Optional[float] = 8.0
    drag_coefficient: Optional[float] = 0.4

@app.get("/")
def read_root():
    return {"message": "API Online"}

@app.post("/api/verificacao-estrutural")
def verificacao_estrutural(request: VerificacaoEstruturalRequest):
    try:
        return calcular_verificacao_estrutural(request.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/design-tubeira")
def design_tubeira(request: DesignTubeiraRequest):
    try:
        return calcular_design_tubeira(request.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/performance")
def calcular_performance(request: PerformanceRequest):
    try:
        return calcular_performance_ezimpulse(request.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)