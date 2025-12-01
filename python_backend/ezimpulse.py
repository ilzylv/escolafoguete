"""
EZImpulse Calculator - Implementação baseada no método simplificado de Richard Nakka
Referência: http://www.nakka-rocketry.net/articles/altcalc.pdf

Este módulo calcula o impulso total necessário para atingir um apogeu desejado,
NÃO simula a trajetória completa do foguete.
"""

import math
from typing import Dict, Any

def get_drag_reduction_factors(N):
    """
    Retorna os fatores de redução de arrasto baseados no Drag Influence Number (N)
    
    Args:
        N: Drag Influence Number
        
    Returns:
        dict com fz, fzbo, fv, ft (fatores de redução)
    """
    # Dados do gráfico de redução de arrasto (aproximação por interpolação linear)
    # N vs (fz, fzbo, fv, ft)
    drag_data = [
        (0, 1.00, 1.00, 1.00, 1.00),
        (100, 0.85, 0.98, 0.95, 0.75),
        (200, 0.72, 0.96, 0.88, 0.68),
        (300, 0.63, 0.95, 0.82, 0.65),
        (400, 0.57, 0.94, 0.77, 0.62),
        (500, 0.52, 0.93, 0.73, 0.60),
        (600, 0.48, 0.92, 0.70, 0.58),
        (700, 0.45, 0.91, 0.67, 0.57),
        (800, 0.43, 0.91, 0.65, 0.56),
        (900, 0.41, 0.90, 0.63, 0.55),
        (1000, 0.40, 0.90, 0.62, 0.55),
    ]
    
    # Interpolação linear
    if N <= 0:
        return {"fz": 1.0, "fzbo": 1.0, "fv": 1.0, "ft": 1.0}
    elif N >= 1000:
        return {"fz": 0.40, "fzbo": 0.90, "fv": 0.62, "ft": 0.55}
    
    # Encontrar intervalo
    for i in range(len(drag_data) - 1):
        N1, fz1, fzbo1, fv1, ft1 = drag_data[i]
        N2, fz2, fzbo2, fv2, ft2 = drag_data[i + 1]
        
        if N1 <= N <= N2:
            # Interpolação linear
            t = (N - N1) / (N2 - N1)
            fz = fz1 + t * (fz2 - fz1)
            fzbo = fzbo1 + t * (fzbo2 - fzbo1)
            fv = fv1 + t * (fv2 - fv1)
            ft = ft1 + t * (ft2 - ft1)
            return {"fz": fz, "fzbo": fzbo, "fv": fv, "ft": ft}
    
    return {"fz": 0.40, "fzbo": 0.90, "fv": 0.62, "ft": 0.55}

def get_motor_class(total_impulse_ns):
    """
    Determina a classe do motor baseado no impulso total
    
    Args:
        total_impulse_ns: Impulso total em N·s
        
    Returns:
        str: Classe do motor (A, B, C, ..., O) com percentual
    """
    classes = [
        (2.5, 'A'), (5, 'B'), (10, 'C'), (20, 'D'), (40, 'E'),
        (80, 'F'), (160, 'G'), (320, 'H'), (640, 'I'), (1280, 'J'),
        (2560, 'K'), (5120, 'L'), (10240, 'M'), (20480, 'N'), (40960, 'O')
    ]
    
    for max_impulse, class_letter in classes:
        if total_impulse_ns <= max_impulse:
            min_impulse = max_impulse / 2
            percentage = ((total_impulse_ns - min_impulse) / (max_impulse - min_impulse)) * 100
            return f"{class_letter}{percentage:.0f}%"
    
    return "O+100%"

def calcular_performance_ezimpulse(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula o impulso total necessário para atingir um apogeu alvo
    usando o método simplificado de Richard Nakka (EZImpulse)
    
    Args:
        params: Dicionário com parâmetros de entrada
            - target_apogee_m: Apogeu alvo em metros
            - burn_time_s: Tempo de queima do motor em segundos
            - rocket_empty_mass_kg: Massa vazia do foguete (sem propelente) em kg
            - propellant_mass_percent: Percentual de massa de propelente (0-100)
            - rocket_diameter_cm: Diâmetro máximo do foguete em centímetros
            - drag_coefficient: Coeficiente de arrasto (Cd)
        
    Returns:
        dict com todos os resultados calculados
    """
    # Extrair parâmetros
    target_apogee_m = params.get("target_apogee_m", 500.0)
    burn_time_s = params.get("burn_time_s", 3.0)
    rocket_empty_mass_kg = params.get("rocket_empty_mass_kg", 2.0)
    propellant_mass_percent = params.get("propellant_mass_percent", 20.0)
    rocket_diameter_cm = params.get("rocket_diameter_cm", 10.0)
    drag_coefficient = params.get("drag_coefficient", 0.4)
    
    g = 9.81  # m/s²
    
    # Converter percentual para fração
    propellant_fraction = propellant_mass_percent / 100.0
    
    # Calcular massa de propelente
    propellant_mass_kg = rocket_empty_mass_kg * propellant_fraction
    
    # Massa média durante a queima
    avg_mass_kg = rocket_empty_mass_kg + 0.5 * propellant_mass_kg
    
    # ITERAÇÃO: Começar com estimativa inicial de empuxo
    # Assumir que o foguete atinge o apogeu alvo
    # F_initial = m * g (empuxo igual ao peso)
    F_avg_n = avg_mass_kg * g * 3.0  # Estimativa inicial conservadora
    
    # Iterar para convergir
    max_iterations = 20
    for iteration in range(max_iterations):
        # Calcular altitude de burnout (arrasto zero)
        z1_m = 0.5 * (F_avg_n / avg_mass_kg - g) * burn_time_s ** 2
        
        # Velocidade de burnout (arrasto zero)
        if z1_m > 0:
            v1_ms = math.sqrt((2 * z1_m / avg_mass_kg) * (F_avg_n - avg_mass_kg * g))
        else:
            v1_ms = 0.0
        
        # Altitude de pico (arrasto zero)
        z2_m = (F_avg_n * z1_m) / (avg_mass_kg * g) if avg_mass_kg * g > 0 else 0
        
        # Tempo até apogeu (arrasto zero)
        if z2_m > z1_m:
            t2_s = burn_time_s + math.sqrt((2 / g) * (z2_m - z1_m))
        else:
            t2_s = burn_time_s
        
        # Calcular Drag Influence Number
        N = (drag_coefficient * (rocket_diameter_cm ** 2) * (v1_ms ** 2)) / (1000 * rocket_empty_mass_kg)
        
        # Obter fatores de redução de arrasto
        factors = get_drag_reduction_factors(N)
        
        # Aplicar correções de arrasto
        z2_corrected_m = factors["fz"] * z2_m
        z1_corrected_m = factors["fzbo"] * z1_m
        v1_corrected_ms = factors["fv"] * v1_ms
        t2_corrected_s = factors["ft"] * t2_s
        
        # Verificar se atingiu o apogeu alvo
        error = abs(z2_corrected_m - target_apogee_m)
        if error < 1.0:  # Tolerância de 1 metro
            break
        
        # Ajustar empuxo para próxima iteração
        if z2_corrected_m > 0:
            F_avg_n *= (target_apogee_m / z2_corrected_m) ** 0.5
        else:
            F_avg_n *= 1.5
    
    # Calcular impulso total necessário
    total_impulse_ns = F_avg_n * burn_time_s
    
    # Calcular impulso específico necessário
    isp_s = total_impulse_ns / (propellant_mass_kg * g) if propellant_mass_kg > 0 else 0
    
    # Calcular número de Mach no burnout (aproximação)
    speed_of_sound_ms = 340.0  # m/s ao nível do mar
    mach_burnout = v1_corrected_ms / speed_of_sound_ms
    
    # Determinar classe do motor
    motor_class = get_motor_class(total_impulse_ns)
    
    # Calcular aceleração máxima (conservadora, no início da queima)
    max_acceleration_g = F_avg_n / (rocket_empty_mass_kg + propellant_mass_kg) / g
    
    # Validações
    warnings = []
    if N > 2000:
        warnings.append(f"AVISO: Número de influência de arrasto N={N:.0f} excede 2000. Método pode ser impreciso.")
    if isp_s > 250:
        warnings.append(f"AVISO: Impulso específico Isp={isp_s:.0f}s excede 250s. Verifique se o propelente é realista.")
    
    return {
        "parametros_calculados": {
            "propellant_mass_kg": float(propellant_mass_kg),
            "burnout_velocity_ms": float(v1_corrected_ms),
            "mach_burnout": float(mach_burnout),
            "total_impulse_ns": float(total_impulse_ns),
            "motor_class": motor_class,
            "burnout_altitude_m": float(z1_corrected_m),
            "average_thrust_n": float(F_avg_n),
            "specific_impulse_s": float(isp_s),
            "drag_influence_number": float(N),
            "peak_altitude_m": float(z2_corrected_m),
            "time_to_apogee_s": float(t2_corrected_s),
            "max_acceleration_g": float(max_acceleration_g),
            "drag_factors": factors,
            "warnings": warnings
        }
    }
