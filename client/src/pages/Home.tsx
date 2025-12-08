import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Video, Shield, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const features = [
    {
      icon: Video,
      title: "Video-Aulas sobre Propulsão",
      description: "Aprenda os fundamentos da propulsão de foguetes com vídeos e questionários",
      link: "/video-aulas",
      color: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Verificação Estrutural",
      description: "Análise de tensões e dimensionamento de componentes estruturais",
      link: "/verificacao",
      color: "text-green-600"
    },
    {
      icon: Zap,
      title: "Design de Tubeiras",
      description: "Projeto e otimização de tubeiras cônicas e parabólicas",
      link: "/tubeiras",
      color: "text-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Cálculo de Requerimentos",
      description: "Aplicação da planilha EZImpulse para predição de requisitos de motor-foguete",
      link: "/performance",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container py-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-3 p-3 bg-primary/10 rounded-full">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Escola Foguete
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Plataforma completa para ensino e cálculos de engenharia de foguetes
          </p>
          <div className="flex gap-4 mt-8">
            <Link href="/video-aulas">
              <Button size="lg">
                Começar Aprendizado
              </Button>
            </Link>
            <Link href="/verificacao">
              <Button size="lg" variant="outline">
                Ferramentas de Cálculo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.link}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="container pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sobre o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Este projeto foi desenvolvido para fornecer ferramentas práticas e educacionais
              para estudantes e entusiastas desenvolverem suas habilidades em engenharia aeroespacial.
            </p>
            <p>
              As ferramentas de cálculo são baseadas em metodologias comprovadas, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Verificação estrutural baseada na teoria de vasos de pressão, para componentes estruturais de um motor-foguete.</li>
              <li>Design de tubeiras com expansão isoentrópica.</li>
              <li>Metodologia EZImpulse para estimativa de requisitos de motor-foguete.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
