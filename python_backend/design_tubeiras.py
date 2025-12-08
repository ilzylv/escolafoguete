import numpy as np
from typing import Dict, Any

def calcular_design_tubeira(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula design de tubeira cônica ou parabólica (Rao).
    """
    # 1. Extração de Parâmetros
    F_target = float(params.get("F", 544.81))
    p0 = float(params.get("p0", 6106000))
    pe_target = float(params.get("pe", 101320))
    T0 = float(params.get("T0", 1601.209))
    k = float(params.get("k", 1.136397))
    R_gas = float(params.get("R", 234.918))
    tipo = params.get("tipo", "conica")

    # Tratamento do input manual da Razão de Expansão
    # Isso resolve o problema de gerar tubeiras gigantes
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
    Tt = (2 * T0) / (k + 1)
    vt = np.sqrt(k * R_gas * Tt) # Velocidade sônica na garganta

    # 3. Dimensionamento da Garganta (Baseado no Empuxo Alvo)
    # Calculamos a vazão mássica necessária para atingir o Empuxo
    # Usamos Ve ideal apenas para estimar o mdot necessário
    ve_ideal_est = np.sqrt(((2*k)/(k-1)) * R_gas * T0 * (1 - (pe_target/p0)**((k-1)/k)))
    mdot = F_target / ve_ideal_est

    # Propriedades volumétricas para achar a Área da Garganta
    Vc = (R_gas * T0) / p0
    Vt = Vc * ((k + 1) / 2)**(1 / (k - 1))

    At = (mdot * Vt) / vt # Área da garganta em m²
    rt = np.sqrt(At / np.pi) # Raio da garganta em m

    # 4. Definição da Razão de Expansão
    if epsilon_manual:
        epsilon = epsilon_manual
        Ae = epsilon * At # Área de saída forçada pela razão manual

    else:
        term1 = ((k + 1) / 2)**(1 / (k - 1))
        term2 = (pe_target / p0)**(-1 / k)
        term3 = np.sqrt(((k + 1) / (k - 1)) * (1 - (pe_target / p0)**((k - 1) / k)))
        epsilon = term1 * term2 * term3
        Ae = epsilon * At

    # 5. Geometria de Saída Final
    re = np.sqrt(Ae / np.pi) # Raio de saída em m

    # 6. Geração de Coordenadas para o Gráfico
    # Convertemos tudo para milímetros (mm) para facilitar o plot
    rt_mm = rt * 1000
    re_mm = re * 1000

    if tipo == "parabolica":
        # Chama função Rao (T.O.P.) implementada abaixo
        x_mm, r_mm, L_mm = gerar_perfil_rao(epsilon, rt_mm, re_mm, l_percentual=80)
    else:
        # Cônica Padrão 15 graus
        angulo = 15 * np.pi / 180
        L_mm = (re_mm - rt_mm) / np.tan(angulo)
        if L_mm <= 0: L_mm = 1.0 # Evita erro matemático

        x_mm = np.linspace(0, L_mm, 100)
        r_mm = rt_mm + x_mm * np.tan(angulo)

    # Área para o gráfico (em mm²)
    areas_mm2 = np.pi * (r_mm**2)

    return {
        "parametros": {
            # Retorna valores termodinâmicos
            "velocidade_exaustao": float(ve_ideal_est),
            "fluxo_massico": float(mdot),
            "temperatura_garganta": float(Tt),
            "velocidade_garganta": float(vt),

            # Dimensões geométricas convertidas p/ sistema correto
            "area_garganta": float(At), # m² (backend padrão SI)

            # Dimensões visuais (mm)
            "raio_garganta": float(rt_mm),
            "area_saida": float(Ae), # m²
            "raio_saida": float(re_mm),
            "razao_expansao": float(epsilon),
            "comprimento": float(L_mm)
        },
        "geometria": {
            # Arrays já em mm
            "x": x_mm.tolist(),
            "r": r_mm.tolist(),
            "areas": areas_mm2.tolist()
        }
    }

def gerar_perfil_rao(epsilon, Rt_mm, Re_mm, l_percentual=80):
    """
    Gera perfil Rao (Bell Nozzle) usando aproximação quadrática de Bézier.
    Baseado na lógica de 'tubeira_sino.py' mas integrado aqui para simplicidade.
    Entradas e Saídas em mm.
    """
    # 1. Determinar ângulos da parede (Theta_n e Theta_e) baseados na expansão
    # Tabela simplificada de Rao
    eps_refs = [4, 10, 20, 50, 100]
    tn_refs = [21.5, 26.3, 28.8, 31.5, 33.5] # Ângulo logo após a garganta
    te_refs = [14.0, 11.0, 9.0, 7.5, 7.0]    # Ângulo na saída

    ep_clamp = max(4, min(100, epsilon))
    theta_n = np.radians(np.interp(ep_clamp, eps_refs, tn_refs))
    theta_e = np.radians(np.interp(ep_clamp, eps_refs, te_refs))

    # 2. Comprimento da Tubeira (L_total)
    # Define o comprimento como uma porcentagem de um cone equivalente de 15°
    L_cone_15 = (Re_mm - Rt_mm) / np.tan(np.radians(15))
    L_total = (l_percentual / 100.0) * L_cone_15

    if L_total <= 0: L_total = 1.0

    # 3. Arco de saída da garganta (Circular)
    # Vai de -90 graus (vertical) até (theta_n - 90)
    # Raio do arco de saída é tipicamente 0.382 * Rt
    R_arc = 0.382 * Rt_mm

    angle_start = -np.pi / 2
    angle_end = theta_n - np.pi / 2
    t_arc = np.linspace(angle_start, angle_end, 20)

    # Centro do arco deslocado para que comece em (0, Rt)
    # Coordenada X do centro = 0
    # Coordenada Y do centro = Rt + R_arc
    x_arc = R_arc * np.cos(t_arc)
    y_arc = R_arc * np.sin(t_arc) + (Rt_mm + R_arc)

    # Ponto de Inflexão (N) - Onde o arco termina e a parábola começa
    Nx, Ny = x_arc[-1], y_arc[-1]

    # Ponto de Saída (E)
    Ex, Ey = L_total, Re_mm

    # 4. Parábola (Bézier Quadrática)
    # Ponto de Controle (Q) - Interseção das tangentes em N e E
    m1 = np.tan(theta_n)
    m2 = np.tan(theta_e)

    # Evitar divisão por zero
    if abs(m1 - m2) < 1e-5: m2 += 0.001

    Qx = (Ey - Ny + m1*Nx - m2*Ex) / (m1 - m2)
    Qy = m1 * (Qx - Nx) + Ny

    # Gerar pontos da curva
    t = np.linspace(0, 1, 80)
    x_bell = (1-t)**2 * Nx + 2*(1-t)*t * Qx + t**2 * Ex
    y_bell = (1-t)**2 * Ny + 2*(1-t)*t * Qy + t**2 * Ey

    # 5. Concatenar
    x_final = np.concatenate([x_arc, x_bell[1:]])
    y_final = np.concatenate([y_arc, y_bell[1:]])

    return x_final, y_final, L_total