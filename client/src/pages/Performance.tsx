import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Loader2, Play, AlertTriangle, Info } from "lucide-react";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface EZImpulseParams {
  target_apogee_m: number;
  burn_time_s: number;
  rocket_empty_mass_kg: number;
  propellant_mass_percent: number;
  rocket_diameter_cm: number;
  drag_coefficient: number;
}

export default function Performance() {
  const [params, setParams] = useState<EZImpulseParams>({
    target_apogee_m: 500,
    burn_time_s: 3.0,
    rocket_empty_mass_kg: 1.5,
    propellant_mass_percent: 20,
    rocket_diameter_cm: 8,
    drag_coefficient: 0.4,
  });

  const mutation = trpc.calculosEngenharia.performance.useMutation();

  const handleCalculate = () => {
    mutation.mutate(params);
  };

  const handleInputChange = (field: keyof EZImpulseParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  const results = mutation.data?.parametros_calculados;

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">EZImpulse - Cálculo de Performance</h1>
        <p className="text-muted-foreground">
          Calculadora baseada no método simplificado de Richard Nakka para estimar o impulso total necessário para atingir um apogeu desejado
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Sobre o EZImpulse:</strong> Esta ferramenta calcula o <strong>impulso total necessário</strong> do motor para atingir um apogeu alvo, 
          considerando arrasto aerodinâmico. NÃO simula a trajetória completa. Use software como RASAero ou OpenRocket para simulações detalhadas.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros de Entrada</CardTitle>
            <CardDescription>Configure as características do foguete e objetivos da missão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target_apogee_m">
                Apogeu Alvo (metros)
              </Label>
              <Input
                id="target_apogee_m"
                type="number"
                step="10"
                value={params.target_apogee_m}
                onChange={(e) => handleInputChange("target_apogee_m", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Altitude máxima desejada</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="burn_time_s">
                Tempo de Queima do Motor (segundos)
              </Label>
              <Input
                id="burn_time_s"
                type="number"
                step="0.1"
                value={params.burn_time_s}
                onChange={(e) => handleInputChange("burn_time_s", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Duração da queima do propelente</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rocket_empty_mass_kg">
                Massa Vazia do Foguete (kg)
              </Label>
              <Input
                id="rocket_empty_mass_kg"
                type="number"
                step="0.1"
                value={params.rocket_empty_mass_kg}
                onChange={(e) => handleInputChange("rocket_empty_mass_kg", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Massa do foguete SEM propelente</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propellant_mass_percent">
                Percentual de Massa de Propelente (%)
              </Label>
              <Input
                id="propellant_mass_percent"
                type="number"
                step="1"
                value={params.propellant_mass_percent}
                onChange={(e) => handleInputChange("propellant_mass_percent", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Massa de propelente relativa à massa vazia (tipicamente 15-30%)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rocket_diameter_cm">
                Diâmetro do Foguete (cm)
              </Label>
              <Input
                id="rocket_diameter_cm"
                type="number"
                step="0.1"
                value={params.rocket_diameter_cm}
                onChange={(e) => handleInputChange("rocket_diameter_cm", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Diâmetro máximo do corpo do foguete</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drag_coefficient">
                Coeficiente de Arrasto (Cd)
              </Label>
              <Input
                id="drag_coefficient"
                type="number"
                step="0.01"
                value={params.drag_coefficient}
                onChange={(e) => handleInputChange("drag_coefficient", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                0.35 (aerodinâmico), 0.40 (padrão), 0.45-0.50 (básico)
              </p>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Calcular Impulso Necessário
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Painel de resultados */}
        <div className="space-y-6">
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erro ao calcular: {mutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {results && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resultados Principais</CardTitle>
                  <CardDescription>Parâmetros do motor necessário</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impulso Total Necessário</p>
                      <p className="text-2xl font-bold">{results.total_impulse_ns?.toFixed(1) ?? 'N/A'} N·s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Classe do Motor</p>
                      <p className="text-2xl font-bold">{results.motor_class ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Empuxo Médio Necessário</p>
                      <p className="text-xl font-semibold">{results.average_thrust_n?.toFixed(1) ?? 'N/A'} N</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Isp Necessário</p>
                      <p className="text-xl font-semibold">{results.specific_impulse_s?.toFixed(0) ?? 'N/A'} s</p>
                    </div>
                  </div>

                  {results.warnings && results.warnings.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {results.warnings.map((warning: string, i: number) => (
                          <div key={i}>{warning}</div>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros de Voo</CardTitle>
                  <CardDescription>Performance estimada do foguete</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Massa de Propelente</span>
                    <span className="font-semibold">{results.propellant_mass_kg?.toFixed(3) ?? 'N/A'} kg</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Altitude de Burnout</span>
                    <span className="font-semibold">{results.burnout_altitude_m?.toFixed(1) ?? 'N/A'} m</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Velocidade de Burnout</span>
                    <span className="font-semibold">{results.burnout_velocity_ms?.toFixed(1) ?? 'N/A'} m/s</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Número de Mach (burnout)</span>
                    <span className="font-semibold">{results.mach_burnout?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Apogeu Estimado</span>
                    <span className="font-semibold">{results.peak_altitude_m?.toFixed(1) ?? 'N/A'} m</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Tempo até Apogeu</span>
                    <span className="font-semibold">{results.time_to_apogee_s?.toFixed(1) ?? 'N/A'} s</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Aceleração Máxima</span>
                    <span className="font-semibold">{results.max_acceleration_g?.toFixed(1) ?? 'N/A'} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Número de Influência de Arrasto (N)</span>
                    <span className="font-semibold">{results.drag_influence_number?.toFixed(0) ?? 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fatores de Redução de Arrasto</CardTitle>
                  <CardDescription>Aplicados aos valores ideais (arrasto zero)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fator de Altitude de Pico (f<sub>z</sub>)</span>
                    <span className="font-mono">{results.drag_factors?.fz?.toFixed(3) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fator de Altitude de Burnout (f<sub>zbo</sub>)</span>
                    <span className="font-mono">{results.drag_factors?.fzbo?.toFixed(3) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fator de Velocidade Máxima (f<sub>v</sub>)</span>
                    <span className="font-mono">{results.drag_factors?.fv?.toFixed(3) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fator de Tempo até Apogeu (f<sub>t</sub>)</span>
                    <span className="font-mono">{results.drag_factors?.ft?.toFixed(3) ?? 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Seção de teoria */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Fundamentos Teóricos</CardTitle>
          <CardDescription>Equações utilizadas no método EZImpulse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Altitude de Burnout (arrasto zero)</h3>
            <BlockMath math="z_1 = \frac{1}{2}\left(\frac{F}{\bar{m}} - g\right)t^2" />
            <p className="text-sm text-muted-foreground mt-2">
              Onde <InlineMath math="F" /> é o empuxo médio, <InlineMath math="\bar{m}" /> é a massa média durante a queima, 
              e <InlineMath math="t" /> é o tempo de queima.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Velocidade de Burnout (arrasto zero)</h3>
            <BlockMath math="V_1 = \sqrt{\frac{2z_1}{\bar{m}}(F - \bar{m}g)}" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Altitude de Pico (arrasto zero)</h3>
            <BlockMath math="z_2 = \frac{F \cdot z_1}{\bar{m} \cdot g}" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Número de Influência de Arrasto</h3>
            <BlockMath math="N = \frac{C_d \cdot D^2 \cdot V_1^2}{1000 \cdot m_d}" />
            <p className="text-sm text-muted-foreground mt-2">
              Onde <InlineMath math="C_d" /> é o coeficiente de arrasto, <InlineMath math="D" /> é o diâmetro em cm, 
              <InlineMath math="V_1" /> é a velocidade de burnout em m/s, e <InlineMath math="m_d" /> é a massa vazia em kg.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Limitação:</strong> O método é válido para <InlineMath math="N < 2000" /> (foguetes de baixa/média performance).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">5. Correção para Arrasto</h3>
            <p className="text-sm text-muted-foreground">
              Os valores ideais são multiplicados pelos fatores de redução obtidos do gráfico de arrasto:
            </p>
            <BlockMath math="z_{peak} = f_z \cdot z_2 \quad\quad z_{burnout} = f_{zbo} \cdot z_1" />
            <BlockMath math="V_{max} = f_v \cdot V_1 \quad\quad t_{peak} = f_t \cdot t_2" />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Referência</h3>
            <p className="text-sm">
              Método desenvolvido por Richard A. Nakka<br />
              <a 
                href="http://www.nakka-rocketry.net/articles/altcalc.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Simplified Method for Estimating the Flight Performance of a Hobby Rocket
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
