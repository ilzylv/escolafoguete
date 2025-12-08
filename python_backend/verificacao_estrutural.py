"""Módulo de Verificação Estrutural"""

import numpy as np
import math as m
from typing import Dict, Any

def calcular_verificacao_estrutural(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula verificação estrutural do case, bulkhead e parafusos.
    """
    # Extrair parâmetros
    e = float(params.get("e", 3.175))
    dext_c = float(params.get("dext_c", 76.2))
    pmax = float(params.get("pmax", 7))
    te_c = float(params.get("te_c", 150))
    te_b = float(params.get("te_b", 205))

    # NOVOS PARÂMETROS PARA PARAFUSO
    d_p = float(params.get("d_p", 6.0))
    df_p = float(params.get("df_p", 6.5))
    te_p = float(params.get("te_p", 400)) # Tensão escoamento parafuso (padrão aprox grau 5.8)

    # Dimensões iniciais
    dint_c = dext_c - (2*e)

    # Dimensões em metros
    Dext_c = dext_c/1000
    Dint_c = dint_c/1000
    Rext = Dext_c/2
    Rint = Dint_c/2
    E = Rext - Rint

    # Conversões de pressão e tensão (MPa -> Pa)
    Pmax = pmax * 1e6
    Te_c = te_c * 1e6
    Te_b = te_b * 1e6
    Te_p = te_p * 1e6 # Tensão escoamento parafuso em Pa

    # --- CÁLCULO CASE (Von Mises) ---
    # Tensão Tangencial (Hoop)
    Tt = ((Pmax*(Rint**2)) / ((Rext**2) - (Rint**2))) * (1+((Rext**2) / (Rint**2)))
    # Tensão Radial
    Tr = ( (Pmax*Rint**2) / (Rext**2 - Rint**2) ) * (1 - (Rint**2 / Rext**2))
    # Tensão Longitudinal
    Tl = ( (2*Pmax*(Rint**2)) / ((Rext**2)-(Rint**2))) # Assumindo tampas suportadas pelo tubo

    # Von Mises
    Tvm = np.sqrt( (((Tl-Tr)**2) + ((Tr-Tt)**2) + ((Tt-Tl)**2))/2 )

    # Fator de Segurança do Case
    Fs_c = Te_c / Tvm if Tvm > 0 else 999

    # --- CÁLCULO BULKHEAD ---
    fs_b = 2.0 # Fator de segurança desejado para bulkhead
    Er_b = 7/1000 # Estimativa inicial
    Dext_b = 0.98 * Dint_c
    Dint_b = Dext_b - 2*(Er_b)

    # Coeficiente de engaste (0.33 para engaste simples aproximado)
    N_coef = 0.33

    # Espessura necessária Bulkhead
    # E_b = Dint_b * sqrt( (Coef * Pmax * FS) / Te_b )
    E_b = Dint_b * np.sqrt((N_coef * Pmax * fs_b) / Te_b)

    # --- CÁLCULO PARAFUSOS ---
    # Área de pressurização (tampa)
    Area_tampa = np.pi * (Rint**2)

    # Força total na tampa (F = P * A)
    F_total = Pmax * Area_tampa

    # Diâmetro do parafuso em metros
    D_p_m = d_p / 1000

    # Tensão de Cisalhamento Admissível (Critério de Tresca/VonMises: Te / sqrt(3) )
    # Assumindo FS = 2.0 para os parafusos
    Fs_parafuso = 2.0
    Tensao_Cisalhamento_Admissivel = (Te_p / np.sqrt(3)) / Fs_parafuso

    # Área resistente de UM parafuso (seção transversal)
    Area_parafuso = np.pi * ((D_p_m / 2)**2)

    # Força que UM parafuso aguenta
    Forca_por_parafuso = Tensao_Cisalhamento_Admissivel * Area_parafuso

    # Número de parafusos necessários
    if Forca_por_parafuso > 0:
        N_p = F_total / Forca_por_parafuso
    else:
        N_p = 999

    # Tensão de Cisalhamento Real (atuante) se usasse 1 parafuso (para referência)
    # Tensão = Força / Área
    Tensao_Cisalhante_Atuante = F_total / (N_p * Area_parafuso) if N_p > 0 else 0

    return {
        "case": {
            "dint_c": float(dint_c),
            "espessura": float(E),
            "tensao_tangencial": float(Tt),
            "tensao_radial": float(Tr),
            "tensao_longitudinal": float(Tl),
            "tensao_von_mises": float(Tvm),
            "fator_seguranca": float(Fs_c)
        },
        "bulkhead": {
            "espessura_calculada": float(E_b)
        },
        "parafusos": {
            "area_transversal": float(Area_tampa),
            "forca": float(F_total),
            "tensao": float(Tensao_Cisalhamento_Admissivel * Fs_parafuso), # Tensão limite de escoamento ao cisalhamento
            "tensao_tracao": float(Te_p),
            "tensao_cisalhamento_admissivel": float(Tensao_Cisalhamento_Admissivel),
            "numero_parafusos": float(N_p),
            "numero_parafusos_arredondado": int(m.ceil(N_p))
        }
    }