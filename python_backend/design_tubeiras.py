"""Módulo de Design de Tubeiras"""

import numpy as np
from typing import Dict, Any

def calcular_design_tubeira(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula design de tubeira cônica ou parabólica.
    Prioriza a Razão de Expansão manual se fornecida.
    """
    # 1. Extração de Parâmetros com Valores Padrão
    F_target = float(params.get("F", 544.81))
    p0 = float(params.get("p0", 6106000))
    pe_target = float(params.get("pe", 101320))
    T0 = float(params.get("T0", 1601.209))
    k = float(params.get("k", 1.136397))
    R_gas = float(params.get("R", 234.918))
    tipo = params.get("tipo", "conica")

    # Tratamento do input opcional (pode vir como string, número ou None)
    razao_input = params.get("razao_expansao")
    epsilon_manual = None
    if razao_input is not None and str(razao_input).strip() != "":
        try:
            val = float(razao_input)
            if val > 1.0:
                epsilon_manual = val
        except ValueError:
            pass

    # 2. Termodinâmica da Garganta (Independe da expansão)
    # Temperatura crítica
    Tt = (2 * T0) / (k + 1)
    # Velocidade na garganta (Sônica)
    vt = np.sqrt(k * R_gas * Tt)

    # 3. Dimensionamento da Garganta
    # Calculamos a vazão mássica necessária para atingir o Empuxo Alvo (F)
    # assumindo expansão ideal momentaneamente para dimensionar o "buraco" da garganta.
    ve_ideal = np.sqrt(((2*k)/(k-1)) * R_gas * T0 * (1 - (pe_target/p0)**((k-1)/k)))
    mdot = F_target / ve_ideal

    # Propriedades volumétricas
    Vc = (R_gas * T0) / p0
    Vt = Vc * ((k + 1) / 2)**(1 / (k - 1))

    # Área e Raio da Garganta (Definitivos)
    At = (mdot * Vt) / vt
    rt = np.sqrt(At / np.pi) # em metros

    # 4. Definição da Razão de Expansão (Epsilon)
    if epsilon_manual:
        # CASO MANUAL: Obedece cegamente o usuário
        epsilon = epsilon_manual
        # A área de saída é simplesmente Epsilon * Area_Garganta
        Ae = epsilon * At
    else:
        # CASO AUTOMÁTICO: Calcula expansão ótima (Pe = Pa)
        # Atenção: Para P0=60bar e k=1.13, isso dará ~147.
        term1 = ((k + 1) / 2)**(1 / (k - 1))
        term2 = (pe_target / p0)**(-1 / k)
        term3 = np.sqrt(((k + 1) / (k - 1)) * (1 - (pe_target / p0)**((k - 1) / k)))
        epsilon = term1 * term2 * term3
        Ae = epsilon * At

    # 5. Geometria de Saída Final
    re = np.sqrt(Ae / np.pi) # em metros

    # 6. Geração de Coordenadas para o Gráfico
    if tipo == "parabolica":
        # Chama função auxiliar Rao (definida abaixo ou importada)
        x, r, L_total = gerar_perfil_rao(k, epsilon, rt, re, l_percentual=80)
    else:
        # Cônica Padrão 15 graus
        angulo = 15 * np.pi / 180
        L_total = (re - rt) / np.tan(angulo)
        # Evitar erro de linspace se L_total for muito pequeno ou negativo
        if L_total <= 0: L_total = 0.001

        x = np.linspace(0, L_total, 100)
        r = rt + x * np.tan(angulo)

    # Cálculo de áreas para o gráfico
    areas = np.pi * r**2

    # Retorno (Valores em unidades SI padrão para o front converter se necessário,
    # MAS como seu front já espera mm em alguns lugares, vou manter o padrão numérico
    # puro e você formata no front, ou convertemos aqui para garantir)

    # VAMOS RETORNAR TUDO EM MILÍMETROS PARA O GEOMETRIA
    # Para garantir consistência com o gráfico do Recharts

    return {
        "parametros": {
            "velocidade_exaustao": float(ve_ideal), # Mantém ref. ideal
            "fluxo_massico": float(mdot),
            "temperatura_garganta": float(Tt),
            "velocidade_garganta": float(vt),

            # Dimensões convertidas para metros (padrão SI para cálculos físicos)
            "area_garganta": float(At),

            # Dimensões convertidas para visualização (mm)
            "raio_garganta": float(rt * 1000),
            "area_saida": float(Ae),
            "raio_saida": float(re * 1000),
            "razao_expansao": float(epsilon),
            "comprimento": float(L_total * 1000)
        },
        "geometria": {
            # Arrays convertidos para mm para o gráfico ficar na escala certa
            "x": (x * 1000).tolist(),
            "r": (r * 1000).tolist(),
            "areas": (areas * 1e6).tolist() # mm^2
        }
    }

def gerar_perfil_rao(k, epsilon, Rt, Re, l_percentual=80):
    """
    Gera perfil Rao aproximado usando Bézier quadrática.
    Retorna x(m), r(m), L(m).
    """
    # Ângulos aproximados baseados na expansão
    # (Para epsilon=8, theta_n ~25deg, theta_e ~12deg)
    # Interpolação simplificada
    eps_refs = [4, 10, 20, 50, 100]
    tn_refs = [21.5, 26.3, 28.8, 31.5, 33.5]
    te_refs = [14.0, 11.0, 9.0, 7.5, 7.0]

    ep = max(4, min(100, epsilon))
    theta_n = np.radians(np.interp(ep, eps_refs, tn_refs))
    theta_e = np.radians(np.interp(ep, eps_refs, te_refs))

    # Comprimento
    L_cone = (Re - Rt) / np.tan(np.radians(15))
    L_total = (l_percentual / 100.0) * L_cone

    if L_total <= 0: L_total = 0.001

    # Arco de saída da garganta
    # Centro (0, Rt + 0.382*Rt)
    angle_start = -np.pi / 2
    angle_end = theta_n - np.pi / 2
    t_arc = np.linspace(angle_start, angle_end, 20)

    x_arc = 0.382 * Rt * np.cos(t_arc)
    y_arc = (0.382 * Rt * np.sin(t_arc)) + (Rt + 0.382 * Rt)

    # Ponto de Inflexão (N)
    Nx, Ny = x_arc[-1], y_arc[-1]

    # Ponto de Saída (E)
    Ex, Ey = L_total, Re

    # Ponto de Controle (Q) - Interseção das tangentes
    # m1 = tan(theta_n), m2 = tan(theta_e)
    m1 = np.tan(theta_n)
    m2 = np.tan(theta_e)

    # Evitar divisão por zero se ângulos forem iguais (improvável)
    if abs(m1 - m2) < 1e-5: m2 += 0.01

    Qx = (Ey - Ny + m1*Nx - m2*Ex) / (m1 - m2)
    Qy = m1 * (Qx - Nx) + Ny

    # Bézier
    t = np.linspace(0, 1, 80)
    x_bell = (1-t)**2 * Nx + 2*(1-t)*t * Qx + t**2 * Ex
    y_bell = (1-t)**2 * Ny + 2*(1-t)*t * Qy + t**2 * Ey

    return np.concatenate([x_arc, x_bell[1:]]), np.concatenate([y_arc, y_bell[1:]]), L_total