import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Play,
  Info,
  Wind,
  Thermometer,
  Gauge,
  ArrowRight,
  Maximize,
  Ruler
} from "lucide-react";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PYTHON_API_URL = import.meta.env.PROD
  ? "https://escolafoguete.onrender.com"
  : "http://localhost:10000";

interface Params {
  F: number;
  p0: number;
  pe: number;
  T0: number;
  k: number;
  R: number;
  tipo: "conica" | "parabolica";
  razao_expansao?: number | string; // Adicionado opcional
}

// Interface da resposta do Python
interface DesignResult {
  geometria: {
    x: number[]; // Agora vem em mm do backend
    r: number[]; // Agora vem em mm do backend
    areas: number[]; // Agora vem em mm² do backend
  };
  parametros: {
    velocidade_exaustao: number;
    fluxo_massico: number;
    temperatura_garganta: number;
    velocidade_garganta: number;
    raio_garganta: number; // Vem em mm
    area_garganta: number; // m² ou mm² dependendo do back (ajustado no display)
    raio_saida: number; // Vem em mm
    razao_expansao: number;
    comprimento: number; // Vem em mm
  };
}

// Helper component para input com tooltip
const InputWithTooltip = ({
                            id,
                            label,
                            value,
                            onChange,
                            tooltip,
                            unit,
                            placeholder
                          }: {
  id: string,
  label: string,
  value: number | string,
  onChange: (val: string) => void,
  tooltip: string,
  unit?: string,
  placeholder?: string
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="font-medium text-sm">{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <p className="text-xs">{tooltip}</p>
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
        placeholder={placeholder}
      />
      {unit && (
        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// Helper para card de resultado
const ResultCard = ({ title, value, unit, icon: Icon, colorClass }: any) => (
  <div className="flex items-center p-3 bg-muted/40 rounded-lg border hover:bg-muted/60 transition-colors">
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

export default function DesignTubeiras() {
  const [params, setParams] = useState<Params>({
    F: 544.81,
    p0: 6106000,
    pe: 101320,
    T0: 1601.209,
    k: 1.136397,
    R: 234.918,
    tipo: "conica",
    razao_expansao: "", // Inicializado vazio
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DesignResult | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // 1. CORREÇÃO CRÍTICA: Prepara o payload explicitamente
    // Converte string vazia para null, e string numérica para float
    const razaoNumerica = params.razao_expansao && params.razao_expansao !== ""
      ? parseFloat(params.razao_expansao.toString())
      : null;

    const payload = {
      ...params,
      razao_expansao: razaoNumerica
    };

    // DEBUG: Veja no console do navegador (F12) o que está sendo enviado
    console.log("Enviando payload para o Python:", payload);

    try {
      const response = await fetch(`${PYTHON_API_URL}/api/design-tubeira`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Usa o objeto payload tratado
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

  const handleInputChange = (field: keyof Params, value: string | number) => {
    if (field === "tipo") {
      setParams({ ...params, [field]: value as "conica" | "parabolica" });
    } else if (field === "razao_expansao") {
      // Permite string vazia para limpar o campo
      setParams({ ...params, [field]: value });
    } else {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        setParams({ ...params, [field]: numValue });
      }
    }
  };

  // Preparar dados para gráficos
  // ATENÇÃO: Backend já retorna em mm e mm², não multiplicar novamente!
  const geometryData = result?.geometria
    ? result.geometria.x.map((x: number, i: number) => ({
      x: x,
      r_top: result.geometria.r[i],
      r_bottom: -result.geometria.r[i],
      area: result.geometria.areas[i],
    }))
    : [];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Wind className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Design de Tubeiras</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-1">
            Projeto e otimização de perfis aerodinâmicos para motores foguete
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Painel de inputs */}
          <Card className="lg:col-span-4 h-fit sticky top-6 shadow-md border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Configuração do Motor
              </CardTitle>
              <CardDescription>Defina as condições operacionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tipo" className="font-medium text-sm">Geometria da Tubeira</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                      <TooltipContent><p className="text-xs">A forma do perfil divergente. Cônica é mais fácil de fabricar; Parabólica é mais eficiente.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={params.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conica">Cônica (15°)</SelectItem>
                      <SelectItem value="parabolica">Parabólica (Rao/T.O.P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <InputWithTooltip
                  id="razao_expansao"
                  label="Razão de Expansão (Opcional)"
                  value={params.razao_expansao || ''}
                  onChange={(v) => handleInputChange("razao_expansao", v)}
                  tooltip="Defina manualmente a razão de área (Ae/At) para 'cortar' a tubeira. Deixe vazio para calcular a expansão ótima ideal."
                  placeholder="Ex: 8.0"
                />

                <InputWithTooltip
                  id="F"
                  label="Empuxo Alvo"
                  value={params.F}
                  onChange={(v) => handleInputChange("F", v)}
                  tooltip="A força de propulsão desejada que o motor deve produzir."
                  unit="N"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Thermometer className="h-3 w-3" /> Câmara de Combustão
                </h4>
                <InputWithTooltip
                  id="p0"
                  label="Pressão na Câmara (P₀)"
                  value={params.p0}
                  onChange={(v) => handleInputChange("p0", v)}
                  tooltip="Pressão total de estagnação dentro da câmara de combustão."
                  unit="Pa"
                />
                <InputWithTooltip
                  id="T0"
                  label="Temperatura na Câmara (T₀)"
                  value={params.T0}
                  onChange={(v) => handleInputChange("T0", v)}
                  tooltip="Temperatura total de estagnação dos gases na câmara."
                  unit="K"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Wind className="h-3 w-3" /> Propriedades do Gás
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputWithTooltip
                    id="k"
                    label="Gama (γ)"
                    value={params.k}
                    onChange={(v) => handleInputChange("k", v)}
                    tooltip="Razão de calores específicos (Cp/Cv). Depende da composição do propelente."
                  />
                  <InputWithTooltip
                    id="R"
                    label="Constante (R)"
                    value={params.R}
                    onChange={(v) => handleInputChange("R", v)}
                    tooltip="Constante específica do gás. R = R_univ / MassaMolecular."
                    unit="J/kg·K"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Gauge className="h-3 w-3" /> Ambiente
                </h4>
                <InputWithTooltip
                  id="pe"
                  label="Pressão de Saída (Pe)"
                  value={params.pe}
                  onChange={(v) => handleInputChange("pe", v)}
                  tooltip="Pressão ambiente para cálculo da expansão ótima (ignorada se Razão de Expansão for definida manualmente)."
                  unit="Pa"
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all"
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
                    Executar Dimensionamento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados e visualização */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="geometry" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="geometry">Geometria & Perfil</TabsTrigger>
                <TabsTrigger value="results">Parâmetros Calculados</TabsTrigger>
                <TabsTrigger value="theory">Teoria & Fórmulas</TabsTrigger>
              </TabsList>

              <TabsContent value="geometry" className="space-y-6 animate-in fade-in-50 duration-500">
                {result && (
                  <>
                    <Card className="overflow-hidden border-2 border-primary/10 shadow-sm">
                      <CardHeader className="bg-muted/20 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Perfil Interno da Tubeira</CardTitle>
                            <CardDescription>Visualização do fluxo de gás (corte transversal)</CardDescription>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Fluxo</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-800"></div> Parede</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <ResponsiveContainer width="100%" height={350}>
                          <AreaChart data={geometryData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                            <defs>
                              <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                            <XAxis
                              dataKey="x"
                              label={{ value: 'Comprimento Axial (mm)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                              tick={{fontSize: 12, fill: '#64748b'}}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              label={{ value: 'Raio (mm)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                              tick={{fontSize: 12, fill: '#64748b'}}
                              tickLine={false}
                              axisLine={false}
                            />
                            <RechartsTooltip
                              formatter={(value: number) => [`${Math.abs(value).toFixed(2)} mm`, 'Raio']}
                              labelFormatter={(label) => `Posição: ${parseFloat(label).toFixed(1)} mm`}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

                            <Area
                              type="monotone"
                              dataKey="r_top"
                              stroke="#0f172a"
                              strokeWidth={3}
                              fill="url(#flowGradient)"
                              animationDuration={1500}
                              name="Parede Superior"
                            />

                            <Area
                              type="monotone"
                              dataKey="r_bottom"
                              stroke="#0f172a"
                              strokeWidth={3}
                              fill="url(#flowGradient)"
                              animationDuration={1500}
                              name="Parede Inferior"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Evolução da Área Transversal</CardTitle>
                        <CardDescription>Área de passagem do fluxo ao longo do eixo</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={geometryData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                            <XAxis
                              dataKey="x"
                              label={{ value: 'Posição Axial (mm)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                              tick={{fontSize: 12, fill: '#64748b'}}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              label={{ value: 'Área (mm²)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                              tick={{fontSize: 12, fill: '#64748b'}}
                              tickLine={false}
                              axisLine={false}
                            />
                            <RechartsTooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="area"
                              stroke="#10b981"
                              strokeWidth={2}
                              name="Área Transversal"
                              dot={false}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}

                {!result && !error && !loading && (
                  <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="py-24 flex flex-col items-center text-center text-muted-foreground">
                      <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                        <Wind className="h-10 w-10 text-primary/50" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Aguardando Cálculo</h3>
                      <p className="max-w-md mx-auto">
                        Configure os parâmetros do motor no painel à esquerda e clique em "Executar Dimensionamento" para gerar a geometria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-6 animate-in fade-in-50 duration-500">
                {result && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados do Dimensionamento</CardTitle>
                      <CardDescription>Parâmetros termodinâmicos e geométricos calculados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 pb-2 border-b mb-2">
                          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <Wind className="h-4 w-4" /> Performance
                          </h3>
                        </div>
                        <ResultCard
                          title="Velocidade de Exaustão (Ve)"
                          value={result.parametros.velocidade_exaustao.toFixed(2)}
                          unit="m/s"
                          icon={Wind}
                          colorClass="text-blue-600 bg-blue-100"
                        />
                        <ResultCard
                          title="Fluxo Mássico"
                          value={result.parametros.fluxo_massico.toFixed(4)}
                          unit="kg/s"
                          icon={ArrowRight}
                          colorClass="text-green-600 bg-green-100"
                        />
                        <ResultCard
                          title="Temperatura na Garganta"
                          value={result.parametros.temperatura_garganta.toFixed(2)}
                          unit="K"
                          icon={Thermometer}
                          colorClass="text-red-600 bg-red-100"
                        />
                        <ResultCard
                          title="Velocidade na Garganta"
                          value={result.parametros.velocidade_garganta.toFixed(2)}
                          unit="m/s"
                          icon={Gauge}
                          colorClass="text-orange-600 bg-orange-100"
                        />

                        <div className="md:col-span-2 mt-6 pb-2 border-b mb-2">
                          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <Ruler className="h-4 w-4" /> Geometria (Em milímetros)
                          </h3>
                        </div>

                        <ResultCard
                          title="Raio da Garganta (Rt)"
                          value={result.parametros.raio_garganta.toFixed(2)} // Backend já entrega em mm
                          unit="mm"
                          icon={Ruler}
                          colorClass="text-purple-600 bg-purple-100"
                        />
                        <ResultCard
                          title="Área da Garganta (At)"
                          value={(result.parametros.area_garganta * 1e6).toFixed(2)} // Ajuste para mm²
                          unit="mm²"
                          icon={Maximize}
                          colorClass="text-purple-600 bg-purple-100"
                        />
                        <ResultCard
                          title="Raio de Saída (Re)"
                          value={result.parametros.raio_saida.toFixed(2)} // Backend já entrega em mm
                          unit="mm"
                          icon={Ruler}
                          colorClass="text-indigo-600 bg-indigo-100"
                        />
                        <ResultCard
                          title="Razão de Expansão (ε)"
                          value={result.parametros.razao_expansao.toFixed(3)}
                          unit=""
                          icon={Maximize}
                          colorClass="text-indigo-600 bg-indigo-100"
                        />
                        <ResultCard
                          title="Comprimento Divergente"
                          value={result.parametros.comprimento.toFixed(2)} // Backend já entrega em mm
                          unit="mm"
                          icon={Ruler}
                          colorClass="text-gray-600 bg-gray-100"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                      <CardTitle className="text-destructive flex items-center gap-2">
                        <Info className="h-5 w-5" /> Erro no Cálculo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-destructive">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {!result && !error && (
                  <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="py-12 flex flex-col items-center text-center text-muted-foreground">
                      <p>Os resultados detalhados aparecerão aqui após o cálculo.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="theory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Condições na Garganta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <p className="text-muted-foreground">
                      Na garganta da tubeira, o escoamento atinge condições sônicas (Mach = 1).
                      A temperatura e pressão críticas são dadas por:
                    </p>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto shadow-inner">
                      <BlockMath math="T_t = \frac{2T_0}{\gamma + 1}" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto shadow-inner mt-2">
                      <BlockMath math="v_t = \sqrt{\gamma R T_t}" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Velocidade de Exaustão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      A velocidade de exaustão teórica (expansão isentrópica) depende da razão de pressão entre a câmara e a saída:
                    </p>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto shadow-inner">
                      <BlockMath math="v_e = \sqrt{\frac{2\gamma}{\gamma-1} R T_0 \left[1 - \left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Razão de Expansão de Área</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      A razão de expansão ($\epsilon$) define o quanto o gás se expande após a garganta:
                    </p>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto shadow-inner">
                      <BlockMath math="\epsilon = \frac{A_e}{A_t} = \frac{1}{M_e} \left[\left(\frac{2}{\gamma+1}\right) \left(1 + \frac{\gamma-1}{2}M_e^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}