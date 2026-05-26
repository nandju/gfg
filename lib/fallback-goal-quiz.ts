import { GoalQuizCategory, GoalQuizDifficulty, GoalQuizQuestion, sanitizeGoalQuizPack } from "@/lib/schemas/goal-quiz-schema"

const fallbackQuestions: GoalQuizQuestion[] = [
  // International Competitions - easy
  { question: "Quel pays a remporté la Coupe du monde 2022 ?", choices: ["France", "Argentine", "Brésil", "Allemagne"], answer: "Argentine", category: "International Competitions", difficulty: "easy" },
  { question: "Quelle compétition couronne la meilleure sélection nationale d'Afrique ?", choices: ["CAN", "Euro", "Copa America", "Gold Cup"], answer: "CAN", category: "International Competitions", difficulty: "easy" },
  { question: "Quelle compétition de clubs est considérée comme le plus grand tournoi européen ?", choices: ["Europa League", "Ligue des Champions", "Conference League", "Nations League"], answer: "Ligue des Champions", category: "International Competitions", difficulty: "easy" },
  { question: "Quel trophée individuel récompense souvent le meilleur footballeur du monde ?", choices: ["Soulier d'Or", "Ballon d'Or", "Gant d'Or", "Prix Puskas"], answer: "Ballon d'Or", category: "International Competitions", difficulty: "easy" },
  { question: "Quel tournoi réunit les sélections européennes tous les quatre ans ?", choices: ["Euro", "CAN", "Copa America", "Coupe du monde des clubs"], answer: "Euro", category: "International Competitions", difficulty: "easy" },
  { question: "Quelle nation a remporté la Coupe du monde 2010 ?", choices: ["Pays-Bas", "Espagne", "Allemagne", "Brésil"], answer: "Espagne", category: "International Competitions", difficulty: "easy" },
  { question: "Quelle compétition oppose les meilleures sélections du monde tous les quatre ans ?", choices: ["Euro", "CAN", "Copa America", "Coupe du monde"], answer: "Coupe du monde", category: "International Competitions", difficulty: "easy" },
  { question: "Quel pays a organisé la Coupe du monde 2014 ?", choices: ["Afrique du Sud", "Brésil", "Russie", "Qatar"], answer: "Brésil", category: "International Competitions", difficulty: "easy" },
  // International Competitions - medium
  { question: "Quel tournoi sud-américain oppose notamment le Brésil et l'Argentine ?", choices: ["Euro", "Copa America", "CAN", "Coupe d'Asie"], answer: "Copa America", category: "International Competitions", difficulty: "medium" },
  { question: "Quel pays a remporté cinq Coupes du monde FIFA ?", choices: ["Allemagne", "Italie", "Brésil", "Argentine"], answer: "Brésil", category: "International Competitions", difficulty: "medium" },
  { question: "Quelle finale la France a-t-elle remportée 4-2 contre la Croatie ?", choices: ["Coupe du monde 2018", "Euro 2016", "Coupe du monde 2006", "Euro 2020"], answer: "Coupe du monde 2018", category: "International Competitions", difficulty: "medium" },
  { question: "Quel pays a remporté l'Euro 2024 ?", choices: ["France", "Angleterre", "Espagne", "Allemagne"], answer: "Espagne", category: "International Competitions", difficulty: "medium" },
  { question: "Quelle sélection a remporté la Copa America 2021 ?", choices: ["Brésil", "Argentine", "Colombie", "Chili"], answer: "Argentine", category: "International Competitions", difficulty: "medium" },
  { question: "Quel pays a remporté le plus de Ligues des Champions ?", choices: ["Angleterre", "Espagne", "Italie", "Allemagne"], answer: "Espagne", category: "International Competitions", difficulty: "medium" },
  { question: "Quel tournoi est surnommé la Coupe du monde des clubs ?", choices: ["FIFA Club World Cup", "Champions League", "Europa League", "Supercoupe de l'UEFA"], answer: "FIFA Club World Cup", category: "International Competitions", difficulty: "medium" },
  // International Competitions - hard
  { question: "Quel joueur a remporté la Coupe du monde, l'Euro et la Ligue des Champions en carrière ?", choices: ["Lionel Messi", "Cristiano Ronaldo", "Zinedine Zidane", "Franz Beckenbauer"], answer: "Franz Beckenbauer", category: "International Competitions", difficulty: "hard" },
  { question: "Quelle nation a remporté la CAN la plus souvent ?", choices: ["Nigeria", "Cameroun", "Égypte", "Ghana"], answer: "Égypte", category: "International Competitions", difficulty: "hard" },
  { question: "Quel pays a terminé troisième de la Coupe du monde 2022 ?", choices: ["Angleterre", "Croatie", "Portugal", "Maroc"], answer: "Croatie", category: "International Competitions", difficulty: "hard" },
  { question: "Quel joueur détient le record de buts en Coupe du monde ?", choices: ["Pelé", "Miroslav Klose", "Ronaldo Nazário", "Just Fontaine"], answer: "Miroslav Klose", category: "International Competitions", difficulty: "hard" },
  // Teams - easy
  { question: "Quel club joue ses matchs à domicile au Santiago Bernabeu ?", choices: ["Barcelone", "Real Madrid", "Atletico Madrid", "Séville"], answer: "Real Madrid", category: "Teams", difficulty: "easy" },
  { question: "Quel club anglais est surnommé les Red Devils ?", choices: ["Liverpool", "Manchester United", "Arsenal", "Chelsea"], answer: "Manchester United", category: "Teams", difficulty: "easy" },
  { question: "Quel club allemand est le plus associé à l'Allianz Arena ?", choices: ["Borussia Dortmund", "Bayern Munich", "RB Leipzig", "Bayer Leverkusen"], answer: "Bayern Munich", category: "Teams", difficulty: "easy" },
  { question: "Quel club français est fortement associé au Parc des Princes ?", choices: ["Marseille", "Lyon", "Paris Saint-Germain", "Monaco"], answer: "Paris Saint-Germain", category: "Teams", difficulty: "easy" },
  { question: "Quel club italien est célèbre pour ses couleurs rouge et noir ?", choices: ["Juventus", "AS Roma", "AC Milan", "Inter Milan"], answer: "AC Milan", category: "Teams", difficulty: "easy" },
  { question: "Quel club anglais joue à Anfield ?", choices: ["Manchester United", "Arsenal", "Liverpool", "Chelsea"], answer: "Liverpool", category: "Teams", difficulty: "easy" },
  { question: "Quel club espagnol est surnommé les Blaugrana ?", choices: ["Real Madrid", "Valence", "Barcelone", "Séville"], answer: "Barcelone", category: "Teams", difficulty: "easy" },
  { question: "Quel club londonien est représenté par un lion rampant bleu ?", choices: ["Arsenal", "Tottenham", "Chelsea", "West Ham"], answer: "Chelsea", category: "Teams", difficulty: "easy" },
  // Teams - medium
  { question: "Quel club italien est célèbre pour ses rayures noires et bleues au San Siro ?", choices: ["Inter Milan", "Juventus", "Roma", "Napoli"], answer: "Inter Milan", category: "Teams", difficulty: "medium" },
  { question: "Quel club est mondialement connu pour son centre de formation La Masia ?", choices: ["Barcelone", "Chelsea", "AC Milan", "Benfica"], answer: "Barcelone", category: "Teams", difficulty: "medium" },
  { question: "Quelle sélection nationale est surnommée l'Albiceleste ?", choices: ["Uruguay", "Argentine", "Italie", "Espagne"], answer: "Argentine", category: "Teams", difficulty: "medium" },
  { question: "Quel club portugais est célèbre pour sa formation et ses ventes de joueurs ?", choices: ["Porto", "Benfica", "Sporting CP", "Braga"], answer: "Benfica", category: "Teams", difficulty: "medium" },
  { question: "Quel club néerlandais est célèbre pour son style de jeu offensif et sa formation ?", choices: ["PSV", "Feyenoord", "Ajax", "AZ Alkmaar"], answer: "Ajax", category: "Teams", difficulty: "medium" },
  { question: "Quel club turc est réputé pour son ambiance infernale à domicile ?", choices: ["Fenerbahçe", "Besiktas", "Galatasaray", "Trabzonspor"], answer: "Galatasaray", category: "Teams", difficulty: "medium" },
  { question: "Quel club argentin a formé Lionel Messi ?", choices: ["River Plate", "Boca Juniors", "Newell's Old Boys", "Rosario Central"], answer: "Newell's Old Boys", category: "Teams", difficulty: "medium" },
  // Teams - hard
  { question: "Quel club a remporté la Ligue des Champions 2004 avec José Mourinho ?", choices: ["Porto", "Chelsea", "Inter Milan", "Real Madrid"], answer: "Porto", category: "Teams", difficulty: "hard" },
  { question: "Quel club français a remporté la Coupe des Coupes en 1996 ?", choices: ["Paris Saint-Germain", "Marseille", "Auxerre", "Nantes"], answer: "Paris Saint-Germain", category: "Teams", difficulty: "hard" },
  { question: "Quel club anglais a remporté le plus de titres de Premier League ?", choices: ["Liverpool", "Manchester United", "Manchester City", "Arsenal"], answer: "Manchester United", category: "Teams", difficulty: "hard" },
  { question: "Quel club italien a remporté le plus de Scudettos ?", choices: ["AC Milan", "Inter Milan", "Juventus", "AS Roma"], answer: "Juventus", category: "Teams", difficulty: "hard" },
  { question: "Quel club écossais est célèbre pour le Old Firm Derby ?", choices: ["Hibernian", "Celtic", "Rangers", "Aberdeen"], answer: "Celtic", category: "Teams", difficulty: "hard" },
  { question: "Quel club a remporté la Ligue des Champions 1997 ?", choices: ["Juventus", "Borussia Dortmund", "Real Madrid", "Ajax"], answer: "Borussia Dortmund", category: "Teams", difficulty: "hard" },
  // Players - easy
  { question: "Quel joueur est fortement associé au numéro 7 et au Portugal ?", choices: ["Cristiano Ronaldo", "Luis Figo", "Eusebio", "Bruno Fernandes"], answer: "Cristiano Ronaldo", category: "Players", difficulty: "easy" },
  { question: "Quel joueur a remporté plusieurs Ballons d'Or avec Barcelone ?", choices: ["Lionel Messi", "Neymar", "Xavi", "Andres Iniesta"], answer: "Lionel Messi", category: "Players", difficulty: "easy" },
  { question: "Quel attaquant norvégien est devenu célèbre pour ses buts à Dortmund et Manchester City ?", choices: ["Martin Odegaard", "Erling Haaland", "Ole Gunnar Solskjaer", "Joshua King"], answer: "Erling Haaland", category: "Players", difficulty: "easy" },
  { question: "Quel attaquant égyptien est devenu une icône de Liverpool sous Jürgen Klopp ?", choices: ["Mohamed Salah", "Trezeguet", "Mido", "Ahmed Hegazi"], answer: "Mohamed Salah", category: "Players", difficulty: "easy" },
  { question: "Quel joueur français a remporté le Ballon d'Or 1998 ?", choices: ["Zinedine Zidane", "Thierry Henry", "Didier Deschamps", "Marcel Desailly"], answer: "Zinedine Zidane", category: "Players", difficulty: "easy" },
  { question: "Quel gardien espagnol a longtemps été numéro un à Manchester United ?", choices: ["Iker Casillas", "David de Gea", "Pepe Reina", "Victor Valdés"], answer: "David de Gea", category: "Players", difficulty: "easy" },
  { question: "Quel joueur brésilien est célèbre pour ses dribbles et son sourire ?", choices: ["Ronaldo Nazário", "Ronaldinho", "Neymar", "Kaká"], answer: "Ronaldinho", category: "Players", difficulty: "easy" },
  { question: "Quel défenseur français a été capitaine des Bleus champion du monde 2018 ?", choices: ["Raphaël Varane", "Hugo Lloris", "Samuel Umtiti", "Lucas Hernandez"], answer: "Hugo Lloris", category: "Players", difficulty: "easy" },
  // Players - medium
  { question: "Quel attaquant français est connu pour sa vitesse et son triplé en finale de Coupe du monde 2022 ?", choices: ["Kylian Mbappe", "Antoine Griezmann", "Karim Benzema", "Olivier Giroud"], answer: "Kylian Mbappe", category: "Players", difficulty: "medium" },
  { question: "Quel joueur est souvent appelé King Eric par les supporters de Manchester United ?", choices: ["Eric Cantona", "Eric Bailly", "Thierry Henry", "Dennis Bergkamp"], answer: "Eric Cantona", category: "Players", difficulty: "medium" },
  { question: "Quel attaquant sénégalais a gagné de grands titres avec Liverpool avant de rejoindre le Bayern Munich ?", choices: ["Sadio Mane", "Kalidou Koulibaly", "Ismaila Sarr", "Edouard Mendy"], answer: "Sadio Mane", category: "Players", difficulty: "medium" },
  { question: "Quel milieu espagnol est célèbre pour son contrôle et sa passe en profondeur à Barcelone ?", choices: ["Xavi", "Iniesta", "Sergio Busquets", "Cesc Fabregas"], answer: "Xavi", category: "Players", difficulty: "medium" },
  { question: "Quel défenseur néerlandais a remporté le Ballon d'Or en 1988 ?", choices: ["Ruud Gullit", "Marco van Basten", "Frank Rijkaard", "Ronald Koeman"], answer: "Marco van Basten", category: "Players", difficulty: "medium" },
  { question: "Quel attaquant colombien est célèbre pour son célébration de la danse ?", choices: ["Falcao", "James Rodriguez", "Juan Cuadrado", "Radamel Falcao"], answer: "James Rodriguez", category: "Players", difficulty: "medium" },
  { question: "Quel gardien italien a remporté la Coupe du monde 2006 ?", choices: ["Gianluigi Buffon", "Francesco Totti", "Fabio Cannavaro", "Andrea Pirlo"], answer: "Gianluigi Buffon", category: "Players", difficulty: "medium" },
  // Players - hard
  { question: "Quel milieu croate a remporté le Ballon d'Or 2018 ?", choices: ["Luka Modric", "Ivan Rakitic", "Mateo Kovacic", "Mario Mandzukic"], answer: "Luka Modric", category: "Players", difficulty: "hard" },
  { question: "Quel joueur français a été meilleur buteur de la Coupe du monde 1986 avec 6 buts ?", choices: ["Michel Platini", "Thierry Henry", "Just Fontaine", "Jean-Pierre Papin"], answer: "Michel Platini", category: "Players", difficulty: "hard" },
  { question: "Quel attaquant brésilien a remporté trois Coupes du monde ?", choices: ["Ronaldo Nazário", "Romário", "Pelé", "Garrincha"], answer: "Pelé", category: "Players", difficulty: "hard" },
  { question: "Quel joueur argentin a remporté le plus de Ballons d'Or ?", choices: ["Diego Maradona", "Lionel Messi", "Alfredo Di Stéfano", "Omar Sívori"], answer: "Lionel Messi", category: "Players", difficulty: "hard" },
  { question: "Quel défenseur allemand a remporté le Ballon d'Or 1972 et 1976 ?", choices: ["Franz Beckenbauer", "Gerd Müller", "Uwe Seeler", "Lothar Matthäus"], answer: "Franz Beckenbauer", category: "Players", difficulty: "hard" },
  { question: "Quel joueur portugais a été finaliste du Ballon d'Or 1965 ?", choices: ["Eusebio", "Cristiano Ronaldo", "Luis Figo", "Paulo Futre"], answer: "Eusebio", category: "Players", difficulty: "hard" }
]

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getFallbackGoalQuiz(category: GoalQuizCategory, difficulty: GoalQuizDifficulty, count = 5) {
  const exact = fallbackQuestions.filter((q) => q.category === category && q.difficulty === difficulty)
  const categoryMatch = fallbackQuestions.filter((q) => q.category === category && q.difficulty !== difficulty)
  const exactShuffled = shuffle(exact)
  const categoryShuffled = shuffle(categoryMatch)
  const remaining = shuffle(fallbackQuestions.filter((q) => q.category !== category))

  const picked = [...exactShuffled, ...categoryShuffled, ...remaining].slice(0, count)

  return sanitizeGoalQuizPack({ questions: picked })
}
