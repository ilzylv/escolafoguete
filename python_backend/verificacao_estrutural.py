"""Módulo de Verificação Estrutural - Baseado no notebook de Luana Dalla Vecchia"""

import numpy as np
import math as m
from typing import Dict, Any

def calcular_verificacao_estrutural(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula verificação estrutural do case, bulkhead e parafusos.
    
    Parâmetros:
        params: Dicionário com parâmetros de entrada
            - e: Espessura [mm]
            - dext_c: Diâmetro externo [mm]
            - pmax: Pressão máxima [MPa]
            - te_c: Tensão de escoamento do case [MPa]
            - te_b: Tensão de escoamento do bulkhead [MPa]
            - d_p: Diâmetro do parafuso [mm]
            - df_p: Diâmetro do furo do parafuso [mm]
    
    Retorna:
        Dicionário com resultados dos cálculos
    """
    # Extrair parâmetros
    e = params.get("e", 3.175)
    dext_c = params.get("dext_c", 76.2)
    pmax = params.get("pmax", 7)
    te_c = params.get("te_c", 150)
    te_b = params.get("te_b", 205)
    d_p = params.get("d_p", 9.03)
    df_p = params.get("df_p", 10)
    
    # Dimensões iniciais
    dint_c = dext_c - (2*e)
    
    # Dimensões em metros
    Dext_c = dext_c/1000
    Dint_c = dint_c/1000
    Rext = Dext_c/2
    Rint = Dint_c/2
    E = Rext - Rint
    
    # Conversões de pressão e tensão
    Pmax = pmax*10**6
    Te_c = te_c*10**6
    Te_b = te_b * 10**6
    
    # Cálculo da Tensão de Von Mises
    Tt = ((Pmax*(Rint**2)) / ((Rext**2) - (Rint**2))) * (1+((Rext**2) / (Rint**2)))
    Tr = ( (Pmax*Rint**2) / (Rext**2 - Rint**2) ) * (1 - (Rint**2 / Rext**2))
    Tl = ( (2*Pmax*(Rint**2)) / ((Rext**2)-(Rint**2)))
    Tvm = np.sqrt( (((Tl-Tr)**2) + ((Tr-Tt)**2) + ((Tt-Tl)**2))/2 )
    
    # Fator de Segurança do Case
    Fs_c = Te_c/Tvm
    
    # Cálculo do Bulkhead
    fs_b = 2
    er_b = 7
    Er_b = 7/1000
    Dext_b = 0.98*Dint_c
    Dint_b = Dext_b-2*(Er_b)
    N = 0.33 * ( ((Pmax*Dext_b)/(2*Te_c)) / (E))
    E_b = (Dint_b*np.sqrt((N*Pmax*fs_b)/(Te_b)))
    
    # Cálculo dos Parafusos
    A = np.pi * (Rint**2)
    D_p = d_p / 1000
    Df_p = df_p / 1000
    F_p = Pmax*A
    T = (4*F_p)/(np.pi*(D_p**2))
    Fs = 2
    D_bfc = 1.5
    D_fb = Df_p*1000*D_bfc
    tt_p = 207
    Tt_p = 207*(10**6)
    Tc_p = Tt_p/np.sqrt(3)
    N_p = (T*Fs)/Tc_p
    
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
            "area_transversal": float(A),
            "forca": float(F_p),
            "tensao": float(T),
            "tensao_tracao": float(Tt_p),
            "tensao_cisalhamento": float(Tc_p),
            "numero_parafusos": float(N_p),
            "numero_parafusos_arredondado": int(m.ceil(N_p))
        }
    }
