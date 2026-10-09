import type { Devocional } from './types'

function diasAtras(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

// Devocionais de exemplo para popular o acervo inicial da IBVEC, um para cada série.
// A equipe pode editar ou excluir qualquer um pelo painel (/admin).
export const devocionaisExemplo: Devocional[] = [
  {
    data: diasAtras(0),
    categoria: 'Café Expresso',
    titulo: 'Alinhando os Passos',
    versiculo: 'Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.',
    referencia: 'Provérbios 16:3 (NVI)',
    texto:
      'Antes de abrir os e-mails, responder às mensagens ou mergulhar na correria, entregue a sua agenda a Deus. Consagrar não é pedir para Deus carimbar o que você já decidiu fazer; é perguntar se as suas decisões estão alinhadas com o coração Dele. Quando colocamos Deus no início, Ele assume a direção do resto.',
    tempoLeitura: '45 segundos',
    tags: ['Foco', 'Direção', 'Manhã'],
    tipoFechamento: 'Desafio do café',
    textoFechamento: 'Gaste os próximos 30 segundos em silêncio entregando as reuniões e tarefas de hoje a Ele. Tenha um dia abençoado!',
    autor: 'Equipe IBVEC',
  },
  {
    data: diasAtras(1),
    categoria: 'Pão Diário',
    titulo: 'O Convite do Descanso',
    versiculo: 'Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.',
    referencia: 'Mateus 11:28 (NVI)',
    texto:
      'Existe uma diferença crucial entre estar cansado fisicamente e estar com a alma esgotada. O cansaço físico se resolve com uma boa noite de sono. Mas o esgotamento da alma — aquele peso invisível provocado pelas cobranças, pelos "e se?" do futuro e pela mania de querer controlar tudo — não se resolve na cama.\n\nJesus conhecia bem o limite da nossa estrutura humana. Por isso, Ele não fez uma cobrança aos cansados; Ele fez um convite. Note que Ele diz "Venham a mim". O descanso que precisamos não é um lugar isolado ou a ausência de problemas, mas sim uma Pessoa.\n\nQuando tentamos carregar o peso do amanhã com as forças de hoje, a conta não fecha. A ansiedade tenta nos convencer de que estamos sozinhos na jornada. No entanto, a proposta de Cristo é a troca: nós entregamos nossos fardos pesados e recebemos Dele a paz que excede o entendimento.\n\nSe a sua mente já começou o dia acelerada e sobrecarregada, faça uma pausa. Você não precisa carregar o mundo nas costas. Deixe que Aquele que sustenta o universo cuide das suas pendências.',
    tempoLeitura: '2 minutos e meio',
    tags: ['Ansiedade', 'Confiança', 'Rotina'],
    tipoFechamento: 'Oração',
    textoFechamento: 'Jesus, eu aceito o Teu convite hoje. Deposito diante dos Teus pés as minhas preocupações, os meus prazos e os meus medos. Tira o peso dos meus ombros e acalma a minha mente. Eu decido caminhar no Teu ritmo leve. Amém.',
    autor: 'Equipe IBVEC',
  },
  {
    data: diasAtras(2),
    categoria: 'Bálsamo e Ânimo',
    titulo: 'O que as Cicatrizes Dizem Sobre Você',
    versiculo: 'Mas ele me disse: "Minha graça é suficiente para você, pois o meu poder se aperfeiçoa na fraqueza".',
    referencia: '2 Coríntios 12:9 (NVI)',
    texto:
      'Há alguns anos, assisti a um documentário sobre a arte japonesa do Kintsugi. Quando uma peça de cerâmica valiosa quebra, os artesãos não a jogam no lixo. Em vez disso, eles colam os pedaços usando uma resina especial misturada com pó de ouro puro. O resultado final é um vaso cheio de linhas douradas brilhantes. A peça não esconde que foi quebrada; pelo contrário, suas fraturas tornam-se a parte mais bonita e valiosa do objeto.\n\nMuitas vezes, nós agimos de forma oposta. Quando passamos por traumas, decepções ou falhas graves, tentamos esconder as nossas rachaduras. Sentimos vergonha das nossas fragilidades e acreditamos que, por estarmos machucados, perdemos o nosso valor para Deus ou para as pessoas ao nosso redor.\n\nMas o Evangelho funciona como o Kintsugi divino. Deus não descarta vidas quebradas. Ele recolhe os pedaços.\n\nQuando o apóstolo Paulo pediu repetidamente para ser livre de uma fraqueza que o atormentava, a resposta de Deus foi profunda: "A minha graça te basta". Deus nos lembra de que não precisamos ser perfeitos ou invencíveis para sermos usados por Ele. São justamente as nossas limitações que criam o cenário perfeito para que o poder Dele se manifeste de forma visível.\n\nSuas cicatrizes não são marcas de vergonha; são troféus de sobrevivência. Elas provam que a dor não conseguiu parar você porque a graça de Deus te sustentou. Suas feridas curadas se transformarão em bálsamo para curar outras pessoas que estão passando pelas mesmas dores hoje.',
    tempoLeitura: '4 minutos',
    tags: ['Identidade', 'Recomeço', 'Superação'],
    tipoFechamento: 'Declaração de fé',
    textoFechamento: 'Eu não sou definido pelos meus pedaços quebrados, mas pelo Amor que me refez. A graça de Deus me basta, e a força Dele se manifesta na minha fraqueza. Eu escolho recomeçar.',
    autor: 'Equipe IBVEC',
  },
  {
    data: diasAtras(3),
    categoria: 'Águas Profundas',
    titulo: 'A Fé no Meio do Caos: O Significado Oculto de Marcos 4',
    versiculo: 'Leia Marcos 4:35-41',
    referencia: 'Marcos 4:35-41',
    texto:
      'Para compreendermos a profundidade da famosa passagem em que Jesus acalma a tempestade, precisamos dar um passo atrás e analisar o cenário sob a ótica da cultura e da geografia daquela época.\n\nO Contexto Geográfico: O Mar da Galileia\nO Mar da Galileia é, na verdade, um grande lago de água doce situado a cerca de 210 metros abaixo do nível do mar, cercado por montanhas. Essa topografia única faz com que ventos frios vindos das colinas colidam abruptamente com o ar quente e úmido que sobe do lago. O resultado? Tempestades violentas, repentinas e extremamente perigosas, capazes de criar ondas gigantescas em poucos minutos.\n\nOs discípulos que estavam no barco — como Pedro, André, Tiago e João — eram pescadores profissionais experientes. Eles conheciam aquele lago como a palma de suas mãos. Se eles estavam apavorados a ponto de clamar "Mestre, não te importas que morramos?", significa que aquela não era uma chuva comum. Era um cenário de sobrevivência extrema.\n\nA Teologia por trás do Silêncio\nEnquanto o barco era inundado pelas ondas, o texto nos traz um detalhe intrigante: Jesus dormia sobre uma almofada na popa.\n\nNo Antigo Testamento, o ato de dormir em meio ao perigo é frequentemente associado à total confiança na soberania e proteção de Deus (como vemos no Salmo 4:8: "Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes viver em segurança"). O sono de Jesus não era indiferença à dor dos discípulos; era a manifestação física da Sua paz absoluta e da Sua identidade divina. Ele sabia quem Ele era e quem estava no controle.\n\nO Termo no Original: Phimoo\nAo acordar, Jesus repreende o vento e diz ao mar: "Cale-se! Acalme-se!". No grego original, a expressão utilizada para "Cale-se" é phimoo, que significa literalmente "amordaçar" ou "colocar uma mordaça". É a mesmíssima palavra que Jesus utilizou em Marcos 1:25 ao expulsar um espírito imundo.\n\nPara a mentalidade judaica da época, o mar revolto era um símbolo do caos, das forças do mal e do desconhecido. Ao usar o termo phimoo, Jesus não estava apenas operando um milagre climático; Ele estava demonstrando autoridade cósmica absoluta sobre o caos. Ele amordaçou o desespero.',
    tempoLeitura: '7 minutos',
    tags: ['Estudo Bíblico', 'Contexto Histórico', 'Fé'],
    tipoFechamento: 'Perguntas para autoexame',
    textoFechamento:
      '1. O barco dos discípulos estava afundando mesmo com Jesus dentro dele. Isso quebra o mito de que a vida cristã é livre de problemas. Qual "tempestade" atual tem feito você esquecer que Jesus está no seu barco?\n2. Os discípulos perguntaram se Jesus não se importava com eles. Você já pegou a si mesmo duvidando do cuidado de Deus em momentos de crise?\n3. O que precisa ser "amordaçado" (phimoo) nas suas emoções hoje para que a paz volte a reinar?',
    autor: 'Equipe IBVEC',
  },
]
