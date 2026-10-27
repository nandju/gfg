export interface Game {
  id: string
  title: string
  description: string
  tagline: string
  genre: string
  mode: string
  players: string
  image: string
  backgrounds: string[]
  link: string
  available: boolean
}

export const games: Game[] = [
  {
    id: "threedays",
    title: "THREE DAYS",
    description: "Faites un souhait. Survivez trois manches. Ne laissez jamais personne deviner la condition qui peut vous sauver.",
    tagline: "Le souhait est accordé",
    genre: "Déduction sociale",
    mode: "Joueurs dans la même pièce",
    players: "3 à 12 joueurs",
    image: "/threedays/cover.png",
    backgrounds: ["/threedays/desktop.png", "/threedays/mobile7.png"],
    link: "/games/threedays",
    available: true
  },
  {
    id: "moonsters",
    title: "Moonsters",
    description: "Devenez un moonster ou un chasseur et defendez votre camp à bout de ruse et de stratégie pour remporter la victoire",
    tagline: "La nuit vous appartient",
    genre: "Stratégie",
    mode: "Multijoueur",
    players: "Bientôt",
    image: "/moonsters/cover.jpeg",
    backgrounds: ["/moonsters/desktop.png", "/moonsters/mobile1.png"],
    link: "/games/moonsters",
    available: false
  },
  {
    id: "cagewild",
    title: "Cage Wild",
    description: "Une expérience psychologique multijoueur en duo. Les téléphones portent des secrets. Les visages portent des mensonges.",
    tagline: "Personne n'abandonne",
    genre: "Déduction · Trahison",
    mode: "Duos dans la même pièce",
    players: "4 à 12 joueurs",
    image: "/cagewild/cover.png",
    backgrounds: ["/cagewild/desktop.png", "/cagewild/mobile4.png"],
    link: "/games/cagewild",
    available: true
  },
  {
    id: "deadlypsycho",
    title: "Deadly Psycho",
    description: "Nagez dans le monde impitoyable des assassins où seul un esprit totalement fou peut survivre",
    tagline: "La folie est une arme",
    genre: "Action",
    mode: "Multijoueur",
    players: "Bientôt",
    image: "/deadlypsycho/cover.png",
    backgrounds: ["/deadlypsycho/desktop.png", "/deadlypsycho/mobile5.png"],
    link: "/games/deadlypsycho",
    available: false
  },
  {
    id: "goal",
    title: "GOAL!!!",
    description: "Des mini-jeux de football rapides pour des joueurs dans la même pièce. Quiz IA, mimes et mots-clés, scores cachés, révélations.",
    tagline: "Soirée football locale",
    genre: "Quiz · Party game",
    mode: "Équipes dans la même pièce",
    players: "2 à 12 joueurs",
    image: "/goal!!!/cover.png",
    backgrounds: ["/goal!!!/desktop.png", "/goal!!!/mobile3.png"],
    link: "/games/goal",
    available: true
  },
  {
    id: "jobwars",
    title: "Job Wars",
    description: "Avec le metier de votre choix, affrontez les autres joueurs dans des batailles épiques pour prouver que votre profession est la meilleure",
    tagline: "Que le meilleur métier gagne",
    genre: "Bataille",
    mode: "Multijoueur",
    players: "Bientôt",
    image: "/jobwars/cover.png",
    backgrounds: ["/jobwars/desktop.png", "/jobwars/mobile2.png"],
    link: "/games/jobwars",
    available: false
  },
  {
    id: "adassa",
    title: "ADASSA",
    description: "Découvrez le mystère d'ADASSA, un jeu qui défie les attentes et révèle une expérience de jeu unique que personne n'aurait pu anticiper. Plongez dans un univers où les apparences sont trompeuses et où chaque décision compte.",
    tagline: "Les apparences trompent",
    genre: "Mystère",
    mode: "Multijoueur",
    players: "Bientôt",
    image: "/adassa/cover.png",
    backgrounds: ["/adassa/desktop.png", "/adassa/mobile6.png"],
    link: "/games/adassa",
    available: false
  },
  {
    id: "bus",
    title: "BUS, le survivant de l'accident",
    description: "Une fois que vous prenez ce bus, il n'y a pas de retour en arrière. Plongez dans une aventure palpitante où chaque arrêt vous rapproche soit de la sécurité, soit du danger. Serez-vous capable de survivre à ce voyage imprévisible ?",
    tagline: "Pas de retour en arrière",
    genre: "Aventure",
    mode: "Multijoueur",
    players: "Bientôt",
    image: "/bus/cover.png",
    backgrounds: ["/bus/desktop.png", "/bus/mobile8.png"],
    link: "/games/bus",
    available: false
  }
]
