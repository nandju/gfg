import { GameFlowPage } from "@/components/game-flow-page"

const game = {
  title: "THREE DAYS",
  coverImage: "/threedays/cover.png",
  backgroundMobile: "/threedays/mobile7.png",
  backgroundDesktop: "/threedays/desktop.png"
}

const cards = [
  {
    title: "Le Souhait",
    text: "Une promesse commence ici. Choisissez avec prudence.",
    image: "/threedays/Gemini_Generated_Image_5qoyz45qoyz45qoy.png"
  },
  {
    title: "L'Enveloppe",
    text: "Un indice caché peut changer les trois prochains jours.",
    image: "/threedays/Loba_martin_nandjui_Image_4_-_THREE_DAYS_image_dune_main_qui_mets_une_enveloppe_dan_03690dec-9fa5-43d1-892a-5b28390419fa.png"
  },
  {
    title: "La Main",
    text: "Une décision rapide peut sauver toute l'équipe.",
    image: "/threedays/Loba_martin_nandjui_Image_4_-_THREE_DAYS_image_dune_main_qui_mets_une_enveloppe_dan_eae8e8c9-9e83-4bae-aae3-26b4b5da2240.png"
  },
  {
    title: "Le Signal",
    text: "Quand le temps avance, chaque joueur doit rester attentif.",
    image: "/threedays/Gemini_Generated_Image_gzsuq4gzsuq4gzsu.png"
  }
]

export default function ThreeDaysPage() {
  return <GameFlowPage game={game} cards={cards} />
}
