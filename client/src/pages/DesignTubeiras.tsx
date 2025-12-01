import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Play } from "lucide-react";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Params {
  F: number;
  p0: number;
  pe: number;
  T0: number;
  k: number;
  R: number;
  tipo: "conica" | "parabolica";
}

export default function DesignTubeiras() {
  const [params, setParams] = useState<Params>({
    F: 544.81,
    p0: 6106000,
    pe: 101320,
    T0: 1601.209,
    k: 1.136397,
    R: 234.918,
    tipo: "conica",
  });

  const mutation = trpc.calculosEngenharia.designTubeira.useMutation();

  const handleCalculate = () => {
    mutation.mutate(params);
  };

  const handleInputChange = (field: keyof Params, value: string | number) => {
    if (field === "tipo") {
      setParams({ ...params, [field]: value as "conica" | "parabolica" });
    } else {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        setParams({ ...params, [field]: numValue });
      }
    }
  };

  // Preparar dados para gráficos
  const geometryData = mutation.data?.geometria
    ? mutation.data.geometria.x.map((x: number, i: number) => ({
        x: x * 1000, // Converter para mm
        r: mutation.data.geometria.r[i] * 1000,
        area: mutation.data.geometria.areas[i] * 1e6, // Converter para mm²
      }))
    : [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Design de Tubeiras</h1>
        <p className="text-muted-foreground">
          Projeto e otimização de tubeiras cônicas e parabólicas para motores foguete
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de inputs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parâmetros de Entrada</CardTitle>
            <CardDescription>Configure as condições operacionais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Tubeira</Label>
              <Select value={params.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conica">Cônica</SelectItem>
                  <SelectItem value="parabolica">Parabólica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="F">Empuxo Máximo (N)</Label>
              <Input
                id="F"
                type="number"
                step="0.01"
                value={params.F}
                onChange={(e) => handleInputChange("F", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p0">Pressão na Câmara (Pa)</Label>
              <Input
                id="p0"
                type="number"
                step="1000"
                value={params.p0}
                onChange={(e) => handleInputChange("p0", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pe">Pressão de Saída (Pa)</Label>
              <Input
                id="pe"
                type="number"
                step="1000"
                value={params.pe}
                onChange={(e) => handleInputChange("pe", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="T0">Temperatura na Câmara (K)</Label>
              <Input
                id="T0"
                type="number"
                step="0.1"
                value={params.T0}
                onChange={(e) => handleInputChange("T0", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="k">Coeficiente de Calores (γ)</Label>
              <Input
                id="k"
                type="number"
                step="0.001"
                value={params.k}
                onChange={(e) => handleInputChange("k", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="R">Constante do Gás (J/kg·K)</Label>
              <Input
                id="R"
                type="number"
                step="0.001"
                value={params.R}
                onChange={(e) => handleInputChange("R", e.target.value)}
              />
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
                  Executar Cálculo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados e visualização */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="geometry">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geometry">Geometria</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="theory">Teoria</TabsTrigger>
            </TabsList>

            <TabsContent value="geometry" className="space-y-4">
              {mutation.isSuccess && mutation.data && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Perfil da Tubeira</CardTitle>
                      <CardDescription>Visualização do contorno {params.tipo}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={geometryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="x" 
                            label={{ value: 'Posição Axial (mm)', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Raio (mm)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="r" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="Raio"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Variação de Área</CardTitle>
                      <CardDescription>Área da seção transversal ao longo do comprimento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={geometryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="x" 
                            label={{ value: 'Posição Axial (mm)', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Área (mm²)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="area" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            name="Área"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {!mutation.isSuccess && !mutation.isError && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>Configure os parâmetros e clique em "Executar Cálculo" para ver a geometria</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {mutation.isSuccess && mutation.data && (
                <Card>
                  <CardHeader>
                    <CardTitle>Parâmetros Calculados</CardTitle>
                    <CardDescription>Resultados do dimensionamento da tubeira</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Temperatura na Garganta</p>
                        <p className="text-2xl font-bold">{mutation.data.parametros.temperatura_garganta.toFixed(2)} K</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Velocidade na Garganta</p>
                        <p className="text-2xl font-bold">{mutation.data.parametros.velocidade_garganta.toFixed(2)} m/s</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Velocidade de Exaustão</p>
                        <p className="text-2xl font-bold">{mutation.data.parametros.velocidade_exaustao.toFixed(2)} m/s</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Fluxo Mássico</p>
                        <p className="text-2xl font-bold">{mutation.data.parametros.fluxo_massico.toFixed(4)} kg/s</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Área da Garganta</p>
                        <p className="text-2xl font-bold">{(mutation.data.parametros.area_garganta * 1e6).toFixed(2)} mm²</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Raio da Garganta</p>
                        <p className="text-2xl font-bold">{(mutation.data.parametros.raio_garganta * 1000).toFixed(2)} mm</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Área de Saída</p>
                        <p className="text-2xl font-bold">{(mutation.data.parametros.area_saida * 1e6).toFixed(2)} mm²</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Raio de Saída</p>
                        <p className="text-2xl font-bold">{(mutation.data.parametros.raio_saida * 1000).toFixed(2)} mm</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Razão de Expansão</p>
                        <p className="text-2xl font-bold">{mutation.data.parametros.razao_expansao.toFixed(3)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Comprimento</p>
                        <p className="text-2xl font-bold">{(mutation.data.parametros.comprimento * 1000).toFixed(2)} mm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mutation.isError && (
                <Card className="border-red-500">
                  <CardHeader>
                    <CardTitle className="text-red-600">Erro no Cálculo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600">{mutation.error.message}</p>
                  </CardContent>
                </Card>
              )}

              {!mutation.isSuccess && !mutation.isError && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>Configure os parâmetros e clique em "Executar Cálculo" para ver os resultados</p>
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
                    A temperatura e pressão críticas são:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <BlockMath math="T_t = \frac{2T_0}{\gamma + 1}" />
                  </div>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
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
                    A velocidade de exaustão é calculada pela expansão isentrópica dos gases:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <BlockMath math="v_e = \sqrt{\frac{2\gamma}{\gamma-1} R T_0 \left[1 - \left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Razão de Expansão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    A razão entre a área de saída e a área da garganta determina a expansão dos gases:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <BlockMath math="\epsilon = \frac{A_e}{A_t}" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tubeiras cônicas são mais simples de fabricar, enquanto tubeiras parabólicas 
                    oferecem melhor eficiência devido ao perfil otimizado.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
