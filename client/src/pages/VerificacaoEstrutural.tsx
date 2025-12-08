import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Loader2, Play, Info, Shield, Ruler, Gauge, Settings } from "lucide-react";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PYTHON_API_URL = import.meta.env.PROD
  ? "https://escolafoguete.onrender.com"
  : "http://localhost:10000";

interface Params {
  e: number;
  dext_c: number;
  pmax: number;
  te_c: number;
  te_b: number;
  d_p: number;
  df_p: number;
  te_p: number;
}

interface ResultadoEstrutural {
  case: {
    tensao_von_mises: number;
    fator_seguranca: number;
    dint_c: number;
    tensao_tangencial: number;
    tensao_radial: number;
    tensao_longitudinal: number;
  };
  bulkhead: {
    espessura_calculada: number;
  };
  parafusos: {
    forca: number;
    numero_parafusos_arredondado: number;
    tensao: number;
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

export default function VerificacaoEstrutural() {
  const [params, setParams] = useState<Params>({
    e: 3.175,
    dext_c: 76.2,
    pmax: 7,
    te_c: 150,
    te_b: 205,
    d_p: 6.0,
    df_p: 6.5,
    te_p: 640,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultadoEstrutural | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${PYTHON_API_URL}/api/verificacao-estrutural`, {
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

  const handleInputChange = (field: keyof Params, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Verificação Estrutural</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-1">
            Análise de tensões e fator de segurança para Case, Bulkhead e Parafusos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Painel de inputs */}
          <Card className="lg:col-span-4 h-fit sticky top-6 shadow-md border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Parâmetros de Projeto</CardTitle>
              <CardDescription>Dimensões e propriedades dos materiais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Ruler className="h-3 w-3" /> Geometria do Case
                </h4>
                <InputWithTooltip
                  id="e"
                  label="Espessura da Parede (e)"
                  value={params.e}
                  onChange={(v) => handleInputChange("e", v)}
                  tooltip="Espessura da parede do tubo do motor. Determina a resistência à pressão interna."
                  unit="mm"
                />
                <InputWithTooltip
                  id="dext_c"
                  label="Diâmetro Externo"
                  value={params.dext_c}
                  onChange={(v) => handleInputChange("dext_c", v)}
                  tooltip="Diâmetro total externo do tubo do motor."
                  unit="mm"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Gauge className="h-3 w-3" /> Cargas e Materiais
                </h4>
                <InputWithTooltip
                  id="pmax"
                  label="Pressão Máxima (MEOP)"
                  value={params.pmax}
                  onChange={(v) => handleInputChange("pmax", v)}
                  tooltip="Máxima Pressão Operacional Esperada na câmara de combustão."
                  unit="MPa"
                />
                <InputWithTooltip
                  id="te_c"
                  label="Tensão Escoamento (Case)"
                  value={params.te_c}
                  onChange={(v) => handleInputChange("te_c", v)}
                  tooltip={
                    <p>Limite elástico do material do tubo.<br/>Ex: Alumínio 6061-T6 ≈ 276 MPa.</p>
                  }
                  unit="MPa"
                />
                <InputWithTooltip
                  id="te_b"
                  label="Tensão Escoamento (Bulkhead)"
                  value={params.te_b}
                  onChange={(v) => handleInputChange("te_b", v)}
                  tooltip="Limite elástico do material do bulkhead."
                  unit="MPa"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-3 w-3" /> Fixação (Parafusos)
                </h4>
                <InputWithTooltip
                  id="d_p"
                  label="Diâmetro Nominal"
                  value={params.d_p}
                  onChange={(v) => handleInputChange("d_p", v)}
                  tooltip="Diâmetro do parafuso (Ex: M6 = 6mm). Usado para calcular a área de cisalhamento."
                  unit="mm"
                />
                <InputWithTooltip
                  id="te_p"
                  label="Tensão Escoamento"
                  value={params.te_p}
                  onChange={(v) => handleInputChange("te_p", v)}
                  tooltip={<p>Limite de escoamento do material do parafuso.<br/>Ex: Aço Classe 8.8 ≈ 640 MPa.<br/>Aço Inox 304 ≈ 215 MPa.</p>}
                  unit="MPa"
                />
                <InputWithTooltip
                  id="df_p"
                  label="Diâmetro do Furo"
                  value={params.df_p}
                  onChange={(v) => handleInputChange("df_p", v)}
                  tooltip="Diâmetro do furo passante no case para os parafusos."
                  unit="mm"
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={loading} // Usando novo estado 'loading'
                className="w-full shadow-lg hover:shadow-xl transition-all font-semibold"
                size="lg"
              >
                {loading ? ( // Usando novo estado 'loading'
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Executar Verificação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados e teoria */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="results">Resultados da Análise</TabsTrigger>
                <TabsTrigger value="theory">Teoria & Fórmulas</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-6 animate-in fade-in-50 duration-500">
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

                {result && ( // Usando novo estado 'result'
                  <>
                    {/* Resultados do Case */}
                    <Card className="overflow-hidden border-l-4 border-l-blue-500">
                      <CardHeader className="bg-muted/20 pb-4">
                        <CardTitle className="text-lg">Análise do Case (Cilindro)</CardTitle>
                        <CardDescription>Tensões principais e critério de falha</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="p-3 bg-secondary/50 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold">Von Mises</p>
                            <p className="text-2xl font-bold text-foreground">
                              {(result.case.tensao_von_mises / 1e6).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MPa</span>
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center border-2 ${result.case.fator_seguranca >= 2 ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                            <p className="text-xs opacity-80 uppercase font-bold">Fator de Segurança</p>
                            <p className="text-2xl font-bold">
                              {result.case.fator_seguranca.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 bg-secondary/50 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold">Diâmetro Interno</p>
                            <p className="text-2xl font-bold text-foreground">
                              {result.case.dint_c.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">mm</span>
                            </p>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Componente de Tensão</TableHead>
                              <TableHead className="text-right">Valor (MPa)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Tensão Tangencial (Hoop)</TableCell>
                              <TableCell className="text-right font-mono">{(result.case.tensao_tangencial / 1e6).toFixed(3)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Tensão Radial</TableCell>
                              <TableCell className="text-right font-mono">{(result.case.tensao_radial / 1e6).toFixed(3)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Tensão Longitudinal</TableCell>
                              <TableCell className="text-right font-mono">{(result.case.tensao_longitudinal / 1e6).toFixed(3)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        {result.case.fator_seguranca < 2 && (
                          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start gap-2 text-sm border border-red-200">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong>Atenção:</strong> O Fator de Segurança (FS) está abaixo de 2.0. A estrutura pode não ser segura para operação com tripulação ou em áreas habitadas.
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Resultados do Bulkhead */}
                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="bg-muted/20 py-4">
                          <CardTitle className="text-base">Dimensionamento do Bulkhead</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center justify-center py-2">
                            <span className="text-sm text-muted-foreground mb-1">Espessura Mínima Recomendada</span>
                            <span className="text-3xl font-bold text-purple-700">
                              {(result.bulkhead.espessura_calculada * 1000).toFixed(2)} <span className="text-lg text-muted-foreground font-normal">mm</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Resultados dos Parafusos */}
                      <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="bg-muted/20 py-4">
                          <CardTitle className="text-base">Dimensionamento da Fixação</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Força Total no Bulkhead</span>
                            <span className="font-bold">{result.parafusos.forca.toFixed(0)} N</span>
                          </div>
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Qtd. Parafusos (Mínima)</span>
                            <span className="font-bold text-orange-600">{result.parafusos.numero_parafusos_arredondado} un.</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Tensão Cisalhante Limite</span>
                            <span className="font-mono text-sm">{(result.parafusos.tensao / 1e6).toFixed(2)} MPa</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {/* Exibe "Aguardando" se não tem erro, não está carregando e não tem resultado */}
                {!result && !error && !loading && (
                  <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="py-24 flex flex-col items-center text-center text-muted-foreground">
                      <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                        <Shield className="h-10 w-10 text-primary/50" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Aguardando Parâmetros</h3>
                      <p className="max-w-md mx-auto">
                        Preencha os dados do projeto à esquerda e clique em "Executar Verificação" para analisar a integridade estrutural.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="theory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tensão de Von Mises</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Para materiais dúcteis (como alumínio e aço), a falha ocorre quando a energia de distorção atinge um limite crítico. A tensão equivalente de Von Mises combina as três tensões principais:
                    </p>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto text-center">
                      <BlockMath math="\sigma_{VM} = \sqrt{\frac{(\sigma_l - \sigma_r)^2 + (\sigma_r - \sigma_t)^2 + (\sigma_t - \sigma_l)^2}{2}}" />
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><InlineMath math="\sigma_t" />: Tensão Tangencial (Hoop Stress) - Tende a rasgar o tubo longitudinalmente.</li>
                      <li><InlineMath math="\sigma_l" />: Tensão Longitudinal - Tende a separar as bordas do tubo.</li>
                      <li><InlineMath math="\sigma_r" />: Tensão Radial - Compressão interna devido à pressão do gás.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cisalhamento em Parafusos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Parafusos submetidos a pressão interna em cilindros sofrem cisalhamento simples. A tensão de escoamento ao cisalhamento (<InlineMath math="\tau_{e}" />) é estimada pelo critério de Von Mises a partir da tensão de tração (<InlineMath math="\sigma_{e}" />):
                    </p>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto text-center">
                      <BlockMath math="\tau_{e} = \frac{\sigma_{e}}{\sqrt{3}} \approx 0.577 \cdot \sigma_{e}" />
                    </div>
                    <p>O número de parafusos é calculado para garantir um Fator de Segurança (FS) sobre esta tensão limite:</p>
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto text-center">
                      <BlockMath math="N_{parafusos} = \frac{F_{total} \cdot FS}{A_{parafuso} \cdot \tau_{e}}" />
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