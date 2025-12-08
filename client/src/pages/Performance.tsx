import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Loader2, Play, AlertTriangle, Info, TrendingUp, Rocket, Target, Wind, Weight } from "lucide-react";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const PYTHON_API_URL = import.meta.env.PROD
  ? "https://escolafoguete.onrender.com"
  : "http://localhost:10000";

interface EZImpulseParams {
  target_apogee_m: number;
  burn_time_s: number;
  rocket_empty_mass_kg: number;
  propellant_mass_percent: number;
  rocket_diameter_cm: number;
  drag_coefficient: number;
}

interface PerformanceResult {
  parametros_calculados: {
    peak_altitude_m: number;
    total_impulse_ns: number;
    motor_class: string;
    average_thrust_n: number;
    specific_impulse_s: number;
    propellant_mass_kg: number;
    burnout_velocity_ms: number;
    mach_burnout: number;
    time_to_apogee_s: number;
    drag_influence_number: number;
    warnings: string[];
    drag_factors: {
      fz: number;
      fv: number;
      ft: number;
    };
  };
}

const InputWithTooltip = ({
                            id,
                            label,
                            value,
                            onChange,
                            tooltip,
                            unit
                          }: {
  id: string,
  label: string,
  value: number,
  onChange: (val: string) => void,
  tooltip: React.ReactNode,
  unit?: string
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="font-medium text-sm">{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
    <div className="relative">
      <Input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
      />
      {unit && (
        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

const ResultCard = ({ title, value, unit, icon: Icon, colorClass, highlight }: any) => (
  <div className={`flex items-center p-3 rounded-lg border transition-colors ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-muted/40 hover:bg-muted/60'}`}>
    <div className={`p-2 rounded-full mr-3 ${colorClass} bg-opacity-10`}>
      <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{title}</p>
      <p className="text-lg font-bold">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  </div>
);

export default function Performance() {
  const [params, setParams] = useState<EZImpulseParams>({
    target_apogee_m: 500,
    burn_time_s: 1.0,
    rocket_empty_mass_kg: 2.5,
    propellant_mass_percent: 14,
    rocket_diameter_cm: 5.0,
    drag_coefficient: 0.45,
  });

  // --- MUDANÇA 1: Estados locais em vez de tRPC hooks ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PerformanceResult | null>(null);

  // --- MUDANÇA 2: Função fetch manual ---
  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${PYTHON_API_URL}/api/performance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erro ao calcular");
      }

      const data = await response.json();
      setResult(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EZImpulseParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  // Helper para acessar os resultados facilmente
  const results = result?.parametros_calculados;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Predição de Performance (EZImpulse)</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-1">
            Ferramenta para estimar requisitos do motor para atingir um apogeu alvo.
          </p>
        </div>

        <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm flex flex-wrap gap-1">
            <strong>Nota:</strong> Esta ferramenta calcula o <strong>impulso total necessário</strong> para atingir uma altitude específica (<em>Goal Seeking</em>). Não é uma simulação de voo completa (6-DOF), servindo apenas para o dimensionamento inicial do motor.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <Card className="lg:col-span-4 h-fit sticky top-6 shadow-md border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Parâmetros de Entrada</CardTitle>
              <CardDescription>Defina o objetivo e o veículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-3 w-3" /> Objetivo & Motor
                </h4>
                <InputWithTooltip
                  id="target_apogee_m"
                  label="Apogeu Alvo"
                  value={params.target_apogee_m}
                  onChange={(v) => handleInputChange("target_apogee_m", v)}
                  tooltip="Altitude máxima vertical desejada (em metros) a partir do solo."
                  unit="m"
                />
                <InputWithTooltip
                  id="burn_time_s"
                  label="Tempo de Queima"
                  value={params.burn_time_s}
                  onChange={(v) => handleInputChange("burn_time_s", v)}
                  tooltip="Tempo total de operação do motor (do início da pressão até a queda de empuxo)."
                  unit="s"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Rocket className="h-3 w-3" /> Veículo
                </h4>
                <InputWithTooltip
                  id="rocket_empty_mass_kg"
                  label="Massa Vazia"
                  value={params.rocket_empty_mass_kg}
                  onChange={(v) => handleInputChange("rocket_empty_mass_kg", v)}
                  tooltip={<p>Massa do foguete <strong>SEM</strong> propelente.<br/>Inclui fuselagem, eletrônica, paraquedas e motor vazio.</p>}
                  unit="kg"
                />
                <InputWithTooltip
                  id="propellant_mass_percent"
                  label="% Massa Propelente"
                  value={params.propellant_mass_percent}
                  onChange={(v) => handleInputChange("propellant_mass_percent", v)}
                  tooltip={<p>Razão entre massa de propelente e massa vazia.<br/>Ex: Se m_vazia=2.5kg e m_prop=0.35kg, valor = 14%.</p>}
                  unit="%"
                />
                <InputWithTooltip
                  id="rocket_diameter_cm"
                  label="Diâmetro Máximo"
                  value={params.rocket_diameter_cm}
                  onChange={(v) => handleInputChange("rocket_diameter_cm", v)}
                  tooltip="Maior diâmetro da fuselagem. Usado para cálculo de arrasto aerodinâmico."
                  unit="cm"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Wind className="h-3 w-3" /> Aerodinâmica
                </h4>
                <InputWithTooltip
                  id="drag_coefficient"
                  label="Coeficiente de Arrasto (Cd)"
                  value={params.drag_coefficient}
                  onChange={(v) => handleInputChange("drag_coefficient", v)}
                  tooltip={
                    <ul className="list-disc pl-3 space-y-1">
                      <li><strong>0.35:</strong> Acabamento excelente, liso.</li>
                      <li><strong>0.45:</strong> Acabamento padrão (parafusos expostos).</li>
                      <li><strong>0.55+:</strong> Acabamento básico/rústico.</li>
                    </ul>
                  }
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={loading} // Alterado para usar state loading
                className="w-full shadow-lg hover:shadow-xl transition-all font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Calcular Requisitos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          <div className="lg:col-span-8 space-y-6">
            {error && ( // Alterado para usar state error
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao calcular: {error}
                </AlertDescription>
              </Alert>
            )}

            {results && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos do Motor</CardTitle>
                    <CardDescription>Para atingir {results.peak_altitude_m?.toFixed(0)}m de apogeu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <ResultCard
                          title="Impulso Total Necessário"
                          value={results.total_impulse_ns?.toFixed(1)}
                          unit="N·s"
                          icon={Rocket}
                          colorClass="text-purple-600 bg-purple-100"
                          highlight={true}
                        />
                      </div>

                      <ResultCard
                        title="Classe do Motor"
                        value={results.motor_class}
                        unit=""
                        icon={Target}
                        colorClass="text-blue-600 bg-blue-100"
                      />
                      <ResultCard
                        title="Empuxo Médio"
                        value={results.average_thrust_n?.toFixed(1)}
                        unit="N"
                        icon={TrendingUp}
                        colorClass="text-green-600 bg-green-100"
                      />
                      <ResultCard
                        title="Isp Necessário"
                        value={results.specific_impulse_s?.toFixed(0)}
                        unit="s"
                        icon={Wind}
                        colorClass="text-orange-600 bg-orange-100"
                      />
                      <ResultCard
                        title="Massa Propelente"
                        value={results.propellant_mass_kg?.toFixed(3)}
                        unit="kg"
                        icon={Weight}
                        colorClass="text-slate-600 bg-slate-100"
                      />
                    </div>

                    {results.warnings && results.warnings.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        {results.warnings.map((warning: string, i: number) => (
                          <div key={i} className="flex gap-2 text-sm text-yellow-800 items-start">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">Parâmetros de Voo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Apogeu Calculado</span>
                        <span className="font-bold">{results.peak_altitude_m?.toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Velocidade Burnout</span>
                        <span className="font-mono">{results.burnout_velocity_ms?.toFixed(1)} m/s</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Mach Burnout</span>
                        <span className="font-mono">{results.mach_burnout?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Tempo até Apogeu</span>
                        <span className="font-mono">{results.time_to_apogee_s?.toFixed(1)} s</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm text-muted-foreground">Drag Number (N)</span>
                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{results.drag_influence_number?.toFixed(0)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">Fatores de Perda (Arrasto)</CardTitle>
                      <CardDescription>Eficiência vs. Vácuo (1.0 = Ideal)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Altitude Pico (fz)</span>
                          <span className="font-mono">{results.drag_factors?.fz?.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full transition-all" style={{ width: `${(results.drag_factors?.fz || 0) * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Velocidade Máx (fv)</span>
                          <span className="font-mono">{results.drag_factors?.fv?.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(results.drag_factors?.fv || 0) * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Tempo Voo (ft)</span>
                          <span className="font-mono">{results.drag_factors?.ft?.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full transition-all" style={{ width: `${(results.drag_factors?.ft || 0) * 100}%` }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <Card className="mt-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Equações do Método</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  O <strong>Drag Influence Number (N)</strong> é o principal fator de correção do método Nakka:
                </p>
                <div className="bg-muted p-3 rounded text-center my-2">
                  <BlockMath math="N = \frac{C_d \cdot D^2 \cdot V_{burnout}^2}{1000 \cdot m_{vazia}}" />
                </div>
                <p className="text-xs text-center">
                  (Onde <InlineMath math="D" /> é em cm, <InlineMath math="V" /> em m/s e <InlineMath math="m" /> em kg)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}