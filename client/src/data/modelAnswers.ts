export const modelAnswers: Record<string, string> = {
  // Introdução
  "q1": "A propulsão é o ato de alterar o movimento de um corpo. A propulsão aeroespacial é a aplicação desse princípio para lançar veículos e satélites no espaço ou mantê-los em órbita, baseando-se na Lei da Ação e Reação de Newton.",

  "q2": "O oxidante e o combustível reagem quimicamente na câmara de combustão, liberando uma grande quantidade de energia térmica e gases. Essa reação é o que pressuriza a câmara e permite a aceleração dos gases através da tubeira.",

  "q3": "Ambos operam expulsando massa em alta velocidade para gerar empuxo (3ª Lei de Newton). Motores a jato usam o ar atmosférico como oxidante, enquanto foguetes carregam seu próprio oxidante internamente.",

  "q5": "Propulsão Nuclear Térmica: Usa um reator nuclear para aquecer um fluido (geralmente hidrogênio) que é expelido em alta velocidade. Propulsão Elétrica (Iônica/Hall): Usa campos elétricos ou magnéticos para acelerar íons a velocidades altíssimas, gerando baixo empuxo mas altíssima eficiência (Isp).",

  "q6": "Empuxo é a força de reação gerada pela expulsão de gases em alta velocidade. É influenciado principalmente pela vazão mássica (quanto gás sai por segundo) e pela velocidade de exaustão dos gases (o quão rápido eles saem).",

  "q7": "Impulso Total (It) é a mudança total de momentum entregue ao foguete, calculado como a integral do empuxo ao longo do tempo de queima (Empuxo Médio × Tempo). É a medida da 'energia total' do motor.",

  "q9": "Motores aeronáuticos (turbojatos/turbofans) usam oxigênio da atmosfera, não precisando carregar oxidante. Isso reduz drasticamente a massa de propelente a bordo para a mesma energia liberada, resultando em um 'Isp efetivo' muito maior que foguetes.",

  "q10": "A Velocidade Característica (c*) é uma medida da eficiência da combustão na câmara, independente do bocal. Ela depende apenas das propriedades do propelente (temperatura de chama, massa molecular) e indica quão bem a energia química foi convertida em térmica.",

  // Sólidos
  "q11": "Exemplos comuns: KNSu (Nitrato de Potássio + Sacarose) é fácil de fabricar mas tem baixo desempenho e higroscopia. APCP (Perclorato de Amônio) tem alto desempenho e densidade, mas é mais complexo e caro de processar.",

  "q12": "A pressão é gerada pela rápida combustão do grão sólido, que produz gases. O equilíbrio é mantido pela relação entre a área de queima do propelente (Ab) e a área da garganta do bocal (At). Se Ab aumenta, a pressão sobe.",

  "q13": "A vazão mássica define a taxa na qual o propelente é consumido. O Impulso Total é fixo pela massa total de propelente e seu Isp. Uma vazão maior consome o propelente mais rápido (maior empuxo, menor tempo), mas o Impulso Total permanece aproximadamente o mesmo.",

  "q14": "A relação é linear: Pressão da Câmara (Pc) = (Vazão Mássica × c*) / Área da Garganta. Ou seja, aumentar a vazão ou diminuir a garganta aumenta a pressão.",

  // Híbridos
  "q15_hybrid": "Parafina + Óxido Nitroso: alta taxa de regressão e segurança. PEAD (Polietileno) + Oxigênio Líquido: desempenho estável, mas requer sistema criogênico.",

  "q16_hybrid": "A pressão é gerada pela queima na superfície do grão sólido reagindo com o fluxo de oxidante. Diferente dos sólidos puros, a pressão pode ser controlada ajustando a vazão do oxidante injetado.",

  "q17_hybrid": "O empuxo é diretamente proporcional à vazão mássica total. A razão O/F (Oxidante/Combustível) ideal maximiza o Isp; desvios dessa razão reduzem a eficiência.",

  "q18_hybrid": "Vantagens: Mais seguros que sólidos (não explosivos), permitem reignição e controle de empuxo (throttling). Desvantagens: Baixa taxa de regressão do combustível e complexidade maior que motores sólidos simples.",

  // Estrutural
  "q19_struct": "Deve-se considerar a carga máxima de tração (pressão interna x área da tampa), o material do parafuso (classe de resistência), o diâmetro nominal e a área de cisalhamento nas roscas.",

  "q20_struct": "O Fator de Segurança (FS) é a razão entre a carga de falha do material e a carga de trabalho real. Ele garante que o motor suporte incertezas de fabricação e picos de pressão sem explodir.",

  "q21_struct": "Calcula-se modelando a tampa como uma placa circular engastada ou apoiada, utilizando fórmulas de resistência dos materiais (como Roark's) que relacionam pressão, raio e tensão admissível do material.",

  // Nakka
  "q23_nakka": "Tipo de propelente (KNSU, KNDX, etc.), geometria do grão (BATES, C-Slot), dimensões do motor e diâmetro da garganta da tubeira.",

  "q24_nakka": "A planilha SRM simula a balística interna: calcula a curva de pressão x tempo, empuxo x tempo e impulso total, permitindo prever se o motor vai funcionar ou explodir (pressão excessiva).",

  "q25_nakka": "EZImpulse é uma ferramenta simplificada para estimativas rápidas de desempenho total. SRM é uma simulação detalhada passo-a-passo (transiente) que considera a mudança da geometria do grão durante a queima.",

  // Atividade 04
  "q15": "Cálculo:\n1. Volume específico (v) = 1/rho. Velocidade = vazão * v / Área.\n   Ve = (1.3 kg/s * 5.8 m³/kg) / (35e-4 m²) = 7.54 / 0.0035 ≈ 2154 m/s.\n2. Empuxo (F) = vazão * Ve (assumindo expansão ótima Pe=Pa).\n   F = 1.3 * 2154 ≈ 2800 N.",

  "q16": "Dados: P0 = 2.4 MPa, T0 = 2800 K, k = 1.3.\nAssumindo expansão ótima ao nível do mar (Pe ≈ 0.101 MPa).\nRazão de pressão (Pr) = 0.101 / 2.4 ≈ 0.042.\nTe = T0 * (Pr)^((k-1)/k)\nTe = 2800 * (0.042)^0.23 ≈ 2800 * 0.48 ≈ 1344 K.",

  "q17": "Dados: P0 = 4000 psi, k = 1.2.\nExpansão ótima ao nível do mar (Pe = 14.7 psi).\nRazão P0/Pe = 4000/14.7 ≈ 272.\nRelação isentrópica: P0/Pe = (1 + (k-1)/2 * M^2)^(k/(k-1))\n272 = (1 + 0.1*M^2)^6\n272^(1/6) ≈ 2.54 = 1 + 0.1*M^2\n1.54 = 0.1*M^2 -> M^2 = 15.4 -> Mach ≈ 3.92."
};