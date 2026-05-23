import { GameFlowPage } from "@/components/game-flow-page"

const game = {
  title: "GOAL!!!",
  coverImage: "/goal!!!/cover.png",
  backgroundMobile: "/goal!!!/mobile3.png",
  backgroundDesktop: "/goal!!!/desktop.png"
}

const cards = [
  {
    title: "Le Capitaine",
    text: "Menez votre équipe et gardez le contrôle du terrain.",
    image: "/goal!!!/mmzloq9mPixazoAi.png"
  },
  {
    title: "La Frappe",
    text: "Trouvez l'ouverture parfaite et tentez le tir décisif.",
    image: "/goal!!!/téléchargement (18).jpg"
  },
  {
    title: "La Tactique",
    text: "Organisez vos joueurs pour surprendre l'équipe adverse.",
    image: "/goal!!!/cover.jpeg"
  },
  {
    title: "Le Trophée",
    text: "Seuls les plus aguerris pourront soulever la victoire.",
    image: "/goal!!!/cover.png"
  }
]

export default function GoalPage() {
  return <GameFlowPage game={game} cards={cards} />
}
