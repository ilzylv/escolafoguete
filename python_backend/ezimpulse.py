""""
EZImpulse Calculator - Implementação baseada no método simplificado de Richard Nakka
Referência: http://www.nakka-rocketry.net/articles/altcalc.pdf

Este módulo calcula o impulso total necessário para atingir um apogeu desejado.
"""

import math
from typing import Dict, Any

def get_drag_reduction_factors(N):
    """
    Retorna os fatores de redução de arrasto baseados no Drag Influence Number (N).
    Dados extraídos visualmente do gráfico "Drag Reduction Factors" do PDF do Nakka.

    Tabela de interpolação: (N, fz, fzbo, fv, ft)
    fz: Peak Altitude Factor (Curva roxa/azul escura inferior)
    fzbo: Burnout Altitude Factor (Curva azul superior)
    fv: Max Velocity Factor (Curva verde)
    ft: Time to Apogee Factor (Curva vermelha)
    """
    drag_data = [
        (0,    1.000, 1.000, 1.000, 1.000),
        (50,   0.910, 0.998, 0.995, 0.940),
        (100,  0.840, 0.995, 0.990, 0.890),
        (150,  0.780, 0.992, 0.985, 0.850),
        (200,  0.720, 0.990, 0.980, 0.810),
        (300,  0.630, 0.985, 0.970, 0.750),
        (400,  0.570, 0.980, 0.960, 0.700),
        (500,  0.520, 0.975, 0.950, 0.660),
        (600,  0.480, 0.970, 0.945, 0.630),
        (700,  0.450, 0.965, 0.940, 0.600),
        (800,  0.420, 0.960, 0.935, 0.580),
        (900,  0.405, 0.955, 0.930, 0.570),
        (1000, 0.400, 0.950, 0.925, 0.560),
    ]

    # Limites
    if N <= 0: return {"fz": 1.0, "fzbo": 1.0, "fv": 1.0, "ft": 1.0}
    if N >= 1000: return {"fz": 0.40, "fzbo": 0.95, "fv": 0.925, "ft": 0.56}

    # Interpolação Linear
    for i in range(len(drag_data) - 1):
        N1, fz1, fzbo1, fv1, ft1 = drag_data[i]
        N2, fz2, fzbo2, fv2, ft2 = drag_data[i + 1]

        if N1 <= N <= N2:
            t = (N - N1) / (N2 - N1)
            return {
                "fz": fz1 + t * (fz2 - fz1),
                "fzbo": fzbo1 + t * (fzbo2 - fzbo1),
                "fv": fv1 + t * (fv2 - fv1),
                "ft": ft1 + t * (ft2 - ft1)
            }

    return {"fz": 0.40, "fzbo": 0.95, "fv": 0.925, "ft": 0.56}

def get_motor_class(total_impulse_ns):
    classes = [
        (2.5, 'A'), (5, 'B'), (10, 'C'), (20, 'D'), (40, 'E'),
        (80, 'F'), (160, 'G'), (320, 'H'), (640, 'I'), (1280, 'J'),
        (2560, 'K'), (5120, 'L'), (10240, 'M'), (20480, 'N'), (40960, 'O')
    ]
    for max_impulse, class_letter in classes:
        if total_impulse_ns <= max_impulse:
            min_impulse = max_impulse / 2
            percentage = ((total_impulse_ns - min_impulse) / (max_impulse - min_impulse)) * 100
            return f"{class_letter} {percentage:.0f}%"
    return "O+100%"

def calcular_performance_ezimpulse(params: Dict[str, Any]) -> Dict[str, Any]:
    # Valores padrão seguros baseados nos exemplos do Nakka
    target_apogee_m = float(params.get("target_apogee_m", 500.0))
    burn_time_s = float(params.get("burn_time_s", 1.0))
    rocket_empty_mass_kg = float(params.get("rocket_empty_mass_kg", 2.5))
    propellant_mass_percent = float(params.get("propellant_mass_percent", 14.0))
    rocket_diameter_cm = float(params.get("rocket_diameter_cm", 5.0))
    drag_coefficient = float(params.get("drag_coefficient", 0.45))

    g = 9.81

    # 1. Massa do Propelente (mp = r * md)
    propellant_mass_kg = rocket_empty_mass_kg * (propellant_mass_percent / 100.0)

    # 2. Massa Média (m = md + 0.5*mp)
    avg_mass_kg = rocket_empty_mass_kg + 0.5 * propellant_mass_kg

    # Estimativa inicial de empuxo
    F_avg_n = avg_mass_kg * g * 5.0

    z2_corrected_m = 0
    factors = {}
    v1_ms = 0
    mach_burnout = 0
    z1_corrected_m = 0
    t2_corrected_s = 0
    N = 0

    # Loop de convergência (Goal Seek)
    for _ in range(50):
        # Aceleração efetiva (F/m - g)
        accel_net = (F_avg_n / avg_mass_kg) - g
        if accel_net < 0: accel_net = 0

        # a. Altitude Burnout (Sem arrasto)
        z1_m = 0.5 * accel_net * (burn_time_s ** 2)

        # b. Velocidade Burnout (Sem arrasto) - V1 = sqrt(2 * z1 * accel_net)
        # Nota: Nakka usa V1 = sqrt( (2*z1/m)*(F-mg) ) que é matematicamente igual a sqrt(2*z1*accel_net)
        v1_ms = math.sqrt(2 * z1_m * accel_net) if z1_m > 0 else 0

        # c. Altitude Pico (Sem arrasto)
        z2_m = (F_avg_n * z1_m) / (avg_mass_kg * g) if avg_mass_kg * g > 0 else 0

        # d. Tempo Apogeu (Sem arrasto)
        if z2_m > z1_m:
            t2_s = burn_time_s + math.sqrt((2 / g) * (z2_m - z1_m))
        else:
            t2_s = burn_time_s

        # e. Drag Influence Number (N)
        # Nakka Eq: N = (Cd * D^2 * V1^2) / (1000 * md)
        # D em cm, V1 em m/s, md em kg
        N = (drag_coefficient * (rocket_diameter_cm ** 2) * (v1_ms ** 2)) / (1000 * rocket_empty_mass_kg)

        # f. Fatores de redução
        factors = get_drag_reduction_factors(N)

        # g. Apogeu Corrigido (Zpeak = fz * Z2)
        z2_corrected_m = factors["fz"] * z2_m

        # Verificar erro
        error = z2_corrected_m - target_apogee_m
        if abs(error) < 0.5: break

        # Ajuste do empuxo
        # A relação é aproximadamente Z ~ F^2. Usamos expoente menor para estabilidade.
        if z2_corrected_m > 1:
            ratio = target_apogee_m / z2_corrected_m
            F_avg_n *= math.pow(ratio, 0.55)
        else:
            F_avg_n *= 1.5

    # Resultados Finais corrigidos
    z1_corrected_m = factors["fzbo"] * z1_m
    v1_corrected_ms = factors["fv"] * v1_ms
    t2_corrected_s = factors["ft"] * t2_s

    total_impulse_ns = F_avg_n * burn_time_s
    isp_s = total_impulse_ns / (propellant_mass_kg * g) if propellant_mass_kg > 0 else 0
    mach_burnout = v1_corrected_ms / 340.0

    warnings = []
    if N > 2000: warnings.append(f"Alerta: N ({N:.0f}) > 2000. Fora da faixa de precisão do método.")
    if isp_s > 260: warnings.append(f"Alerta: Isp Requerido ({isp_s:.0f}s) é muito alto para sólidos amadores.")

    return {
        "parametros_calculados": {
            "propellant_mass_kg": float(propellant_mass_kg),
            "burnout_velocity_ms": float(v1_corrected_ms),
            "mach_burnout": float(mach_burnout),
            "total_impulse_ns": float(total_impulse_ns),
            "motor_class": get_motor_class(total_impulse_ns),
            "burnout_altitude_m": float(z1_corrected_m),
            "average_thrust_n": float(F_avg_n),
            "specific_impulse_s": float(isp_s),
            "drag_influence_number": float(N),
            "peak_altitude_m": float(z2_corrected_m),
            "time_to_apogee_s": float(t2_corrected_s),
            "max_acceleration_g": float(F_avg_n / avg_mass_kg / g),
            "drag_factors": factors,
            "warnings": warnings
        }
    }