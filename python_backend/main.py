"""Servidor FastAPI para cálculos de engenharia de foguetes"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

# Importar módulos de cálculo
from verificacao_estrutural import calcular_verificacao_estrutural
from design_tubeiras import calcular_design_tubeira
from ezimpulse import calcular_performance_ezimpulse

app = FastAPI(
    title="Rocket Engineering API",
    description="API para cálculos de engenharia de foguetes",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de requisição
class VerificacaoEstruturalRequest(BaseModel):
    e: Optional[float] = 3.175
    dext_c: Optional[float] = 76.2
    pmax: Optional[float] = 7
    te_c: Optional[float] = 150
    te_b: Optional[float] = 205
    d_p: Optional[float] = 9.03
    df_p: Optional[float] = 10

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
    return {
        "message": "Rocket Engineering API",
        "version": "1.0.0",
        "endpoints": [
            "/api/verificacao-estrutural",
            "/api/design-tubeira",
            "/api/performance"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/verificacao-estrutural")
def verificacao_estrutural(request: VerificacaoEstruturalRequest):
    """
    Endpoint para cálculo de verificação estrutural.
    
    Calcula tensões, fatores de segurança e dimensionamento de:
    - Case (cilindro de pressão)
    - Bulkhead (tampa)
    - Parafusos
    """
    try:
        params = request.dict()
        resultado = calcular_verificacao_estrutural(params)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/design-tubeira")
def design_tubeira(request: DesignTubeiraRequest):
    """
    Endpoint para cálculo de design de tubeira.
    
    Calcula geometria e parâmetros de tubeira cônica ou parabólica.
    """
    try:
        params = request.dict()
        resultado = calcular_design_tubeira(params)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/performance")
def calcular_performance(request: PerformanceRequest):
    """
    Endpoint para cálculo de performance do foguete.
    
    Simula trajetória e calcula apogeu, velocidade máxima, etc.
    """
    try:
        params = request.dict()
        resultado = calcular_performance_ezimpulse(params)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
