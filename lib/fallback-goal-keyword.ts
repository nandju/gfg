import { GoalKeywordChallenge, GoalKeywordDifficulty, sanitizeGoalKeywordChallenge } from "@/lib/schemas/goal-keyword-schema"

const fallbackKeywords: GoalKeywordChallenge[] = [
  // easy
  { answer: "Cristiano Ronaldo", keywords: ["7", "Portugal", "Siiiu", "Real Madrid", "Buteur"], difficulty: "easy" },
  { answer: "Lionel Messi", keywords: ["10", "Argentine", "Barcelone", "Gauche", "Ballon d'Or"], difficulty: "easy" },
  { answer: "Neymar", keywords: ["Brésil", "Santos", "Barcelone", "PSG", "Casse-cou"], difficulty: "easy" },
  { answer: "Zlatan Ibrahimovic", keywords: ["Suède", "Milan", "Géant", "Karate", "Tête"], difficulty: "easy" },
  { answer: "Sadio Mané", keywords: ["Sénégal", "Liverpool", "Vitesse", "Bayern Munich", "Ailier"], difficulty: "easy" },
  { answer: "Robert Lewandowski", keywords: ["Pologne", "9", "Bayern Munich", "Barcelone", "Buteur"], difficulty: "easy" },
  // medium
  { answer: "Kylian Mbappe", keywords: ["France", "Vitesse", "Paris", "2018", "Attaquant"], difficulty: "medium" },
  { answer: "Mohamed Salah", keywords: ["Égypte", "Liverpool", "Ailier", "Pharaon", "Klopp"], difficulty: "medium" },
  { answer: "Karim Benzema", keywords: ["France", "Real Madrid", "Ballon d'Or", "9", "Lyon"], difficulty: "medium" },
  { answer: "Kevin De Bruyne", keywords: ["Belgique", "Manchester City", "Passe", "Milieu", "Vision"], difficulty: "medium" },
  { answer: "Virgil van Dijk", keywords: ["Pays-Bas", "Liverpool", "Défenseur", "Capitaine", "Sérénité"], difficulty: "medium" },
  { answer: "Trent Alexander-Arnold", keywords: ["Angleterre", "Liverpool", "Latéral", "Passe", "Coup franc"], difficulty: "medium" },
  { answer: "Antoine Griezmann", keywords: ["France", "Atletico Madrid", "Barcelone", "Danse", "Attaquant"], difficulty: "medium" },
  // hard
  { answer: "Luka Modric", keywords: ["Croatie", "Milieu", "Real Madrid", "2018", "Ballon d'Or"], difficulty: "hard" },
  { answer: "Franz Beckenbauer", keywords: ["Allemagne", "Libéro", "Bayern Munich", "Capitaine", "Kaiser"], difficulty: "hard" },
  { answer: "Johan Cruyff", keywords: ["Pays-Bas", "Ajax", "Barcelone", "3", "Pluie"], difficulty: "hard" },
  { answer: "George Weah", keywords: ["Liberia", "Ballon d'Or", "PSG", "AC Milan", "Président"], difficulty: "hard" },
  { answer: "Xavi Hernandez", keywords: ["Espagne", "Barcelone", "Milieu", "Passe", "Catalogne"], difficulty: "hard" },
  { answer: "Didier Drogba", keywords: ["Côte d'Ivoire", "Chelsea", "Puissance", "Marseille", "Finale"], difficulty: "hard" }
]

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getFallbackGoalKeyword(difficulty: GoalKeywordDifficulty = "medium") {
  const exact = fallbackKeywords.filter((keyword) => keyword.difficulty === difficulty)
  const exactShuffled = shuffle(exact)
  const others = shuffle(fallbackKeywords.filter((keyword) => keyword.difficulty !== difficulty))
  const pick = exactShuffled[0] ?? others[0] ?? fallbackKeywords[0]
  return sanitizeGoalKeywordChallenge(pick)
}
