import { GoalQuizCategory, GoalQuizDifficulty, GoalQuizQuestion, sanitizeGoalQuizPack } from "@/lib/schemas/goal-quiz-schema"

const fallbackQuestions: GoalQuizQuestion[] = [
  { question: "Quel pays a remporté la Coupe du monde 2022 ?", choices: ["France", "Argentine", "Brésil", "Allemagne"], answer: "Argentine", category: "International Competitions", difficulty: "easy" },
  { question: "Quelle compétition couronne la meilleure sélection nationale d'Afrique ?", choices: ["CAN", "Euro", "Copa America", "Gold Cup"], answer: "CAN", category: "International Competitions", difficulty: "easy" },
  { question: "Quelle compétition de clubs est considérée comme le plus grand tournoi européen ?", choices: ["Europa League", "Ligue des Champions", "Conference League", "Nations League"], answer: "Ligue des Champions", category: "International Competitions", difficulty: "easy" },
  { question: "Quel tournoi sud-américain oppose notamment le Brésil et l'Argentine ?", choices: ["Euro", "Copa America", "CAN", "Coupe d'Asie"], answer: "Copa America", category: "International Competitions", difficulty: "medium" },
  { question: "Quel trophée individuel récompense souvent le meilleur footballeur du monde ?", choices: ["Soulier d'Or", "Ballon d'Or", "Gant d'Or", "Prix Puskas"], answer: "Ballon d'Or", category: "International Competitions", difficulty: "easy" },
  { question: "Quel tournoi réunit les sélections européennes tous les quatre ans ?", choices: ["Euro", "CAN", "Copa America", "Coupe du monde des clubs"], answer: "Euro", category: "International Competitions", difficulty: "easy" },
  { question: "Quel pays a remporté cinq Coupes du monde FIFA ?", choices: ["Allemagne", "Italie", "Brésil", "Argentine"], answer: "Brésil", category: "International Competitions", difficulty: "medium" },
  { question: "Quelle finale la France a-t-elle remportée 4-2 contre la Croatie ?", choices: ["Coupe du monde 2018", "Euro 2016", "Coupe du monde 2006", "Euro 2020"], answer: "Coupe du monde 2018", category: "International Competitions", difficulty: "medium" },
  { question: "Quel club joue ses matchs à domicile au Santiago Bernabeu ?", choices: ["Barcelone", "Real Madrid", "Atletico Madrid", "Séville"], answer: "Real Madrid", category: "Teams", difficulty: "easy" },
  { question: "Quel club anglais est surnommé les Red Devils ?", choices: ["Liverpool", "Manchester United", "Arsenal", "Chelsea"], answer: "Manchester United", category: "Teams", difficulty: "easy" },
  { question: "Quel club italien est célèbre pour ses rayures noires et bleues au San Siro ?", choices: ["Inter Milan", "Juventus", "Roma", "Napoli"], answer: "Inter Milan", category: "Teams", difficulty: "medium" },
  { question: "Quel club allemand est le plus associé à l'Allianz Arena ?", choices: ["Borussia Dortmund", "Bayern Munich", "RB Leipzig", "Bayer Leverkusen"], answer: "Bayern Munich", category: "Teams", difficulty: "easy" },
  { question: "Quel club français est fortement associé au Parc des Princes ?", choices: ["Marseille", "Lyon", "Paris Saint-Germain", "Monaco"], answer: "Paris Saint-Germain", category: "Teams", difficulty: "easy" },
  { question: "Quel club est mondialement connu pour son centre de formation La Masia ?", choices: ["Barcelone", "Chelsea", "AC Milan", "Benfica"], answer: "Barcelone", category: "Teams", difficulty: "medium" },
  { question: "Quelle sélection nationale est surnommée l'Albiceleste ?", choices: ["Uruguay", "Argentine", "Italie", "Espagne"], answer: "Argentine", category: "Teams", difficulty: "medium" },
  { question: "Quel club a remporté la Ligue des Champions 2004 avec José Mourinho ?", choices: ["Porto", "Chelsea", "Inter Milan", "Real Madrid"], answer: "Porto", category: "Teams", difficulty: "hard" },
  { question: "Quel joueur est fortement associé au numéro 7 et au Portugal ?", choices: ["Cristiano Ronaldo", "Luis Figo", "Eusebio", "Bruno Fernandes"], answer: "Cristiano Ronaldo", category: "Players", difficulty: "easy" },
  { question: "Quel joueur a remporté plusieurs Ballons d'Or avec Barcelone ?", choices: ["Lionel Messi", "Neymar", "Xavi", "Andres Iniesta"], answer: "Lionel Messi", category: "Players", difficulty: "easy" },
  { question: "Quel attaquant norvégien est devenu célèbre pour ses buts à Dortmund et Manchester City ?", choices: ["Martin Odegaard", "Erling Haaland", "Ole Gunnar Solskjaer", "Joshua King"], answer: "Erling Haaland", category: "Players", difficulty: "easy" },
  { question: "Quel attaquant égyptien est devenu une icône de Liverpool sous Jürgen Klopp ?", choices: ["Mohamed Salah", "Trezeguet", "Mido", "Ahmed Hegazi"], answer: "Mohamed Salah", category: "Players", difficulty: "easy" },
  { question: "Quel attaquant français est connu pour sa vitesse et son triplé en finale de Coupe du monde 2022 ?", choices: ["Kylian Mbappe", "Antoine Griezmann", "Karim Benzema", "Olivier Giroud"], answer: "Kylian Mbappe", category: "Players", difficulty: "medium" },
  { question: "Quel joueur est souvent appelé King Eric par les supporters de Manchester United ?", choices: ["Eric Cantona", "Eric Bailly", "Thierry Henry", "Dennis Bergkamp"], answer: "Eric Cantona", category: "Players", difficulty: "medium" },
  { question: "Quel attaquant sénégalais a gagné de grands titres avec Liverpool avant de rejoindre le Bayern Munich ?", choices: ["Sadio Mane", "Kalidou Koulibaly", "Ismaila Sarr", "Edouard Mendy"], answer: "Sadio Mane", category: "Players", difficulty: "medium" },
  { question: "Quel milieu croate a remporté le Ballon d'Or 2018 ?", choices: ["Luka Modric", "Ivan Rakitic", "Mateo Kovacic", "Mario Mandzukic"], answer: "Luka Modric", category: "Players", difficulty: "hard" }
]

export function getFallbackGoalQuiz(category: GoalQuizCategory, difficulty: GoalQuizDifficulty, count = 5) {
  const exact = fallbackQuestions.filter((question) => question.category === category && question.difficulty === difficulty)
  const categoryPool = fallbackQuestions.filter((question) => question.category === category)
  const fullPool = [...exact, ...categoryPool, ...fallbackQuestions]
  const questions = fullPool.filter((question, index, array) => array.findIndex((item) => item.question === question.question) === index).slice(0, count)

  return sanitizeGoalQuizPack({ questions })
}
