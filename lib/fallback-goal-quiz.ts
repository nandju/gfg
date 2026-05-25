import { GoalQuizCategory, GoalQuizDifficulty, GoalQuizQuestion, sanitizeGoalQuizPack } from "@/lib/schemas/goal-quiz-schema"

const fallbackQuestions: GoalQuizQuestion[] = [
  { question: "Which country won the 2022 FIFA World Cup?", choices: ["France", "Argentina", "Brazil", "Germany"], answer: "Argentina", category: "International Competitions", difficulty: "easy" },
  { question: "Which competition crowns the best national team in Africa?", choices: ["AFCON", "Euro", "Copa America", "Gold Cup"], answer: "AFCON", category: "International Competitions", difficulty: "easy" },
  { question: "Which club competition is considered the top European club tournament?", choices: ["Europa League", "Champions League", "Conference League", "Nations League"], answer: "Champions League", category: "International Competitions", difficulty: "easy" },
  { question: "Which South American national-team tournament features Brazil and Argentina?", choices: ["Euro", "Copa America", "AFCON", "Asian Cup"], answer: "Copa America", category: "International Competitions", difficulty: "medium" },
  { question: "Which individual award is commonly associated with the world's best footballer?", choices: ["Golden Boot", "Ballon d'Or", "Golden Glove", "Puskas Award"], answer: "Ballon d'Or", category: "International Competitions", difficulty: "easy" },
  { question: "Which tournament is contested by European national teams every four years?", choices: ["Euro", "AFCON", "Copa America", "Club World Cup"], answer: "Euro", category: "International Competitions", difficulty: "easy" },
  { question: "Which country has won the FIFA World Cup five times?", choices: ["Germany", "Italy", "Brazil", "Argentina"], answer: "Brazil", category: "International Competitions", difficulty: "medium" },
  { question: "Which final did France win 4-2 against Croatia?", choices: ["World Cup 2018", "Euro 2016", "World Cup 2006", "Euro 2020"], answer: "World Cup 2018", category: "International Competitions", difficulty: "medium" },
  { question: "Which club plays home matches at the Santiago Bernabeu?", choices: ["Barcelona", "Real Madrid", "Atletico Madrid", "Sevilla"], answer: "Real Madrid", category: "Teams", difficulty: "easy" },
  { question: "Which English club is nicknamed The Red Devils?", choices: ["Liverpool", "Manchester United", "Arsenal", "Chelsea"], answer: "Manchester United", category: "Teams", difficulty: "easy" },
  { question: "Which Italian club is famous for black and blue stripes and the San Siro?", choices: ["Inter Milan", "Juventus", "Roma", "Napoli"], answer: "Inter Milan", category: "Teams", difficulty: "medium" },
  { question: "Which German club is most associated with the Allianz Arena?", choices: ["Borussia Dortmund", "Bayern Munich", "RB Leipzig", "Bayer Leverkusen"], answer: "Bayern Munich", category: "Teams", difficulty: "easy" },
  { question: "Which French club is strongly associated with Parc des Princes?", choices: ["Marseille", "Lyon", "Paris Saint-Germain", "Monaco"], answer: "Paris Saint-Germain", category: "Teams", difficulty: "easy" },
  { question: "Which club is known globally for La Masia academy?", choices: ["Barcelona", "Chelsea", "AC Milan", "Benfica"], answer: "Barcelona", category: "Teams", difficulty: "medium" },
  { question: "Which national team is nicknamed La Albiceleste?", choices: ["Uruguay", "Argentina", "Italy", "Spain"], answer: "Argentina", category: "Teams", difficulty: "medium" },
  { question: "Which club won the 2004 UEFA Champions League under Jose Mourinho?", choices: ["Porto", "Chelsea", "Inter Milan", "Real Madrid"], answer: "Porto", category: "Teams", difficulty: "hard" },
  { question: "Which player is strongly associated with the number 7 and Portugal?", choices: ["Cristiano Ronaldo", "Luis Figo", "Eusebio", "Bruno Fernandes"], answer: "Cristiano Ronaldo", category: "Players", difficulty: "easy" },
  { question: "Which player won multiple Ballon d'Or awards while starring for Barcelona?", choices: ["Lionel Messi", "Neymar", "Xavi", "Andres Iniesta"], answer: "Lionel Messi", category: "Players", difficulty: "easy" },
  { question: "Which Norwegian striker became famous for explosive scoring at Borussia Dortmund and Manchester City?", choices: ["Martin Odegaard", "Erling Haaland", "Ole Gunnar Solskjaer", "Joshua King"], answer: "Erling Haaland", category: "Players", difficulty: "easy" },
  { question: "Which Egyptian forward became a Liverpool icon under Jurgen Klopp?", choices: ["Mohamed Salah", "Trezeguet", "Mido", "Ahmed Hegazi"], answer: "Mohamed Salah", category: "Players", difficulty: "easy" },
  { question: "Which French forward is known for explosive pace and a World Cup final hat-trick in 2022?", choices: ["Kylian Mbappe", "Antoine Griezmann", "Karim Benzema", "Olivier Giroud"], answer: "Kylian Mbappe", category: "Players", difficulty: "medium" },
  { question: "Which player is often called King Eric by Manchester United fans?", choices: ["Eric Cantona", "Eric Bailly", "Thierry Henry", "Dennis Bergkamp"], answer: "Eric Cantona", category: "Players", difficulty: "medium" },
  { question: "Which Senegalese forward won major trophies with Liverpool before joining Bayern Munich?", choices: ["Sadio Mane", "Kalidou Koulibaly", "Ismaila Sarr", "Edouard Mendy"], answer: "Sadio Mane", category: "Players", difficulty: "medium" },
  { question: "Which Croatian midfielder won the 2018 Ballon d'Or?", choices: ["Luka Modric", "Ivan Rakitic", "Mateo Kovacic", "Mario Mandzukic"], answer: "Luka Modric", category: "Players", difficulty: "hard" }
]

export function getFallbackGoalQuiz(category: GoalQuizCategory, difficulty: GoalQuizDifficulty, count = 5) {
  const exact = fallbackQuestions.filter((question) => question.category === category && question.difficulty === difficulty)
  const categoryPool = fallbackQuestions.filter((question) => question.category === category)
  const fullPool = [...exact, ...categoryPool, ...fallbackQuestions]
  const questions = fullPool.filter((question, index, array) => array.findIndex((item) => item.question === question.question) === index).slice(0, count)

  return sanitizeGoalQuizPack({ questions })
}
