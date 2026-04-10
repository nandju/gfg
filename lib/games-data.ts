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
    id: "zelda",
    title: "La Légende de Zelda",
    description: "Explorez un vaste monde ouvert et sauvez le royaume d'Hyrule dans cette aventure épique en équipe.",
    coverImage: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=600&fit=crop",
    backgroundMobile: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=1200&fit=crop",
    backgroundDesktop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=1080&fit=crop",
    link: "/games/zelda"
  },
  {
    id: "mario",
    title: "Super Mario Aventure",
    description: "Parcourez des mondes colorés et collectez des étoiles avec vos coéquipiers dans cette aventure multijoueur.",
    coverImage: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=600&fit=crop",
    backgroundMobile: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&h=1200&fit=crop",
    backgroundDesktop: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1920&h=1080&fit=crop",
    link: "/games/mario"
  },
  {
    id: "animal",
    title: "Île Paradisiaque",
    description: "Construisez et gérez votre île de rêve avec vos amis dans ce jeu de simulation relaxant.",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop",
    backgroundMobile: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
    backgroundDesktop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    link: "/games/animal"
  },
  {
    id: "hades",
    title: "Royaume des Ombres",
    description: "Échappez-vous des enfers dans ce jeu d'action coopératif intense et stratégique.",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
    backgroundMobile: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=1200&fit=crop",
    backgroundDesktop: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop",
    link: "/games/hades"
  },
  {
    id: "minecraft",
    title: "Monde de Blocs",
    description: "Construisez, explorez et survivez ensemble dans un monde infini de possibilités.",
    coverImage: "https://images.unsplash.com/photo-1587573089734-599d584002d0?w=400&h=600&fit=crop",
    backgroundMobile: "https://images.unsplash.com/photo-1518173946687-a4c036056a06?w=800&h=1200&fit=crop",
    backgroundDesktop: "https://images.unsplash.com/photo-1518173946687-a4c036056a06?w=1920&h=1080&fit=crop",
    link: "/games/minecraft"
  }
]
