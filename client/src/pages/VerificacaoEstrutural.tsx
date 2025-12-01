import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Play, Info } from "lucide-react";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Params {
  e: number;
  dext_c: number;
  pmax: number;
  te_c: number;
  te_b: number;
  d_p: number;
  df_p: number;
}

export default function VerificacaoEstrutural() {
  const [params, setParams] = useState<Params>({
    e: 3.175,
    dext_c: 76.2,
    pmax: 7,
    te_c: 150,
    te_b: 205,
    d_p: 9.03,
    df_p: 10,
  });

  const mutation = trpc.calculosEngenharia.verificacaoEstrutural.useMutation();

  const handleCalculate = () => {
    mutation.mutate(params);
  };

  const handleInputChange = (field: keyof Params, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Verificação Estrutural</h1>
        <p className="text-muted-foreground">
          Análise de tensões e dimensionamento de componentes estruturais do motor foguete
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de inputs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parâmetros de Entrada</CardTitle>
            <CardDescription>Configure as dimensões e propriedades dos materiais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e">Espessura (mm)</Label>
              <Input
                id="e"
                type="number"
                step="0.001"
                value={params.e}
                onChange={(e) => handleInputChange("e", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dext_c">Diâmetro Externo (mm)</Label>
              <Input
                id="dext_c"
                type="number"
                step="0.1"
                value={params.dext_c}
                onChange={(e) => handleInputChange("dext_c", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pmax">Pressão Máxima (MPa)</Label>
              <Input
                id="pmax"
                type="number"
                step="0.1"
                value={params.pmax}
                onChange={(e) => handleInputChange("pmax", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="te_c">Tensão de Escoamento - Case (MPa)</Label>
              <Input
                id="te_c"
                type="number"
                step="1"
                value={params.te_c}
                onChange={(e) => handleInputChange("te_c", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="te_b">Tensão de Escoamento - Bulkhead (MPa)</Label>
              <Input
                id="te_b"
                type="number"
                step="1"
                value={params.te_b}
                onChange={(e) => handleInputChange("te_b", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d_p">Diâmetro do Parafuso (mm)</Label>
              <Input
                id="d_p"
                type="number"
                step="0.01"
                value={params.d_p}
                onChange={(e) => handleInputChange("d_p", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="df_p">Diâmetro do Furo (mm)</Label>
              <Input
                id="df_p"
                type="number"
                step="0.1"
                value={params.df_p}
                onChange={(e) => handleInputChange("df_p", e.target.value)}
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

        {/* Resultados e teoria */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="results">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="theory">Teoria e Fórmulas</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
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

              {mutation.isSuccess && mutation.data && (
                <>
                  {/* Resultados do Case */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise do Case (Cilindro de Pressão)</CardTitle>
                      <CardDescription>Tensões e fator de segurança</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parâmetro</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Unidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Diâmetro Interno</TableCell>
                            <TableCell>{mutation.data.case.dint_c.toFixed(3)}</TableCell>
                            <TableCell>mm</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Espessura</TableCell>
                            <TableCell>{(mutation.data.case.espessura * 1000).toFixed(3)}</TableCell>
                            <TableCell>mm</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Tensão Tangencial</TableCell>
                            <TableCell>{(mutation.data.case.tensao_tangencial / 1e6).toFixed(3)}</TableCell>
                            <TableCell>MPa</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Tensão Radial</TableCell>
                            <TableCell>{(mutation.data.case.tensao_radial / 1e6).toFixed(3)}</TableCell>
                            <TableCell>MPa</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Tensão Longitudinal</TableCell>
                            <TableCell>{(mutation.data.case.tensao_longitudinal / 1e6).toFixed(3)}</TableCell>
                            <TableCell>MPa</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">Tensão de Von Mises</TableCell>
                            <TableCell className="font-bold">{(mutation.data.case.tensao_von_mises / 1e6).toFixed(3)}</TableCell>
                            <TableCell>MPa</TableCell>
                          </TableRow>
                          <TableRow className={mutation.data.case.fator_seguranca >= 2 ? "bg-green-50" : "bg-red-50"}>
                            <TableCell className="font-bold">Fator de Segurança</TableCell>
                            <TableCell className="font-bold">{mutation.data.case.fator_seguranca.toFixed(3)}</TableCell>
                            <TableCell>-</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      {mutation.data.case.fator_seguranca < 2 && (
                        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg flex items-start gap-2">
                          <Info className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-semibold">Atenção: Fator de Segurança Insuficiente</p>
                            <p className="text-sm">O fator de segurança está abaixo do recomendado (FS ≥ 2.0). Considere aumentar a espessura ou usar material com maior tensão de escoamento.</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Resultados do Bulkhead */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise do Bulkhead (Tampa)</CardTitle>
                      <CardDescription>Dimensionamento da espessura</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parâmetro</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Unidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-bold">Espessura Calculada</TableCell>
                            <TableCell className="font-bold">{(mutation.data.bulkhead.espessura_calculada * 1000).toFixed(3)}</TableCell>
                            <TableCell>mm</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Resultados dos Parafusos */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise dos Parafusos</CardTitle>
                      <CardDescription>Dimensionamento e quantidade</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parâmetro</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Unidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Área Transversal Interna</TableCell>
                            <TableCell>{mutation.data.parafusos.area_transversal.toFixed(6)}</TableCell>
                            <TableCell>m²</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Força Total</TableCell>
                            <TableCell>{mutation.data.parafusos.forca.toFixed(2)}</TableCell>
                            <TableCell>N</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Tensão no Parafuso</TableCell>
                            <TableCell>{(mutation.data.parafusos.tensao / 1e6).toFixed(3)}</TableCell>
                            <TableCell>MPa</TableCell>
                          </TableRow>
                          <TableRow className="bg-blue-50">
                            <TableCell className="font-bold">Número de Parafusos Necessários</TableCell>
                            <TableCell className="font-bold">{mutation.data.parafusos.numero_parafusos_arredondado}</TableCell>
                            <TableCell>unidades</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
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
                  <CardTitle>Tensão de Von Mises</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    A tensão de Von Mises é usada como critério de falha para materiais dúcteis. 
                    Ela combina as três tensões principais em um valor equivalente:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <BlockMath math="\sigma_{VM} = \sqrt{\frac{(\sigma_l - \sigma_r)^2 + (\sigma_r - \sigma_t)^2 + (\sigma_t - \sigma_l)^2}{2}}" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Onde σ<sub>l</sub> é a tensão longitudinal, σ<sub>r</sub> é a tensão radial e σ<sub>t</sub> é a tensão tangencial.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tensões em Vasos de Pressão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold mb-2">Tensão Tangencial (Circunferencial):</p>
                      <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <BlockMath math="\sigma_t = \frac{P \cdot r_i^2}{r_e^2 - r_i^2} \left(1 + \frac{r_e^2}{r_i^2}\right)" />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Tensão Longitudinal:</p>
                      <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <BlockMath math="\sigma_l = \frac{2P \cdot r_i^2}{r_e^2 - r_i^2}" />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Tensão Radial:</p>
                      <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <BlockMath math="\sigma_r = \frac{P \cdot r_i^2}{r_e^2 - r_i^2} \left(1 - \frac{r_i^2}{r_e^2}\right)" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fator de Segurança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    O fator de segurança relaciona a tensão de escoamento do material com a tensão atuante:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <BlockMath math="FS = \frac{\sigma_{escoamento}}{\sigma_{VM}}" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Para aplicações aeroespaciais, recomenda-se FS ≥ 2.0 para garantir segurança adequada.
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
