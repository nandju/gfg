import { GoalMimeChallenge, GoalMimeDifficulty, sanitizeGoalMimeChallenge } from "@/lib/schemas/goal-mime-schema"

const fallbackMimes: GoalMimeChallenge[] = [
  // easy
  { player: "Cristiano Ronaldo", difficulty: "easy", mimeHints: ["Célébration Siiiu", "Numéro 7", "Course puissante", "Frappe du pied droit"] },
  { player: "Lionel Messi", difficulty: "easy", mimeHints: ["Dribble court", "Pied gauche", "Barcelone", "Regard calme"] },
  { player: "Neymar", difficulty: "easy", mimeHints: ["Rabona", "Brésil", "PSG", "Chapeau"] },
  { player: "Ronaldinho", difficulty: "easy", mimeHints: ["Sourire", "Barcelone", "Dent", "Jongle"] },
  { player: "Sadio Mané", difficulty: "easy", mimeHints: ["Vitesse", "Sénégal", "Ailier", "Pressing"] },
  { player: "Robert Lewandowski", difficulty: "easy", mimeHints: ["Polonais", "9", "Finition", "Pénalty"] },
  // medium
  { player: "Kylian Mbappe", difficulty: "medium", mimeHints: ["Vitesse explosive", "Bras croisés", "Paris", "Appel en profondeur"] },
  { player: "Erling Haaland", difficulty: "medium", mimeHints: ["Attaquant géant", "Finition froide", "Célébration méditation", "Manchester City"] },
  { player: "Karim Benzema", difficulty: "medium", mimeHints: ["Contrôle dos au but", "Real Madrid", "Lyon", "Ballon d'Or"] },
  { player: "Mohamed Salah", difficulty: "medium", mimeHints: ["Ailier égyptien", "Liverpool", "Pharaon", "Finale blessure"] },
  { player: "Antoine Griezmann", difficulty: "medium", mimeHints: ["Célébration danse", "France", "Atletico", "Barcelone"] },
  { player: "Kevin De Bruyne", difficulty: "medium", mimeHints: ["Passe en profondeur", "Belgique", "City", "Vision"] },
  { player: "Virgil van Dijk", difficulty: "medium", mimeHints: ["Défenseur géant", "Liverpool", "Pays-Bas", "Calme"] },
  // hard
  { player: "Zinedine Zidane", difficulty: "hard", mimeHints: ["Contrôle élégant", "Roulette", "Numéro 10", "Finale légendaire"] },
  { player: "Johan Cruyff", difficulty: "hard", mimeHints: ["Virage", "Pays-Bas", "Ajax", "Barcelone"] },
  { player: "George Weah", difficulty: "hard", mimeHints: ["Liberia", "Course solitaire", "AC Milan", "Président"] },
  { player: "Xavi Hernandez", difficulty: "hard", mimeHints: ["Passe latérale", "Barcelone", "Milieu", "Catalogne"] },
  { player: "Didier Drogba", difficulty: "hard", mimeHints: ["Puissance", "Côte d'Ivoire", "Chelsea", "Marseille"] },
  { player: "Luka Modric", difficulty: "hard", mimeHints: ["Croate", "Real Madrid", "10", "Ballon d'Or 2018"] }
]

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getFallbackGoalMime(difficulty: GoalMimeDifficulty = "medium") {
  const exact = fallbackMimes.filter((mime) => mime.difficulty === difficulty)
  const exactShuffled = shuffle(exact)
  const others = shuffle(fallbackMimes.filter((mime) => mime.difficulty !== difficulty))
  const pick = exactShuffled[0] ?? others[0] ?? fallbackMimes[0]
  return sanitizeGoalMimeChallenge(pick)
}
