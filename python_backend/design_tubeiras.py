"""Módulo de Design de Tubeiras"""

import numpy as np
import matplotlib
matplotlib.use("Agg")  # Backend sem GUI
import matplotlib.pyplot as plt
from typing import Dict, Any, List, Tuple
import io
import base64

def calcular_design_tubeira(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula design de tubeira cônica ou parabólica.
    
    Parâmetros:
        params: Dicionário com parâmetros de entrada
            - F: Empuxo máximo [N]
            - p0: Pressão máxima na câmara [Pa]
            - pe: Pressão de saída [Pa]
            - T0: Temperatura na câmara [K]
            - k: Coeficiente de calores específicos
            - R: Constante específica do gás [J/(kg·K)]
            - tipo: "conica" ou "parabolica"
    
    Retorna:
        Dicionário com resultados e geometria
    """
    # Extrair parâmetros
    F = params.get("F", 544.81)
    p0 = params.get("p0", 6106000)
    pe = params.get("pe", 101320)
    T0 = params.get("T0", 1601.209)
    k = params.get("k", 1.136397)
    R = params.get("R", 234.918)
    tipo = params.get("tipo", "conica")
    
    # Temperatura crítica na garganta
    Tt = (2*T0)/(k+1)
    
    # Velocidade na garganta
    vt = np.sqrt(k*R*Tt)
    
    # Velocidade de exaustão
    ve = np.sqrt(((2*k)/(k-1)) * R * T0 * (1 - (pe/p0)**((k-1)/k)))
    
    # Fluxo mássico
    mdot = F/ve
    
    # Volume específico na câmara
    Vc = (R*T0)/p0
    
    # Volume específico crítico (garganta)
    Vt = Vc * ((k+1)/2)**(1/(k-1))
    
    # Área da garganta
    At = mdot * Vt / vt
    
    # Raio da garganta
    rt = np.sqrt(At/np.pi)
    
    # Razão de expansão
    epsilon = ((k+1)/2)**(1/(k-1)) * (pe/p0)**(-1/k) * np.sqrt(((k+1)/(k-1)) * (1-(pe/p0)**((k-1)/k)))
    
    # Área de saída
    Ae = epsilon * At
    
    # Raio de saída
    re = np.sqrt(Ae/np.pi)
    
    # Gerar geometria
    if tipo == "conica":
        # Tubeira cônica simples (ângulo de 15 graus)
        angulo = 15 * np.pi / 180
        L_divergente = (re - rt) / np.tan(angulo)
        x = np.linspace(0, L_divergente, 100)
        r = rt + x * np.tan(angulo)
    else:
        # Tubeira parabólica (aproximação)
        L_divergente = 0.8 * (re - rt) / np.tan(15 * np.pi / 180)
        x = np.linspace(0, L_divergente, 100)
        r = rt + (re - rt) * (x / L_divergente)**0.6
    
    # Calcular áreas ao longo do comprimento
    areas = np.pi * r**2
    
    return {
        "parametros": {
            "temperatura_garganta": float(Tt),
            "velocidade_garganta": float(vt),
            "velocidade_exaustao": float(ve),
            "fluxo_massico": float(mdot),
            "area_garganta": float(At),
            "raio_garganta": float(rt),
            "area_saida": float(Ae),
            "raio_saida": float(re),
            "razao_expansao": float(epsilon),
            "comprimento": float(L_divergente)
        },
        "geometria": {
            "x": x.tolist(),
            "r": r.tolist(),
            "areas": areas.tolist()
        }
    }
