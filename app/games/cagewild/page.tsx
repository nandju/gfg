import { GameFlowPage } from "@/components/game-flow-page"

const game = {
  title: "Cage Wild",
  coverImage: "/cagewild/cover.png",
  backgroundMobile: "/cagewild/mobile4.png",
  backgroundDesktop: "/cagewild/desktop.png"
}

const cards = [
  {
    title: "Le Duo",
    text: "Restez ensemble et coordonnez chaque mouvement pour survivre.",
    image: "/cagewild/Gemini_Generated_Image_om1y20om1y20om1y.png"
  },
  {
    title: "La Cage",
    text: "Un espace dangereux où la stratégie compte autant que la vitesse.",
    image: "/cagewild/63ae669cbd044c7bbb625ce17a6f8c92 (1).jpg"
  },
  {
    title: "L'Instinct",
    text: "Observez les menaces et choisissez le bon moment pour agir.",
    image: "/cagewild/ce8d05a9726442a48c3f4bfe2b50bd91.jpg"
  },
  {
    title: "L'Alliance",
    text: "Votre partenaire est votre meilleure chance de sortir vivant.",
    image: "/cagewild/WhatsApp Image 2026-03-24 at 20.25.15.jpeg"
  }
]

export default function CageWildPage() {
  return <GameFlowPage game={game} cards={cards} />
}
