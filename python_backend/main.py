from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import os

# Importar módulos de cálculo
from verificacao_estrutural import calcular_verificacao_estrutural
from design_tubeiras import calcular_design_tubeira
from ezimpulse import calcular_performance_ezimpulse

app = FastAPI(
    title="Escola Foguete API",
    description="API para cálculos de engenharia de foguetes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Aceita requisições de qualquer site (GitHub Pages, Localhost, etc)
    allow_credentials=True,
    allow_methods=["*"],  # Aceita todos os métodos (GET, POST, OPTIONS, etc)
    allow_headers=["*"],  # Aceita todos os cabeçalhos
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
    te_p: Optional[float] = 400 # Adicionado parâmetro faltante

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
        "message": "API da Escola Foguete está Online! 🚀",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/verificacao-estrutural")
def verificacao_estrutural(request: VerificacaoEstruturalRequest):
    try:
        params = request.dict()
        resultado = calcular_verificacao_estrutural(params)
        return resultado
    except Exception as e:
        print(f"Erro no cálculo estrutural: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/design-tubeira")
def design_tubeira(request: DesignTubeiraRequest):
    try:
        params = request.dict()
        resultado = calcular_design_tubeira(params)
        return resultado
    except Exception as e:
        print(f"Erro no cálculo de tubeira: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/performance")
def calcular_performance(request: PerformanceRequest):
    try:
        params = request.dict()
        resultado = calcular_performance_ezimpulse(params)
        return resultado
    except Exception as e:
        print(f"Erro no cálculo de performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)