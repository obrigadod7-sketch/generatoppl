import bgHero from "@/assets/hero-oficial-2-1.png";
import bgCultos from "@/assets/bg-cultos-ao-vivo.jpg";
import bgCelulas from "@/assets/bg-celulas-nas-casas.jpg";
import pastoralFamily from "@/assets/pastoral-family.png";

import casaisHero from "@/assets/casais-hero-treated.png";
import casaisBannerPrincipal from "@/assets/casais-banner-principal.jpg";
import casais01 from "@/assets/casais-01-treated.jpg";
import casais02 from "@/assets/casais-02-treated.jpg";
import casais03 from "@/assets/casais-03-treated.jpg";
import casais04 from "@/assets/casais-04-treated.jpg";
import casais05 from "@/assets/casais-05-treated.jpg";
import casais06 from "@/assets/casais-06-treated.jpg";
import casais07 from "@/assets/casais-07-treated.jpg";
import casais08 from "@/assets/casais-08-treated.jpg";

import ministerioInfantil01 from "@/assets/ministerio-infantil-01.jpg";
import ministerioInfantil02 from "@/assets/ministerio-infantil-02.jpg";
import ministerioInfantil03 from "@/assets/ministerio-infantil-03.jpg";

export type Ministerio = {
  slug: string;
  titulo: string;
  subtitulo?: string;
  resumo?: string;
  descricao?: string;
  missao?: string;
  valores?: string[];
  atividades?: string[];
  comoParticipar?: string;
  versiculo?: {
    referencia: string;
    texto: string;
  };
  ctaLabel?: string;
  imagem: string;
  galeria?: string[];
};

export const MINISTERIOS: Ministerio[] = [
  {
    slug: "diaconato",
    titulo: "Diaconato",
    subtitulo: "Serviço, cuidado e apoio à igreja",
    resumo: "Serviço, cuidado e apoio à igreja.",
    descricao:
      "O Diaconato é um ministério dedicado ao serviço cristão, cuidando das necessidades da igreja com amor, responsabilidade e dedicação, seguindo o exemplo de Cristo.",
    missao: "Servir com excelência, promovendo cuidado prático e acolhimento, para que a igreja caminhe em unidade e amor.",
    valores: ["Amor ao próximo", "Responsabilidade", "Humildade", "Disposição para servir"],
    atividades: [
      "Apoio em cultos e eventos (organização e acolhimento)",
      "Cuidado com necessidades práticas de membros e visitantes",
      "Suporte logístico e auxílio nas demandas da igreja",
    ],
    comoParticipar:
      "Procure a liderança após o culto ou envie uma mensagem pelas redes sociais para conhecer as áreas de serviço e o processo de integração.",
    versiculo: {
      referencia: "Marcos 10:45",
      texto: "Porque o Filho do Homem não veio para ser servido, mas para servir e dar a sua vida em resgate por muitos.",
    },
    ctaLabel: "Quero Servir",
    imagem: pastoralFamily,
  },
  {
    slug: "interseccao",
    titulo: "Intersecção",
    subtitulo: "Oração e intercessão pela igreja e pela cidade",
    resumo: "Oração e intercessão pela igreja e pela cidade.",
    descricao:
      "O ministério de Intersecção sustenta a igreja em oração, clamando a Deus pela cidade, famílias e líderes, crendo no poder transformador da oração.",
    missao:
      "Interceder com perseverança pela igreja e pela cidade, buscando direção de Deus e fortalecendo a fé da comunidade.",
    atividades: [
      "Encontros de oração e intercessão",
      "Cobertura espiritual por líderes, famílias e projetos",
      "Apoio em campanhas e motivos específicos de oração",
    ],
    comoParticipar:
      "Envie seu pedido de oração ou participe dos encontros; fale com a liderança para receber horários e orientações.",
    versiculo: {
      referencia: "1 Tessalonicenses 5:17",
      texto: "Orai sem cessar.",
    },
    ctaLabel: "Pedido de Oração",
    imagem: bgHero,
  },
  {
    slug: "irmaos-a-obra",
    titulo: "Irmãos a Obra",
    subtitulo: "Mãos à obra para servir em cada necessidade",
    resumo: "Mãos à obra para servir em cada necessidade.",
    descricao:
      "O Irmãos à Obra atua de forma prática, servindo com disposição em reformas, apoio logístico e necessidades diversas da igreja.",
    missao: "Servir com excelência em necessidades práticas, facilitando o funcionamento e o cuidado do espaço e das ações da igreja.",
    atividades: [
      "Apoio em reformas e manutenção",
      "Montagem e logística para eventos",
      "Serviços diversos conforme necessidades da igreja",
    ],
    comoParticipar:
      "Se você tem disposição para ajudar, fale com a equipe para ser incluído nos grupos de serviço e escalas.",
    versiculo: {
      referencia: "Colossenses 3:23",
      texto: "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor e não aos homens.",
    },
    ctaLabel: "Seja Voluntário",
    imagem: bgCultos,
  },
  {
    slug: "cantina",
    titulo: "Cantina",
    subtitulo: "Convivência e apoio às ações da igreja",
    resumo: "Convivência e apoio às ações da igreja.",
    descricao:
      "A Cantina promove comunhão entre os irmãos e apoia financeiramente ações e projetos da igreja por meio do serviço.",
    missao: "Promover comunhão e contribuir com projetos da igreja, servindo com alegria e organização.",
    atividades: [
      "Atendimento em dias e horários definidos",
      "Apoio a eventos e ações especiais",
      "Organização e preparo conforme escala",
    ],
    comoParticipar: "Fale com a equipe para entrar na escala de voluntários e apoiar no atendimento.",
    versiculo: {
      referencia: "Atos 2:46",
      texto: "E perseverando unânimes todos os dias no templo, e partindo o pão em casa, comiam juntos com alegria e singeleza de coração.",
    },
    ctaLabel: "Colabore",
    imagem: bgCelulas,
  },
  {
    slug: "ministerio-de-casais",
    titulo: "Ministério de Casais",
    subtitulo: "Fortalecendo famílias e alianças",
    resumo: "Fortalecendo famílias e alianças.",
    descricao:
      "O Ministério de Casais trabalha para fortalecer o casamento à luz da Palavra de Deus, promovendo unidade, amor e compromisso.",
    missao: "Edificar casais e famílias, oferecendo cuidado, ensino bíblico e oportunidades de crescimento e comunhão.",
    atividades: ["Encontros e eventos para casais", "Momentos de ensino e discipulado", "Apoio e aconselhamento"],
    comoParticipar: "Participe dos encontros e procure a liderança para ser incluído nas próximas atividades.",
    versiculo: {
      referencia: "Eclesiastes 4:12",
      texto: "...e o cordão de três dobras não se quebra tão depressa.",
    },
    ctaLabel: "Participar",
    // Banner principal (Casais)
    imagem: casaisBannerPrincipal,
    galeria: [casais01, casais02, casais03, casais04, casais05, casais06, casais07, casais08],
  },
  {
    slug: "grupo-de-senhoras",
    titulo: "Grupo de Senhoras",
    subtitulo: "Comunhão, oração e crescimento",
    resumo: "Comunhão, oração e crescimento.",
    descricao:
      "O Grupo de Senhoras é um espaço de comunhão, edificação espiritual e serviço cristão entre mulheres da igreja.",
    missao: "Fortalecer mulheres na fé e no serviço, promovendo edificação, oração e comunhão.",
    atividades: ["Encontros regulares", "Momentos de oração e ensino", "Ações de serviço e apoio"],
    comoParticipar: "Fale com a liderança do grupo para receber horários e participar dos próximos encontros.",
    versiculo: {
      referencia: "Provérbios 31:30",
      texto: "Enganosa é a graça, e vã a formosura; mas a mulher que teme ao Senhor, essa será louvada.",
    },
    ctaLabel: "Fazer Parte",
    imagem: bgHero,
  },
  {
    slug: "grupo-dos-homens",
    titulo: "Grupo dos Homens",
    subtitulo: "Homens firmes na fé e no serviço",
    resumo: "Homens firmes na fé e no serviço.",
    descricao:
      "O Grupo dos Homens incentiva homens a viverem uma fé madura, comprometida com Deus, família e igreja.",
    missao: "Formar homens firmes na fé, comprometidos com Deus, família e igreja, vivendo discipulado e serviço.",
    atividades: ["Encontros e comunhão", "Momentos de oração e discipulado", "Ações práticas de serviço"],
    comoParticipar: "Participe dos encontros e entre no grupo para receber as próximas datas e ações.",
    versiculo: {
      referencia: "1 Coríntios 16:13",
      texto: "Vigiai, estai firmes na fé; portai-vos varonilmente, e fortalecei-vos.",
    },
    ctaLabel: "Junte-se a Nós",
    imagem: bgCultos,
  },
  {
    slug: "missao-global",
    titulo: "Missão Global",
    subtitulo: "Evangelização e apoio missionário",
    resumo: "Evangelização e apoio missionário.",
    descricao:
      "A Missão Global existe para levar o Evangelho além das fronteiras, apoiando missionários e projetos evangelísticos.",
    missao: "Servir ao avanço do Evangelho, apoiando missionários e iniciativas de evangelização local e global.",
    atividades: ["Apoio a campos missionários", "Projetos e ações evangelísticas", "Oração e suporte a missionários"],
    comoParticipar: "Contribua, ore e participe das ações; procure a equipe para conhecer projetos em andamento.",
    versiculo: {
      referencia: "Marcos 16:15",
      texto: "Ide por todo o mundo, pregai o evangelho a toda criatura.",
    },
    ctaLabel: "Apoiar Missões",
    imagem: bgCelulas,
  },
  {
    slug: "ministerio-infantil",
    titulo: "Ministério Infantil",
    subtitulo: "Cuidando das crianças com amor, ensino e segurança",
    resumo: "Cuidando das crianças com amor, ensino e segurança.",
    descricao:
      "Um ministério dedicado a receber crianças e famílias com acolhimento, discipulado e responsabilidade, apoiando os pais na formação cristã.",
    // Conteúdo completo (PT/EN/FR) é exibido via i18n na página de detalhe.
    imagem: bgHero,
    galeria: [ministerioInfantil01, ministerioInfantil02, ministerioInfantil03],
  },
  {
    slug: "tesouraria",
    titulo: "Tesouraria",
    subtitulo: "Transparência e organização financeira",
    resumo: "Transparência e organização financeira.",
    descricao:
      "A Tesouraria zela pela boa administração dos recursos da igreja, com transparência, responsabilidade e fidelidade.",
    missao: "Administrar recursos com integridade, organização e prestação de contas, honrando princípios bíblicos.",
    atividades: ["Organização financeira", "Prestação de contas", "Suporte administrativo às ações da igreja"],
    versiculo: {
      referencia: "1 Coríntios 4:2",
      texto: "Além disso, requer-se dos despenseiros que cada um se ache fiel.",
    },
    imagem: bgHero,
  },
  {
    slug: "secretaria",
    titulo: "Secretaria",
    subtitulo: "Atendimento e organização administrativa",
    resumo: "Atendimento e organização administrativa.",
    descricao:
      "A Secretaria é responsável pela organização administrativa da igreja, oferecendo suporte e atendimento aos membros.",
    missao: "Apoiar a organização e o cuidado administrativo, facilitando comunicação, atendimento e suporte aos ministérios.",
    atividades: ["Atendimento e organização", "Cadastro e apoio a membros", "Suporte a eventos e ministérios"],
    versiculo: {
      referencia: "1 Coríntios 14:40",
      texto: "Mas faça-se tudo decentemente e com ordem.",
    },
    imagem: bgCultos,
  },
];

export const MINISTERIO_SOCIALS = {
  facebook: "https://www.facebook.com/egliseevangelique.evangelique",
  instagram: "https://www.instagram.com/eglise.mission_lusitana/",
  youtube: "https://www.youtube.com/@palavraviva4437",
};

export function getMinisterioBySlug(slug: string) {
  return MINISTERIOS.find((m) => m.slug === slug);
}
