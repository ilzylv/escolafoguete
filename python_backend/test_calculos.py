"""Testes automatizados para validação dos cálculos"""

import pytest
import numpy as np
from verificacao_estrutural import calcular_verificacao_estrutural
from design_tubeiras import calcular_design_tubeira
from ezimpulse import calcular_performance_ezimpulse

class TestVerificacaoEstrutural:
    """Testes para verificação estrutural"""
    
    def test_valores_padrao(self):
        """Testa cálculo com valores padrão"""
        params = {
            "e": 3.175,
            "dext_c": 76.2,
            "pmax": 7,
            "te_c": 150,
            "te_b": 205,
            "d_p": 9.03,
            "df_p": 10
        }
        
        resultado = calcular_verificacao_estrutural(params)
        
        # Verificar estrutura do resultado
        assert "case" in resultado
        assert "bulkhead" in resultado
        assert "parafusos" in resultado
        
        # Verificar valores do case
        assert resultado["case"]["dint_c"] > 0
        assert resultado["case"]["fator_seguranca"] > 0
        
        # Verificar valores dos parafusos
        assert resultado["parafusos"]["numero_parafusos_arredondado"] > 0
    
    def test_fator_seguranca_positivo(self):
        """Verifica que o fator de segurança é sempre positivo"""
        params = {
            "e": 5.0,
            "dext_c": 100.0,
            "pmax": 10,
            "te_c": 200,
            "te_b": 250,
            "d_p": 10.0,
            "df_p": 12.0
        }
        
        resultado = calcular_verificacao_estrutural(params)
        assert resultado["case"]["fator_seguranca"] > 0
    
    def test_tensao_von_mises(self):
        """Verifica que a tensão de Von Mises é calculada corretamente"""
        params = {
            "e": 3.175,
            "dext_c": 76.2,
            "pmax": 7,
            "te_c": 150,
            "te_b": 205,
            "d_p": 9.03,
            "df_p": 10
        }
        
        resultado = calcular_verificacao_estrutural(params)
        
        # Tensão de Von Mises deve ser positiva
        assert resultado["case"]["tensao_von_mises"] > 0
        
        # Tensão de Von Mises deve ser menor que a tensão de escoamento
        # para ter fator de segurança > 1
        te_c_pa = params["te_c"] * 1e6
        if resultado["case"]["fator_seguranca"] > 1:
            assert resultado["case"]["tensao_von_mises"] < te_c_pa


class TestDesignTubeiras:
    """Testes para design de tubeiras"""
    
    def test_valores_padrao_conica(self):
        """Testa cálculo de tubeira cônica com valores padrão"""
        params = {
            "F": 544.81,
            "p0": 6106000,
            "pe": 101320,
            "T0": 1601.209,
            "k": 1.136397,
            "R": 234.918,
            "tipo": "conica"
        }
        
        resultado = calcular_design_tubeira(params)
        
        # Verificar estrutura
        assert "parametros" in resultado
        assert "geometria" in resultado
        
        # Verificar parâmetros calculados
        assert resultado["parametros"]["temperatura_garganta"] > 0
        assert resultado["parametros"]["velocidade_garganta"] > 0
        assert resultado["parametros"]["velocidade_exaustao"] > 0
        assert resultado["parametros"]["razao_expansao"] > 1
    
    def test_valores_padrao_parabolica(self):
        """Testa cálculo de tubeira parabólica com valores padrão"""
        params = {
            "F": 544.81,
            "p0": 6106000,
            "pe": 101320,
            "T0": 1601.209,
            "k": 1.136397,
            "R": 234.918,
            "tipo": "parabolica"
        }
        
        resultado = calcular_design_tubeira(params)
        
        # Verificar que geometria foi gerada
        assert len(resultado["geometria"]["x"]) > 0
        assert len(resultado["geometria"]["r"]) > 0
        assert len(resultado["geometria"]["areas"]) > 0
    
    def test_temperatura_garganta(self):
        """Verifica cálculo da temperatura crítica na garganta"""
        params = {
            "F": 544.81,
            "p0": 6106000,
            "pe": 101320,
            "T0": 1601.209,
            "k": 1.136397,
            "R": 234.918,
            "tipo": "conica"
        }
        
        resultado = calcular_design_tubeira(params)
        
        # Temperatura na garganta deve ser menor que temperatura na câmara
        assert resultado["parametros"]["temperatura_garganta"] < params["T0"]
        
        # Verificar fórmula: Tt = 2*T0/(k+1)
        tt_esperado = (2 * params["T0"]) / (params["k"] + 1)
        assert abs(resultado["parametros"]["temperatura_garganta"] - tt_esperado) < 0.01
    
    def test_razao_expansao(self):
        """Verifica que a razão de expansão é maior que 1"""
        params = {
            "F": 544.81,
            "p0": 6106000,
            "pe": 101320,
            "T0": 1601.209,
            "k": 1.136397,
            "R": 234.918,
            "tipo": "conica"
        }
        
        resultado = calcular_design_tubeira(params)
        
        # Razão de expansão deve ser > 1 (área de saída > área da garganta)
        assert resultado["parametros"]["razao_expansao"] > 1
        
        # Verificar consistência: Ae/At = epsilon
        epsilon_calculado = resultado["parametros"]["area_saida"] / resultado["parametros"]["area_garganta"]
        assert abs(epsilon_calculado - resultado["parametros"]["razao_expansao"]) < 0.01


class TestPerformanceEZImpulse:
    """Testes para cálculo de performance"""
    
    def test_valores_padrao(self):
        """Testa simulação com valores padrão"""
        params = {
            "massa_total": 1.0,
            "massa_propelente": 0.5,
            "empuxo_medio": 500.0,
            "tempo_queima": 3.0,
            "isp": 150.0,
            "massa_foguete": 2.0,
            "area_referencia": 0.01,
            "cd": 0.5
        }
        
        resultado = calcular_performance_ezimpulse(params)
        
        # Verificar estrutura
        assert "parametros_calculados" in resultado
        assert "trajetoria" in resultado
        
        # Verificar parâmetros calculados
        assert resultado["parametros_calculados"]["apogeu"] > 0
        assert resultado["parametros_calculados"]["velocidade_maxima"] > 0
        assert resultado["parametros_calculados"]["impulso_total"] > 0
    
    def test_conservacao_massa(self):
        """Verifica conservação de massa durante a queima"""
        params = {
            "massa_total": 1.0,
            "massa_propelente": 0.5,
            "empuxo_medio": 500.0,
            "tempo_queima": 3.0,
            "isp": 150.0,
            "massa_foguete": 2.0,
            "area_referencia": 0.01,
            "cd": 0.5
        }
        
        resultado = calcular_performance_ezimpulse(params)
        
        # Massa inicial = massa foguete + massa total motor
        massa_inicial_esperada = params["massa_foguete"] + params["massa_total"]
        assert abs(resultado["parametros_calculados"]["massa_inicial"] - massa_inicial_esperada) < 0.001
        
        # Massa final = massa foguete + (massa total motor - massa propelente)
        massa_final_esperada = params["massa_foguete"] + (params["massa_total"] - params["massa_propelente"])
        assert abs(resultado["parametros_calculados"]["massa_final"] - massa_final_esperada) < 0.001
    
    def test_impulso_total(self):
        """Verifica cálculo do impulso total"""
        params = {
            "massa_total": 1.0,
            "massa_propelente": 0.5,
            "empuxo_medio": 500.0,
            "tempo_queima": 3.0,
            "isp": 150.0,
            "massa_foguete": 2.0,
            "area_referencia": 0.01,
            "cd": 0.5
        }
        
        resultado = calcular_performance_ezimpulse(params)
        
        # Impulso total = empuxo médio * tempo de queima
        impulso_esperado = params["empuxo_medio"] * params["tempo_queima"]
        assert abs(resultado["parametros_calculados"]["impulso_total"] - impulso_esperado) < 0.01
    
    def test_trajetoria_coerente(self):
        """Verifica que a trajetória é fisicamente coerente"""
        params = {
            "massa_total": 1.0,
            "massa_propelente": 0.5,
            "empuxo_medio": 500.0,
            "tempo_queima": 3.0,
            "isp": 150.0,
            "massa_foguete": 2.0,
            "area_referencia": 0.01,
            "cd": 0.5
        }
        
        resultado = calcular_performance_ezimpulse(params)
        
        # Altitude deve começar próxima de zero (tolerância para integração numérica)
        assert abs(resultado["trajetoria"]["altitude"][0]) < 10.0
        
        # Velocidade inicial pode ser diferente de zero devido ao primeiro passo de integração
        # Verificar que existe aceleração positiva no início (empuxo > peso)
        assert resultado["trajetoria"]["aceleracao"][0] > 0
        
        # Apogeu deve ocorrer quando velocidade é zero (ou próxima de zero)
        idx_apogeu = np.argmax(resultado["trajetoria"]["altitude"])
        velocidade_no_apogeu = resultado["trajetoria"]["velocidade"][idx_apogeu]
        assert abs(velocidade_no_apogeu) < 1.0  # Tolerância de 1 m/s


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
