import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Play } from "lucide-react";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { modelAnswers } from '../data/modelAnswers';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}

interface Question {
  id: string;
  videoId: string;
  question: string;
  type: "multiple-choice" | "open-ended";
  options?: string[];
  correctAnswer?: number;
  hasModelAnswer?: boolean;
}

const videos: Video[] = [
  {
    id: "1",
    title: "Introdução à Propulsão Aeroespacial",
    description: "Conceitos fundamentais de propulsão aeroespacial e princípios físicos",
    youtubeId: "MB95wNpcp3M"
  },
  {
    id: "2",
    title: "Motores à Propulsão Sólida",
    description: "Funcionamento e características de motores de propelente sólido",
    youtubeId: "jhYccxbd6n0"
  },
  {
    id: "3",
    title: "Motores à Propulsão Híbrida",
    description: "Sistemas de propulsão híbrida e suas aplicações",
    youtubeId: "k6KHVM9X-wo"
  },
  {
    id: "4",
    title: "Tubeiras",
    description: "Design e análise de tubeiras convergentes-divergentes",
    youtubeId: "G_juhUE96DY"
  },
  {
    id: "5",
    title: "Planilhas do Departamento (Parte 1)",
    description: "Dimensionamento de parafusos, verificação de fator de segurança de case e projeto de espessura de bulkhead",
    youtubeId: "tSfUGRNjuSA"
  },
  {
    id: "6",
    title: "Planilhas do Departamento (Parte 2)",
    description: "Planilhas de dimensionamento do site do Richard Nakka (EZImpulse, SRM)",
    youtubeId: "eof0nS9F8bg"
  }
];

const questions: Question[] = [
  // Atividade 01 - Introdução à Propulsão
  {
    id: "q1",
    videoId: "1",
    question: "Em termos fundamentais, o que define a propulsão? Como essa definição se aplica especificamente aos contextos aeronáutico e espacial?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q2",
    videoId: "1",
    question: "Explique a relação essencial entre o oxidante e o combustível para a geração de empuxo.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q3",
    videoId: "1",
    question: "Estabeleça uma relação clara entre o funcionamento do motor aeronáutico inicial e o princípio básico de um motor de foguete. Quais elementos ou conceitos são compartilhados entre eles?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q4",
    videoId: "1",
    question: "Quais são os principais tipos de motores de foguete?",
    type: "multiple-choice",
    options: [
      "Sólido, Líquido e Híbrido",
      "Térmico, Nuclear e Elétrico",
      "Químico, Nuclear e Elétrico",
      "Todas as alternativas anteriores"
    ],
    correctAnswer: 0
  },
  {
    id: "q5",
    videoId: "1",
    question: "Além da propulsão química, quais outras categorias de propulsão de foguetes existem? Explique os princípios básicos da propulsão nuclear e da propulsão elétrica.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q6",
    videoId: "1",
    question: "Defina o conceito de empuxo em propulsão. Quais fatores influenciam a magnitude do empuxo gerado por um motor?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q7",
    videoId: "1",
    question: "O que é impulso total? Como ele se relaciona com o empuxo e a duração da queima do propelente?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q8",
    videoId: "1",
    question: "O que representa o impulso específico (Isp)?",
    type: "multiple-choice",
    options: [
      "A velocidade máxima do foguete",
      "A eficiência do combustível em produzir impulso",
      "A temperatura da câmara de combustão",
      "A pressão máxima suportada"
    ],
    correctAnswer: 1
  },
  {
    id: "q9",
    videoId: "1",
    question: "Por que, em geral, os motores aeronáuticos são considerados mais eficientes em termos de consumo de propelente do que os motores de foguete para voos atmosféricos? Quais são as principais razões para essa diferença de eficiência?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q10",
    videoId: "1",
    question: "O que representa a velocidade característica (c*) em um motor de foguete? Qual a sua importância na análise do desempenho da câmara de combustão?",
    type: "open-ended",
    hasModelAnswer: true
  },

  // Atividade 02 - Motores Sólidos
  {
    id: "q11",
    videoId: "2",
    question: "Selecione dois tipos diferentes de propelentes sólidos e descreva suas características quanto a: composição química, densidade, impulso específico teórico, taxa de regressão, facilidade de processamento e fabricação, e considerações de segurança e manuseio.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q12",
    videoId: "2",
    question: "Como a pressão é gerada e mantida em um motor sólido?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q13",
    videoId: "2",
    question: "Como a vazão mássica se relaciona com o impulso total?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q14",
    videoId: "2",
    question: "Qual a relação entre pressão, área da garganta do bocal e vazão mássica?",
    type: "open-ended",
    hasModelAnswer: true
  },

  // Motores Híbridos - Questões Conceituais
  {
    id: "q15_hybrid",
    videoId: "3",
    question: "Selecione dois tipos diferentes de combinações de propelentes híbridos (combustível sólido + oxidante) e descreva suas características.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q16_hybrid",
    videoId: "3",
    question: "Como a pressão é gerada e mantida em um motor híbrido? Qual a diferença fundamental em relação aos motores sólidos?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q17_hybrid",
    videoId: "3",
    question: "Como a vazão mássica total se relaciona com o impulso em um motor híbrido? Explique o papel da razão de mistura O/F.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q18_hybrid",
    videoId: "3",
    question: "Quais são as principais vantagens e desvantagens dos motores híbridos em comparação com motores sólidos e líquidos?",
    type: "open-ended",
    hasModelAnswer: true
  },

  // Planilhas do Departamento (Parte 1) - Dimensionamento Estrutural
  {
    id: "q19_struct",
    videoId: "5",
    question: "Quais são os principais fatores que devem ser considerados no dimensionamento de parafusos para fixação de componentes de foguetes?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q20_struct",
    videoId: "5",
    question: "O que é fator de segurança (FS) e qual é sua importância na verificação estrutural do case de um motor de foguete?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q21_struct",
    videoId: "5",
    question: "Explique como é feito o cálculo da espessura mínima de um bulkhead (tampa) considerando a pressão interna do motor.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q22_struct",
    videoId: "5",
    question: "Qual é a principal diferença entre tensão de escoamento e tensão de ruptura?",
    type: "multiple-choice",
    options: [
      "Escoamento é quando o material começa a deformar plasticamente; ruptura é quando ele quebra",
      "Escoamento é quando o material quebra; ruptura é quando ele deforma",
      "São a mesma coisa, apenas nomes diferentes",
      "Escoamento ocorre apenas em metais; ruptura em plásticos"
    ],
    correctAnswer: 0
  },

  // Planilhas do Departamento (Parte 2) - Richard Nakka
  {
    id: "q23_nakka",
    videoId: "6",
    question: "Quais são os principais parâmetros de entrada necessários para utilizar a planilha EZImpulse do Richard Nakka?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q24_nakka",
    videoId: "6",
    question: "O que a planilha SRM (Solid Rocket Motor) do Richard Nakka calcula e qual é sua utilidade no projeto de motores sólidos?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q25_nakka",
    videoId: "6",
    question: "Explique a diferença entre as planilhas EZImpulse e SRM em termos de complexidade e precisão dos resultados.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q26_nakka",
    videoId: "6",
    question: "Qual é a principal vantagem de usar planilhas de dimensionamento como as do Richard Nakka?",
    type: "multiple-choice",
    options: [
      "Permitem iterações rápidas de projeto e validação de conceitos",
      "Substituem completamente a necessidade de testes físicos",
      "São mais precisas que simulações CFD",
      "Não requerem conhecimento técnico para usar"
    ],
    correctAnswer: 0
  },

  // Atividade 04 - Tubeiras
  {
    id: "q15",
    videoId: "4",
    question: "Para um motor de foguete com fluxo mássico de 1,3 kg/s, área de saída de 35 cm² e volume específico de saída de 5,8 m³/kg, qual é a velocidade do gás na saída e qual o empuxo gerado?",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q16",
    videoId: "4",
    question: "Para um motor com 2,4 MPa de pressão na câmara e 2800 K de temperatura, determine a temperatura do gás na saída da tubeira. Assuma tubeira idealmente expandida com pressão de saída igual à atmosférica e k = 1,3.",
    type: "open-ended",
    hasModelAnswer: true
  },
  {
    id: "q17",
    videoId: "4",
    question: "Para um motor com 4000 psi na câmara e k = 1,2, determine a pressão na câmara e o número de Mach na saída da tubeira, assumindo expansão ideal.",
    type: "open-ended",
    hasModelAnswer: true
  }
];

const topics = [
  {
    id: "t1",
    title: "Princípios Fundamentais",
    content: [
      {
        subtitle: "Terceira Lei de Newton",
        description: "O princípio fundamental da propulsão por foguetes baseia-se na Terceira Lei de Newton: para cada ação há uma reação igual e oposta.",
        formula: "F = \\frac{dp}{dt} = \\dot{m} v_e + (p_e - p_a) A_e"
      },
      {
        subtitle: "Impulso Total",
        description: "O impulso total é a integral do empuxo ao longo do tempo de queima.",
        formula: "I_t = \\int_0^{t_b} F \\, dt"
      },
      {
        subtitle: "Impulso Específico",
        description: "Medida de eficiência do propelente, representa o impulso produzido por unidade de peso de propelente consumido.",
        formula: "I_{sp} = \\frac{I_t}{m_p \\cdot g_0} = \\frac{v_e}{g_0}"
      }
    ]
  },
  {
    id: "t2",
    title: "Motores de Propulsão Sólida",
    content: [
      {
        subtitle: "Taxa de Queima",
        description: "A taxa de regressão do propelente sólido depende da pressão na câmara.",
        formula: "r = a p_c^n"
      },
      {
        subtitle: "Vazão Mássica",
        description: "Relaciona a taxa de queima com a área de queima e densidade do propelente.",
        formula: "\\dot{m} = \\rho_p A_b r = \\rho_p A_b a p_c^n"
      },
      {
        subtitle: "Pressão na Câmara",
        description: "Para motor sólido, a pressão é determinada pelo equilíbrio entre geração e exaustão de gases.",
        formula: "\\dot{m} = \\frac{P_c A_t}{C^*}"
      }
    ]
  },
  {
    id: "t3",
    title: "Motores de Propulsão Híbrida",
    content: [
      {
        subtitle: "Características",
        description: "Combinam combustível sólido com oxidante líquido ou gasoso, oferecendo vantagens de segurança e controle.",
        formula: "\\dot{m}_f = \\rho_f A_b r"
      },
      {
        subtitle: "Razão de Mistura",
        description: "A razão oxidante/combustível (O/F) é controlável durante a operação.",
        formula: "O/F = \\frac{\\dot{m}_o}{\\dot{m}_f}"
      }
    ]
  },
  {
    id: "t4",
    title: "Tubeiras e Escoamento",
    content: [
      {
        subtitle: "Velocidade Característica",
        description: "Parâmetro que caracteriza a eficiência da combustão na câmara.",
        formula: "c^* = \\frac{P_c A_t}{\\dot{m}}"
      },
      {
        subtitle: "Condições na Garganta",
        description: "Na garganta, o escoamento atinge condições sônicas (Mach = 1).",
        formula: "\\frac{T_t}{T_c} = \\frac{2}{\\gamma + 1}"
      },
      {
        subtitle: "Velocidade de Exaustão",
        description: "Velocidade dos gases na saída da tubeira para expansão isentrópica.",
        formula: "v_e = \\sqrt{\\frac{2\\gamma}{\\gamma-1} R T_c \\left[1 - \\left(\\frac{p_e}{p_c}\\right)^{\\frac{\\gamma-1}{\\gamma}}\\right]}"
      },
      {
        subtitle: "Razão de Expansão",
        description: "Relação entre área de saída e área da garganta.",
        formula: "\\epsilon = \\frac{A_e}{A_t}"
      },
      {
        subtitle: "Número de Mach",
        description: "Para escoamento supersônico na saída da tubeira.",
        formula: "\\frac{A_e}{A_t} = \\frac{1}{M_e} \\left[\\frac{2}{\\gamma+1}\\left(1 + \\frac{\\gamma-1}{2}M_e^2\\right)\\right]^{\\frac{\\gamma+1}{2(\\gamma-1)}}"
      }
    ]
  }
];

export default function VideoAulas() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [showModelAnswer, setShowModelAnswer] = useState<Record<string, boolean>>({});
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  // Carregar progresso do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rocket-eng-progress');
    if (saved) {
      const data = JSON.parse(saved);
      setWatchedVideos(new Set(data.watchedVideos || []));
      setAnswers(data.answers || {});
    }
  }, []);

  // Salvar progresso
  useEffect(() => {
    localStorage.setItem('rocket-eng-progress', JSON.stringify({
      watchedVideos: Array.from(watchedVideos),
      answers
    }));
  }, [watchedVideos, answers]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckAnswer = (question: Question) => {
    if (question.type === "multiple-choice" && question.correctAnswer !== undefined) {
      setShowResults(prev => ({ ...prev, [question.id]: true }));
    }
  };

  const toggleModelAnswer = (questionId: string) => {
    setShowModelAnswer(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const isCorrect = (question: Question) => {
    if (question.type === "multiple-choice" && question.correctAnswer !== undefined) {
      return parseInt(answers[question.id]) === question.correctAnswer;
    }
    return false;
  };

  const videoQuestions = questions.filter(q => q.videoId === selectedVideo.id);

  const markAsWatched = () => {
    setWatchedVideos(prev => new Set(Array.from(prev).concat(selectedVideo.id)));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Video-Aulas sobre Propulsão</h1>
        <p className="text-muted-foreground">
          Aprenda os fundamentos da propulsão de foguetes através de vídeos educacionais e atividades práticas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de vídeos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Playlist</CardTitle>
            <CardDescription>
              {watchedVideos.size} de {videos.length} vídeos assistidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.map((video) => (
              <Button
                key={video.id}
                variant={selectedVideo.id === video.id ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {watchedVideos.has(video.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{video.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {video.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedVideo.title}</CardTitle>
              <CardDescription>{selectedVideo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={markAsWatched}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">Atividades</TabsTrigger>
              <TabsTrigger value="theory">Teoria</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atividades - {selectedVideo.title}</CardTitle>
                  <CardDescription>
                    Responda as questões para fixar o conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {videoQuestions.map((question, index) => (
                    <div key={question.id} className="space-y-3 pb-6 border-b last:border-b-0">
                      <div className="font-medium">
                        <span className="text-primary">Exercício {index + 1}:</span> {question.question}
                      </div>

                      {question.type === "multiple-choice" && question.options ? (
                        <>
                          <RadioGroup
                            value={answers[question.id] || ""}
                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                          >
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={optIndex.toString()}
                                  id={`${question.id}-${optIndex}`}
                                />
                                <Label
                                  htmlFor={`${question.id}-${optIndex}`}
                                  className="cursor-pointer"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>

                          {answers[question.id] && (
                            <Button
                              onClick={() => handleCheckAnswer(question)}
                              size="sm"
                              variant="outline"
                            >
                              Ver Gabarito
                            </Button>
                          )}

                          {showResults[question.id] && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${
                              isCorrect(question)
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                              {isCorrect(question) ? (
                                <>
                                  <CheckCircle2 className="h-5 w-5" />
                                  <span className="font-medium">Correto!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-5 w-5" />
                                  <span className="font-medium">
                                    Incorreto. A resposta correta é: {question.options![question.correctAnswer!]}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground italic">
                            Esta é uma questão dissertativa. Reflita sobre o conteúdo do vídeo para elaborar sua resposta.
                          </div>

                          {question.hasModelAnswer && modelAnswers[question.id] && (
                            <>
                              <Button
                                onClick={() => toggleModelAnswer(question.id)}
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                {showModelAnswer[question.id] ? "Ocultar" : "Ver"} Gabarito
                              </Button>

                              {showModelAnswer[question.id] && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                                  <div className="flex items-start gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="font-semibold text-blue-900">Gabarito:</span>
                                  </div>
                                  <div className="text-sm text-blue-900 whitespace-pre-wrap">
                                    {modelAnswers[question.id]}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theory" className="space-y-4">
              {topics.map((topic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle>{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {topic.content.map((item, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="font-semibold text-lg">{item.subtitle}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <BlockMath math={item.formula} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}