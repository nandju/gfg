export interface Game {
  id: string
  title: string
  description: string
  tagline: string
  players: string
  duration: string
  coverImage: string
  backgroundMobile: string
  backgroundDesktop: string
  scenes: string[]
  link: string
  available: boolean
}

export const games: Game[] = [
  {
    id: "threedays",
    title: "THREE DAYS",
    description: "Faites un souhait. Survivez trois manches. Ne laissez jamais personne deviner la condition secrète qui peut vous sauver — ou vous perdre.",
    tagline: "Déduction sociale",
    players: "3+ joueurs",
    duration: "~20 min",
    coverImage: "/threedays/cover.png",
    backgroundMobile: "/threedays/mobile7.png",
    backgroundDesktop: "/threedays/desktop.png",
    scenes: [
      "/threedays/Gemini_Generated_Image_5qoyz45qoyz45qoy.png",
      "/threedays/Gemini_Generated_Image_gzsuq4gzsuq4gzsu.png",
      "/threedays/Loba_martin_nandjui_Image_4_-_THREE_DAYS_image_dune_main_qui_mets_une_enveloppe_dan_03690dec-9fa5-43d1-892a-5b28390419fa.png"
    ],
    link: "/games/threedays",
    available: true
  },
  {
    id: "moonsters",
    title: "Moonsters",
    description: "Devenez un moonster ou un chasseur et defendez votre camp à bout de ruse et de stratégie pour remporter la victoire",
    tagline: "Stratégie & ruse",
    players: "4+ joueurs",
    duration: "~20 min",
    coverImage: "/moonsters/cover.jpeg",
    backgroundMobile: "/moonsters/mobile1.png",
    backgroundDesktop: "/moonsters/desktop.png",
    scenes: [],
    link: "/games/moonsters",
    available: false
  },
  {
    id: "cagewild",
    title: "Cage Wild",
    description: "Utilisez votre partenaire pour survivre dans cet univers impitoyable où la coopération est la clé de la survie. Un jeu d'action et de stratégie intense pour les duos audacieux.",
    tagline: "Duos & trahison",
    players: "4+ joueurs",
    duration: "~25 min",
    coverImage: "/cagewild/cover.png",
    backgroundMobile: "/cagewild/mobile4.png",
    backgroundDesktop: "/cagewild/desktop.png",
    scenes: [
      "/cagewild/63ae669cbd044c7bbb625ce17a6f8c92 (1).jpg",
      "/cagewild/ce8d05a9726442a48c3f4bfe2b50bd91.jpg",
      "/cagewild/Gemini_Generated_Image_om1y20om1y20om1y.png"
    ],
    link: "/games/cagewild",
    available: true
  },
  {
    id: "deadlypsycho",
    title: "Deadly Psycho",
    description: "Nagez dans le monde impitoyable des assassins où seul un esprit totalement fou peut survivre",
    tagline: "Survival psychologique",
    players: "3+ joueurs",
    duration: "~20 min",
    coverImage: "/deadlypsycho/cover.png",
    backgroundMobile: "/deadlypsycho/mobile5.png",
    backgroundDesktop: "/deadlypsycho/desktop.png",
    scenes: [],
    link: "/games/deadlypsycho",
    available: false
  },
  {
    id: "goal",
    title: "GOAL!!!",
    description: "Formez votre équipe et battez vos adversaires : quiz football générés par IA, défis de mime et mots-clés. Seuls les plus aguerris soulèveront le trophée.",
    tagline: "Quiz & party football",
    players: "2+ joueurs",
    duration: "~15 min",
    coverImage: "/goal!!!/cover.png",
    backgroundMobile: "/goal!!!/mobile3.png",
    backgroundDesktop: "/goal!!!/desktop.png",
    scenes: [
      "/goal!!!/mmzloq9mPixazoAi.png",
      "/goal!!!/téléchargement (18).jpg",
      "/goal!!!/mobile.png"
    ],
    link: "/games/goal",
    available: true
  },
  {
    id: "jobwars",
    title: "Job Wars",
    description: "Avec le metier de votre choix, affrontez les autres joueurs dans des batailles épiques pour prouver que votre profession est la meilleure",
    tagline: "Batailles de métiers",
    players: "2+ joueurs",
    duration: "~15 min",
    coverImage: "/jobwars/cover.png",
    backgroundMobile: "/jobwars/mobile2.png",
    backgroundDesktop: "/jobwars/desktop.png",
    scenes: [],
    link: "/games/jobwars",
    available: false
  },
  {
    id: "adassa",
    title: "ADASSA",
    description: "Découvrez le mystère d'ADASSA, un jeu qui défie les attentes et révèle une expérience de jeu unique que personne n'aurait pu anticiper.",
    tagline: "Mystère narratif",
    players: "2+ joueurs",
    duration: "~20 min",
    coverImage: "/adassa/cover.png",
    backgroundMobile: "/adassa/mobile6.png",
    backgroundDesktop: "/adassa/desktop.png",
    scenes: [],
    link: "/games/adassa",
    available: false
  },
  {
    id: "bus",
    title: "BUS, le survivant de l'accident",
    description: "Une fois que vous prenez ce bus, il n'y a pas de retour en arrière. Plongez dans une aventure palpitante où chaque arrêt vous rapproche soit de la sécurité, soit du danger.",
    tagline: "Survie narrative",
    players: "2+ joueurs",
    duration: "~20 min",
    coverImage: "/bus/cover.png",
    backgroundMobile: "/bus/mobile8.png",
    backgroundDesktop: "/bus/desktop.png",
    scenes: [],
    link: "/games/bus",
    available: false
  }
]
