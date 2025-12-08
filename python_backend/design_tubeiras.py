import numpy as np
from bisect import bisect_left
from typing import Dict, Any

def calcular_design_tubeira(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula design de tubeira.
    - Se tipo='conica': Usa geometria simples de cone 15°.
    - Se tipo='parabolica': Usa Método de Rao (T.O.P.) via função tubeira_sino.
    """
    # 1. Extração e Validação de Parâmetros
    F = float(params.get("F", 544.81))
    p0 = float(params.get("p0", 6106000))
    pe_target = float(params.get("pe", 101320))
    T0 = float(params.get("T0", 1601.209))
    k = float(params.get("k", 1.136397))
    R_gas = float(params.get("R", 234.918))
    tipo = params.get("tipo", "conica")

    # Verifica se usuário fixou a razão de expansão (recomendado: 6 a 10 para amadores)
    epsilon_input = params.get("razao_expansao", None)

    # 2. Termodinâmica (Garganta)
    Tt = (2 * T0) / (k + 1)
    vt = np.sqrt(k * R_gas * Tt) # Velocidade sônica

    # Vazão mássica ideal para dimensionar a garganta
    ve_ideal = np.sqrt(((2*k)/(k-1)) * R_gas * T0 * (1 - (pe_target/p0)**((k-1)/k)))
    mdot = F / ve_ideal

    # Propriedades geométricas da garganta
    Vc = (R_gas * T0) / p0
    Vt = Vc * ((k + 1) / 2)**(1 / (k - 1))
    At = (mdot * Vt) / vt
    rt = np.sqrt(At / np.pi) # Metros

    # 3. Definição da Razão de Expansão (Epsilon)
    if epsilon_input is not None and float(epsilon_input) > 1.0:
        epsilon = float(epsilon_input)
    else:
        # Cálculo Ótimo Teórico (Cuidado: pode gerar valores > 100)
        term1 = ((k + 1) / 2)**(1 / (k - 1))
        term2 = (pe_target / p0)**(-1 / k)
        term3 = np.sqrt(((k + 1) / (k - 1)) * (1 - (pe_target / p0)**((k - 1) / k)))
        epsilon = term1 * term2 * term3

    # Área e Raio de Saída
    Ae = epsilon * At
    re = np.sqrt(Ae / np.pi) # Metros

    # 4. Geração da Geometria
    if tipo == "parabolica" or tipo == "sino":
        # Chama a função dedicada de Rao (adaptada do seu arquivo tubeira_sino.py)
        # L_camara=80% é o padrão industrial para ótima relação empuxo/peso
        x, r, L_total = gerar_perfil_rao(k, epsilon, rt, re, l_percentual=80)
    else:
        # Tubeira Cônica Padrão (15 graus)
        angulo = 15 * np.pi / 180
        L_total = (re - rt) / np.tan(angulo)
        x = np.linspace(0, L_total, 100)
        r = rt + x * np.tan(angulo)

    # Cálculo das áreas para plotagem
    areas = np.pi * r**2

    return {
        "parametros": {
            "temperatura_garganta": float(Tt),
            "velocidade_garganta": float(vt),
            "velocidade_exaustao": float(ve_ideal),
            "fluxo_massico": float(mdot),
            "area_garganta": float(At),
            "raio_garganta": float(rt * 1000), # mm
            "area_saida": float(Ae),
            "raio_saida": float(re * 1000),    # mm
            "razao_expansao": float(epsilon),
            "comprimento": float(L_total * 1000) # mm
        },
        "geometria": {
            "x": (x * 1000).tolist(), # mm
            "r": (r * 1000).tolist(), # mm
            "areas": (areas * 1e6).tolist() # mm^2
        }
    }

def gerar_perfil_rao(k, epsilon, Rt, Re, l_percentual=80):
    """
    Implementação do Método de Rao (Thrust Optimized Parabolic)
    Baseado no código tubeira_sino.py fornecido.
    Retorna arrays x, r concatenados e comprimento total.
    """
    # 1. Determinar ângulos theta_n (inflexão) e theta_e (saída)
    # Dados empíricos aproximados para L=80% (padrão Rao)
    # Tabela simplificada baseada no código original
    # (Epsilon, Theta_n, Theta_e)
    dados_rao = [
        (4, 21.5, 14.0), (10, 26.3, 11.0), (20, 28.8, 9.0),
        (50, 31.5, 7.5), (100, 33.5, 7.0)
    ]

    # Interpolação simples para encontrar ângulos
    eps_list = [d[0] for d in dados_rao]
    tn_list = [d[1] for d in dados_rao]
    te_list = [d[2] for d in dados_rao]

    # Garante que epsilon está dentro dos limites da tabela para interpolação
    eps_val = max(4, min(100, epsilon))

    theta_n_deg = np.interp(eps_val, eps_list, tn_list)
    theta_e_deg = np.interp(eps_val, eps_list, te_list)

    theta_n = np.radians(theta_n_deg)
    theta_e = np.radians(theta_e_deg)

    # 2. Comprimento da Tubeira (L_np)
    # Comprimento de um cone equivalente de 15 graus
    L_cone_15 = (Re - Rt) / np.tan(np.radians(15))
    L_total = (l_percentual / 100.0) * L_cone_15

    # 3. Geometria da Garganta (Arcos Circulares)
    # Entrada: Arco de 1.5*Rt (não precisamos plotar a entrada convergente completa aqui, focamos no divergente)
    # Saída da Garganta (Divergente Inicial): Arco de 0.382*Rt
    # Vai de -90 graus (garganta) até (theta_n - 90) graus
    angle_start = -np.pi / 2
    angle_end = theta_n - np.pi / 2
    t_arc = np.linspace(angle_start, angle_end, 30)

    # Coordenadas do arco (centro deslocado para x=0, y=Rt + 0.382*Rt)
    # O código original define eixo X na garganta como 0. 
    # Centro do arco de saída: x=0, y = Rt + 0.382*Rt
    xc = 0
    yc = Rt + 0.382 * Rt

    x_arc = 0.382 * Rt * np.cos(t_arc) + xc
    y_arc = 0.382 * Rt * np.sin(t_arc) + yc

    # Ponto de Inflexão (N) - Fim do arco, Início da Parábola
    Nx = x_arc[-1]
    Ny = y_arc[-1]

    # 4. Geometria do Sino (Bézier Quadrática)
    # Ponto E (Saída)
    Ex = L_total
    Ey = Re

    # Ponto de Controle (Q) - Interseção das tangentes em N e E
    # Reta 1 (passa por N com angulo theta_n): Y - Ny = tan(theta_n) * (X - Nx)
    # Reta 2 (passa por E com angulo theta_e): Y - Ey = tan(theta_e) * (X - Ex)
    m1 = np.tan(theta_n)
    m2 = np.tan(theta_e)

    # Interseção
    Qx = (Ey - Ny + m1*Nx - m2*Ex) / (m1 - m2)
    Qy = m1 * (Qx - Nx) + Ny

    # Gerar Curva de Bézier
    t = np.linspace(0, 1, 70)
    x_bell = (1-t)**2 * Nx + 2*(1-t)*t * Qx + t**2 * Ex
    y_bell = (1-t)**2 * Ny + 2*(1-t)*t * Qy + t**2 * Ey

    # 5. Concatenar
    # Removemos o primeiro ponto do sino para não duplicar o último do arco
    x_final = np.concatenate([x_arc, x_bell[1:]])
    y_final = np.concatenate([y_arc, y_bell[1:]])

    return x_final, y_final, L_total