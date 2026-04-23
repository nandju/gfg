export interface Game {
  id: string
  title: string
  description: string
  coverImage: string
  backgroundMobile: string
  backgroundDesktop: string
  link: string
}

export const games: Game[] = [
  {
    id: "threedays",
    title: "THREE DAYS",
    description: "Echappez à la règle des 3 jours après la réalisation de votre souhait",
    coverImage: "/threedays/cover.png",
    backgroundMobile: "/threedays/mobile7.png",
    backgroundDesktop: "/threedays/desktop.png",
    link: "/games/threedays"
  },
  {
    id: "moonsters",
    title: "Moonsters",
    description: "Devenez un moonster ou un chasseur et defendez votre camp à bout de ruse et de stratégie pour remporter la victoire",
    coverImage: "/moonsters/cover.jpeg",
    backgroundMobile: "/moonsters/mobile1.png",
    backgroundDesktop: "/moonsters/desktop.png",
    link: "/games/moonsters"
  },
  {
    id: "cagewild",
    title: "Cage Wild",
    description: "Utilisez votre partenaire pour survivre dans cet univers impitoyable où la coopération est la clé de la survie. Un jeu d'action et de stratégie intense pour les duos audacieux.",
    coverImage: "/cagewild/cover.png",
    backgroundMobile: "/cagewild/mobile4.png",
    backgroundDesktop: "/cagewild/desktop.png",
    link: "/games/cagewild"
  },
  {
    id: "deadlypsycho",
    title: "Deadly Psycho",
    description: "Nagez dans le monde impitoyable des assassins où seul un esprit totalement fou peut survivre",
    coverImage: "/deadlypsycho/cover.png",
    backgroundMobile: "/deadlypsycho/mobile5.png",
    backgroundDesktop: "/deadlypsycho/desktop.png",
    link: "/games/deadlypsycho"
  },
  {
    id: "goal",
    title: "GOAL !!!",
    description: "Formez votre équipe et battez vos adversaires, seul les plus aguéris pourront soulever le trophée de la victoire",
    coverImage: "/goal!!!/cover.png",
    backgroundMobile: "/goal!!!/mobile3.png",
    backgroundDesktop: "/goal!!!/desktop.png",
    link: "/games/goal"
  },
  {
    id: "jobwars",
    title: "Job Wars",
    description: "Avec le metier de votre choix, affrontez les autres joueurs dans des batailles épiques pour prouver que votre profession est la meilleure",
    coverImage: "/jobwars/cover.png",
    backgroundMobile: "/jobwars/mobile2.png",
    backgroundDesktop: "/jobwars/desktop.png",
    link: "/games/jobwars"
  },
  {
    id: "adassa",
    title: "ADASSA",
    description: "Découvrez le mystère d'ADASSA, un jeu qui défie les attentes et révèle une expérience de jeu unique que personne n'aurait pu anticiper. Plongez dans un univers où les apparences sont trompeuses et où chaque décision compte.",
    coverImage: "/adassa/cover.png",
    backgroundMobile: "/adassa/mobile6.png",
    backgroundDesktop: "/adassa/desktop.png",
    link: "/games/adassa"
  },
  {
    id: "bus",
    title: "BUS, le survivant de l'accident",
    description: "Une fois que vous prenez ce bus, il n'y a pas de retour en arrière. Plongez dans une aventure palpitante où chaque arrêt vous rapproche soit de la sécurité, soit du danger. Serez-vous capable de survivre à ce voyage imprévisible ?",
    coverImage: "/bus/cover.png",
    backgroundMobile: "/bus/mobile8.png",
    backgroundDesktop: "/bus/desktop.png",
    link: "/games/bus"
  }
]
