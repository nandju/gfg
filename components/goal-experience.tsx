"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, BarChart3, Bot, Check, CircleHelp, Dumbbell, History, KeyRound, Lock, LogIn, Medal, Play, Plus, RefreshCw, ScanLine, Shield, Timer, Trophy, Users, Volleyball } from "lucide-react"

type Screen = "loader" | "menu" | "lobby" | "create" | "join" | "teams" | "games" | "quiz-select" | "quiz-loading" | "quiz-question" | "quiz-reveal" | "quiz-ranking" | "mime" | "keyword" | "rotation" | "team-score" | "history" | "results" | "victory" | "simulation"
type QuizCategory = "Teams" | "Players" | "International Competitions"
type Difficulty = "easy" | "medium" | "hard"
type PartyMode = "mime" | "keyword"

type QuizQuestion = {
  question: string
  choices: string[]
  answer: string
  category: QuizCategory
  difficulty: Difficulty
}

type Team = {
  id: string
  name: string
  color: string
  players: string[]
  score: number
}

const fallbackQuestions: QuizQuestion[] = [
  { question: "Quel pays a remporté la Coupe du monde 2022 ?", choices: ["France", "Argentine", "Brésil", "Allemagne"], answer: "Argentine", category: "International Competitions", difficulty: "easy" },
  { question: "Quel club est surnommé les Red Devils ?", choices: ["Liverpool", "Arsenal", "Manchester United", "AC Milan"], answer: "Manchester United", category: "Teams", difficulty: "easy" },
  { question: "Quel joueur a remporté plusieurs Ballons d'Or avec Barcelone ?", choices: ["Lionel Messi", "Neymar", "Xavi", "Iniesta"], answer: "Lionel Messi", category: "Players", difficulty: "easy" },
  { question: "Quelle compétition est souvent appelée CAN ?", choices: ["Coupe d'Asie", "Coupe d'Afrique des Nations", "Copa America", "Euro"], answer: "Coupe d'Afrique des Nations", category: "International Competitions", difficulty: "easy" },
  { question: "Quel tournoi désigne le champion d'Europe des clubs ?", choices: ["Europa League", "Ligue des Champions", "Euro", "Nations League"], answer: "Ligue des Champions", category: "International Competitions", difficulty: "easy" },
  { question: "Quel joueur est fortement associé au numéro 7 et au Portugal ?", choices: ["Cristiano Ronaldo", "Luis Figo", "Eusebio", "Bruno Fernandes"], answer: "Cristiano Ronaldo", category: "Players", difficulty: "easy" },
  { question: "Quelle sélection est surnommée l'Albiceleste ?", choices: ["Uruguay", "Argentine", "Italie", "Espagne"], answer: "Argentine", category: "Teams", difficulty: "medium" },
  { question: "Quelle compétition réunit les sélections de la CONMEBOL ?", choices: ["Copa America", "Euro", "CAN", "Gold Cup"], answer: "Copa America", category: "International Competitions", difficulty: "medium" },
  { question: "Quel club joue au Santiago Bernabeu ?", choices: ["Barcelone", "Atletico Madrid", "Real Madrid", "Séville"], answer: "Real Madrid", category: "Teams", difficulty: "easy" },
  { question: "Qui est connu comme King Eric dans la culture du football anglais ?", choices: ["Eric Cantona", "Eric Bailly", "Thierry Henry", "Dennis Bergkamp"], answer: "Eric Cantona", category: "Players", difficulty: "medium" }
]

const initialTeams: Team[] = [
  { id: "blue", name: "Blue Stars", color: "from-sky-500 to-blue-700", players: ["NOVA", "MILO"], score: 0 },
  { id: "gold", name: "Golden XI", color: "from-yellow-300 to-orange-500", players: ["LINA", "KAI"], score: 0 }
]

const mimePlayers = ["Kylian Mbappe", "Cristiano Ronaldo", "Lionel Messi", "Erling Haaland", "Neymar", "Sadio Mane", "Mohamed Salah", "Zinedine Zidane"]
const keywordCards = [
  { clue: "7", answer: "Cristiano Ronaldo" },
  { clue: "Barcelone", answer: "Lionel Messi" },
  { clue: "Roi", answer: "Eric Cantona" },
  { clue: "Norvège", answer: "Erling Haaland" },
  { clue: "Égypte", answer: "Mohamed Salah" },
  { clue: "Paris", answer: "Kylian Mbappe" }
]
const matchHistory = ["Blue Stars a gagné la manche de quiz 1 grâce à une réponse tardive.", "Golden XI a dominé le mode Mime avec deux réponses parfaites.", "Un indice mot-clé a changé le rythme du match.", "Les scores sont restés cachés jusqu'à la révélation de la cinquième question."]

function generateCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  return `GL-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(100 + Math.random() * 900)}`
}

async function requestQuizPack(category: QuizCategory, difficulty: Difficulty): Promise<{ questions: QuizQuestion[]; source: "ai" | "fallback" }> {
  const response = await fetch("/api/goal-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, difficulty, count: 5 })
  })

  if (!response.ok) throw new Error("La génération du quiz a échoué")

  const data = await response.json()
  if (!Array.isArray(data.questions) || data.questions.length < 5) throw new Error("Réponse de quiz invalide")

  return {
    questions: data.questions,
    source: data.source === "ai" ? "ai" : "fallback"
  }
}

function QrPattern({ code }: { code: string }) {
  const cells = useMemo(() => Array.from({ length: 81 }, (_, index) => (code.charCodeAt(index % code.length) + index * 11) % 3 !== 0), [code])
  return <div className="grid h-48 w-48 grid-cols-9 gap-1 rounded-[2rem] bg-white p-4 shadow-2xl shadow-emerald-950/40 md:h-56 md:w-56">{cells.map((active, index) => <div key={index} className={`rounded-sm ${active ? "bg-slate-950" : "bg-white"}`} />)}</div>
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[2rem] border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}>{children}</section>
}

function Shell({ children, screen, setScreen }: { children: React.ReactNode; screen: Screen; setScreen: (screen: Screen) => void }) {
  return <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white"><div className="fixed inset-0"><Image src="/goal!!!/mobile3.png" alt="" fill priority className="object-cover md:hidden" /><Image src="/goal!!!/desktop.png" alt="" fill priority className="hidden object-cover md:block" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,.35),transparent_30%),linear-gradient(180deg,rgba(2,6,23,.5),rgba(2,6,23,.96))]" /><div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px]" /></div><header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:px-8"><button onClick={() => setScreen(screen === "menu" ? "menu" : "games")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-black backdrop-blur-xl"><ArrowLeft className="h-4 w-4" /> GOAL</button><div className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-100">Match local</div></header><div className="relative z-10 min-h-screen px-4 pb-28 pt-24 md:px-8">{children}</div></main>
}

function Title({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mx-auto mb-8 max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-7xl">{title}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{text}</p></div>
}

export function GoalExperience() {
  const [screen, setScreen] = useState<Screen>("loader")
  const [progress, setProgress] = useState(0)
  const [code, setCode] = useState(generateCode)
  const [joinCode, setJoinCode] = useState("")
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [category, setCategory] = useState<QuizCategory>("International Competitions")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [questions, setQuestions] = useState<QuizQuestion[]>(fallbackQuestions.slice(0, 5))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [aiError, setAiError] = useState<string | null>(null)
  const [quizSource, setQuizSource] = useState<"ai" | "fallback">("fallback")
  const [turn, setTurn] = useState(0)
  const [partyMode, setPartyMode] = useState<PartyMode>("mime")
  const [mimeTarget, setMimeTarget] = useState(mimePlayers[0])
  const [keywordIndex, setKeywordIndex] = useState(0)

  useEffect(() => {
    if (screen !== "loader") return
    const interval = window.setInterval(() => setProgress((current) => {
      const next = Math.min(current + 8, 100)
      if (next === 100) window.setTimeout(() => setScreen("menu"), 250)
      return next
    }), 90)
    return () => window.clearInterval(interval)
  }, [screen])

  const award = (teamId = teams[turn]?.id, amount = 3) => setTeams((current) => current.map((team) => team.id === teamId ? { ...team, score: team.score + amount } : team))
  const nextTurn = () => setTurn((current) => (current + 1) % teams.length)
  const loadQuiz = async () => {
    setScreen("quiz-loading")
    setAiError(null)
    try {
      const generated = await requestQuizPack(category, difficulty)
      setQuestions(generated.questions)
      setQuizSource(generated.source)
      if (generated.source === "fallback") setAiError("Quiz local de secours chargé. Le match continue sans interruption.")
      setQuestionIndex(0)
      setSelectedAnswer("")
      setScreen("quiz-question")
    } catch {
      setAiError("La génération IA a échoué. Questions de secours validées chargées.")
      setQuestions(fallbackQuestions.slice(0, 5))
      setQuizSource("fallback")
      setQuestionIndex(0)
      setScreen("quiz-question")
    }
  }

  if (screen === "loader") return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.28),transparent_45%)]" /><div className="relative z-10 w-full max-w-sm text-center"><div className="relative mx-auto mb-7 h-28 w-28 overflow-hidden rounded-[2rem] border border-emerald-300/60 shadow-2xl shadow-emerald-950/60"><Image src="/goal!!!/cover.png" alt="GOAL!!!" fill priority className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.45em] text-emerald-300">Coup d'envoi en chargement</p><h1 className="mt-3 text-6xl font-black">GOAL!!!</h1><div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-300 to-white transition-all duration-200" style={{ width: `${progress}%` }} /></div><p className="mt-4 text-sm text-slate-400">Les projecteurs du stade s'allument... {progress}%</p></div></main>

  return <Shell screen={screen} setScreen={setScreen}>
    {screen === "menu" && <Menu setScreen={setScreen} />}
    {screen === "lobby" && <Lobby setScreen={setScreen} />}
    {screen === "create" && <CreateRoom code={code} setCode={setCode} setScreen={setScreen} />}
    {screen === "join" && <JoinRoom joinCode={joinCode} setJoinCode={setJoinCode} setScreen={setScreen} />}
    {screen === "teams" && <Teams teams={teams} setScreen={setScreen} />}
    {screen === "games" && <GameSelection setScreen={setScreen} />}
    {screen === "quiz-select" && <QuizSelect category={category} setCategory={setCategory} difficulty={difficulty} setDifficulty={setDifficulty} loadQuiz={loadQuiz} />}
    {screen === "quiz-loading" && <QuizLoading category={category} />}
    {screen === "quiz-question" && <QuizQuestionScreen question={questions[questionIndex]} selected={selectedAnswer} setSelected={setSelectedAnswer} setScreen={setScreen} aiError={aiError} quizSource={quizSource} />}
    {screen === "quiz-reveal" && <QuizReveal question={questions[questionIndex]} selected={selectedAnswer} award={award} questionIndex={questionIndex} setQuestionIndex={setQuestionIndex} setSelectedAnswer={setSelectedAnswer} setScreen={setScreen} />}
    {screen === "quiz-ranking" && <Ranking teams={teams} setScreen={setScreen} />}
    {screen === "mime" && <MimeMode teams={teams} turn={turn} target={mimeTarget} setTarget={setMimeTarget} award={award} nextTurn={nextTurn} setScreen={setScreen} />}
    {screen === "keyword" && <KeywordMode teams={teams} turn={turn} card={keywordCards[keywordIndex]} nextCard={() => setKeywordIndex((current) => (current + 1) % keywordCards.length)} award={award} nextTurn={nextTurn} setScreen={setScreen} />}
    {screen === "rotation" && <Rotation teams={teams} turn={turn} mode={partyMode} setMode={setPartyMode} setScreen={setScreen} />}
    {screen === "team-score" && <TeamScore teams={teams} setScreen={setScreen} />}
    {screen === "history" && <HistoryScreen />}
    {screen === "results" && <Results teams={teams} setScreen={setScreen} />}
    {screen === "victory" && <Victory teams={teams} />}
    {screen === "simulation" && <SimulationLocked />}
    <nav className="fixed bottom-4 left-4 right-4 z-30 mx-auto grid max-w-3xl grid-cols-6 gap-2 rounded-[1.5rem] border border-white/10 bg-black/70 p-2 backdrop-blur-xl">{[{ s: "games", i: Play }, { s: "quiz-select", i: CircleHelp }, { s: "rotation", i: Volleyball }, { s: "team-score", i: BarChart3 }, { s: "history", i: History }, { s: "results", i: Trophy }].map(({ s, i: Icon }) => <button key={s} onClick={() => setScreen(s as Screen)} className="flex items-center justify-center rounded-2xl py-3 text-slate-300 transition hover:bg-white/10 hover:text-white"><Icon className="h-5 w-5" /></button>)}</nav>
  </Shell>
}

function Menu({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="w-full max-w-3xl p-6 text-center md:p-10"><div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-[2rem] border border-emerald-300/60 md:h-36 md:w-36"><Image src="/goal!!!/cover.png" alt="GOAL!!!" fill className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-300">Soirée football locale</p><h1 className="mt-3 text-6xl font-black md:text-8xl">GOAL!!!</h1><p className="mx-auto mt-5 max-w-xl text-slate-300">Des mini-jeux de football rapides pour des joueurs dans la même pièce. Les téléphones gèrent les scores, les minuteurs, les équipes et les révélations.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><button onClick={() => setScreen("lobby")} className="rounded-2xl bg-emerald-300 px-8 py-5 text-lg font-black text-slate-950 transition hover:scale-[1.02]">Coup d'envoi</button><Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-lg font-black transition hover:bg-white/15">Quitter</Link></div></Panel></div>
}

function Lobby({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div><Title eyebrow="Salon local" title="Téléphones prêts. Joueurs proches." text="Créez une partie, rejoignez avec un code, puis formez les équipes avant de choisir un mini-jeu de football." /><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{[{ icon: Plus, title: "Créer le match", text: "Générez un code de salon local et un QR.", target: "create" as Screen }, { icon: LogIn, title: "Rejoindre l'équipe", text: "Rejoignez depuis votre téléphone dans la même pièce.", target: "join" as Screen }, { icon: Users, title: "Créer les équipes", text: "Préparez les noms d'équipe et l'ordre des joueurs.", target: "teams" as Screen }].map((item) => <button key={item.title} onClick={() => setScreen(item.target)} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/50"><item.icon className="mb-5 h-10 w-10 text-emerald-300" /><h2 className="text-2xl font-black">{item.title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p></button>)}</div></div>
}

function CreateRoom({ code, setCode, setScreen }: { code: string; setCode: (code: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Créer le match" title="Invitez l'équipe" text="Ceci est un salon local simulé. Tout le monde est physiquement ensemble et utilise son téléphone." /><Panel className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-10"><div className="mx-auto"><QrPattern code={code} /></div><div><p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Code du salon</p><div className="mt-4 inline-flex rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-4xl font-black tracking-[0.2em] md:text-6xl">{code}</div><p className="mt-5 text-slate-300">Scannez, rejoignez, choisissez les équipes et lancez une partie de football rapide.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={() => setCode(generateCode())} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-4 font-black"><RefreshCw className="h-5 w-5" /> Nouveau code</button><button onClick={() => setScreen("teams")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950"><Check className="h-5 w-5" /> Équipes prêtes</button></div></div></Panel></div>
}

function JoinRoom({ joinCode, setJoinCode, setScreen }: { joinCode: string; setJoinCode: (value: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-3xl"><Title eyebrow="Rejoindre" title="Entrez dans le stade" text="Scannez le QR code ou saisissez le code du salon donné par l'organisateur." /><Panel className="grid gap-4 p-6 md:grid-cols-2 md:p-8"><button onClick={() => setScreen("teams")} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 transition hover:bg-white/15"><ScanLine className="mx-auto mb-4 h-12 w-12 text-emerald-300" /><span className="text-xl font-black">Scanner le QR</span></button><div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="GL-000" className="mb-4 w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.2em] outline-none focus:border-emerald-300" /><button disabled={!joinCode.trim()} onClick={() => setScreen("teams")} className="w-full rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950 disabled:opacity-40">Rejoindre</button></div></Panel></div>
}

function Teams({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Équipes" title="Créez le vestiaire" text="Les équipes sont des groupes locaux simulés. Les joueurs se passent les rôles du téléphone pendant les mini-jeux." /><div className="grid gap-4 md:grid-cols-2">{teams.map((team) => <Panel key={team.id} className="overflow-hidden p-6"><div className={`mb-5 h-2 rounded-full bg-gradient-to-r ${team.color}`} /><h2 className="text-3xl font-black">{team.name}</h2><div className="mt-5 grid gap-2">{team.players.map((player) => <div key={player} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold">{player}</div>)}</div></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Choisir un mini-jeu</button></div>
}

function GameSelection({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Sélection du jeu" title="Choisissez le défi football" text="Des mini-jeux rapides, sociaux et compétitifs. La simulation tactique est seulement en aperçu pour l'instant." /><div className="grid gap-4 md:grid-cols-3"><button onClick={() => setScreen("quiz-select")} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-300"><CircleHelp className="mb-5 h-12 w-12 text-emerald-300" /><h2 className="text-3xl font-black">Quiz Football</h2><p className="mt-3 text-slate-400">Réponses individuelles, scores cachés, révélation toutes les cinq questions.</p></button><button onClick={() => setScreen("rotation")} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-300"><Volleyball className="mb-5 h-12 w-12 text-emerald-300" /><h2 className="text-3xl font-black">Mime & Mot-clé</h2><p className="mt-3 text-slate-400">Tours par équipe, réponses rapides, stars du football et indices.</p></button><button onClick={() => setScreen("simulation")} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left transition hover:-translate-y-1 hover:border-yellow-300"><Lock className="mb-5 h-12 w-12 text-yellow-300" /><h2 className="text-3xl font-black">Simulation de match</h2><p className="mt-3 text-slate-400">Aperçu tactique verrouillé avec passes, blocs, tirs et formations.</p></button></div></div>
}

function QuizSelect({ category, setCategory, difficulty, setDifficulty, loadQuiz }: { category: QuizCategory; setCategory: (category: QuizCategory) => void; difficulty: Difficulty; setDifficulty: (difficulty: Difficulty) => void; loadQuiz: () => void }) {
  const categories: QuizCategory[] = ["Teams", "Players", "International Competitions"]
  const difficulties: Difficulty[] = ["easy", "medium", "hard"]
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Générateur de quiz IA" title="Choisissez un thème football" text="Le serveur génère un JSON football structuré avec le SDK IA Vercel, le valide avec Zod et bascule automatiquement en secours." /><div className="grid gap-3 md:grid-cols-3">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-2xl border p-5 text-left font-black ${category === item ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/10 bg-black/45"}`}>{item === "Teams" ? "Équipes" : item === "Players" ? "Joueurs" : "Compétitions internationales"}</button>)}</div><div className="mt-4 grid gap-3 md:grid-cols-3">{difficulties.map((item) => <button key={item} onClick={() => setDifficulty(item)} className={`rounded-2xl border p-4 text-left font-black capitalize ${difficulty === item ? "border-lime-300 bg-lime-300 text-slate-950" : "border-white/10 bg-black/45"}`}>{item === "easy" ? "facile" : item === "medium" ? "moyen" : "difficile"}</button>)}</div><Panel className="mt-5 p-5"><div className="flex items-start gap-3"><Bot className="h-7 w-7 text-emerald-300" /><p className="text-sm leading-7 text-slate-300">Aucune clé API n'est exposée dans le navigateur. Si Groq est indisponible, le jeu utilise silencieusement des quiz locaux validés.</p></div></Panel><button onClick={loadQuiz} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Générer le quiz</button></div>
}

function QuizLoading({ category }: { category: QuizCategory }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-xl p-8 text-center md:p-12"><Bot className="mx-auto mb-6 h-16 w-16 animate-pulse text-emerald-300" /><h1 className="text-4xl font-black">Génération des questions</h1><p className="mt-5 text-slate-300">Thème: {category === "Teams" ? "Équipes" : category === "Players" ? "Joueurs" : "Compétitions internationales"}. Création du pack JSON football validé...</p></Panel></div>
}

function QuizQuestionScreen({ question, selected, setSelected, setScreen, aiError, quizSource }: { question: QuizQuestion; selected: string; setSelected: (value: string) => void; setScreen: (screen: Screen) => void; aiError: string | null; quizSource: "ai" | "fallback" }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={`${question.category} · ${question.difficulty} · ${quizSource === "ai" ? "généré par IA" : "secours local"}`} title="Question sur le terrain" text="Répondez individuellement. Les scores restent cachés jusqu'à la révélation du classement." />{aiError && <Panel className="mb-4 border-yellow-300/30 p-4 text-sm text-yellow-100">{aiError}</Panel>}<Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-emerald-100"><Timer className="h-8 w-8" /><span className="text-6xl font-black tabular-nums">00:20</span></div><h2 className="text-center text-3xl font-black md:text-5xl">{question.question}</h2><div className="mt-8 grid gap-3 md:grid-cols-2">{question.choices.map((choice) => <button key={choice} onClick={() => setSelected(choice)} className={`rounded-2xl border p-5 text-left text-lg font-black ${selected === choice ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/10 bg-white/5"}`}>{choice}</button>)}</div><button disabled={!selected} onClick={() => setScreen("quiz-reveal")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950 disabled:opacity-40">Verrouiller la réponse</button></Panel></div>
}

function QuizReveal({ question, selected, award, questionIndex, setQuestionIndex, setSelectedAnswer, setScreen }: { question: QuizQuestion; selected: string; award: () => void; questionIndex: number; setQuestionIndex: (value: number) => void; setSelectedAnswer: (value: string) => void; setScreen: (screen: Screen) => void }) {
  const correct = selected === question.answer
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><BadgeCheck className={`mx-auto mb-6 h-20 w-20 ${correct ? "text-emerald-300" : "text-red-300"}`} /><p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Révélation VAR</p><h1 className="mt-3 text-5xl font-black">{correct ? "Correct !" : "Raté !"}</h1><p className="mt-5 text-xl text-slate-200">Réponse : <span className="font-black text-emerald-200">{question.answer}</span></p><button onClick={() => { if (correct) award(); setSelectedAnswer(""); if ((questionIndex + 1) % 5 === 0) setScreen("quiz-ranking"); else { setQuestionIndex(questionIndex + 1); setScreen("quiz-question") } }} className="mt-8 rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Continuer</button></Panel></div>
}

function Ranking({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Scores cachés révélés" title="Classement" text="Toutes les cinq questions, la salle découvre qui mène vraiment." /><div className="grid gap-4 md:grid-cols-2">{[...teams].sort((a, b) => b.score - a.score).map((team, index) => <Panel key={team.id} className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Rang {index + 1}</p><h2 className="mt-2 text-3xl font-black">{team.name}</h2></div><p className="text-5xl font-black text-emerald-300">{team.score}</p></div></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Retour aux jeux</button></div>
}

function Rotation({ teams, turn, mode, setMode, setScreen }: { teams: Team[]; turn: number; mode: PartyMode; setMode: (mode: PartyMode) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Rotation d'équipe" title={`${teams[turn]?.name} joue maintenant`} text="Choisissez mime ou mot-clé. Un joueur fait deviner, ses coéquipiers répondent avant la fin du temps." /><Panel className="p-6 md:p-8"><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setMode("mime")} className={`rounded-2xl px-5 py-5 font-black ${mode === "mime" ? "bg-emerald-300 text-slate-950" : "border border-white/15"}`}>Mode mime</button><button onClick={() => setMode("keyword")} className={`rounded-2xl px-5 py-5 font-black ${mode === "keyword" ? "bg-emerald-300 text-slate-950" : "border border-white/15"}`}>Mode mot-clé</button></div><button onClick={() => setScreen(mode)} className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-black text-slate-950">Commencer le tour</button></Panel></div>
}

function MimeMode({ teams, turn, target, setTarget, award, nextTurn, setScreen }: { teams: Team[]; turn: number; target: string; setTarget: (target: string) => void; award: () => void; nextTurn: () => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Mode mime" title="Interdit de parler. Gestes seulement." text={`${teams[turn]?.name}: imitez le joueur. Les coéquipiers doivent deviner avant la fin du temps.`} /><Panel className="p-8 text-center md:p-12"><Dumbbell className="mx-auto mb-6 h-16 w-16 text-emerald-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Le joueur mimeur voit</p><h2 className="mt-3 text-5xl font-black">{target}</h2><div className="mt-8 text-8xl font-black tabular-nums text-emerald-300">00:45</div><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={() => setTarget(mimePlayers[Math.floor(Math.random() * mimePlayers.length)])} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Nouveau joueur</button><button onClick={() => { award(); nextTurn(); setScreen("team-score") }} className="rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">Correct</button><button onClick={() => { nextTurn(); setScreen("team-score") }} className="rounded-2xl border border-red-300/30 px-5 py-4 font-black">Temps écoulé</button></div></Panel></div>
}

function KeywordMode({ teams, turn, card, nextCard, award, nextTurn, setScreen }: { teams: Team[]; turn: number; card: { clue: string; answer: string }; nextCard: () => void; award: () => void; nextTurn: () => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Mode mot-clé" title="Un indice. Un but." text={`${teams[turn]?.name}: donnez l'indice et laissez vos coéquipiers deviner le footballeur.`} /><Panel className="p-8 text-center md:p-12"><KeyRound className="mx-auto mb-6 h-16 w-16 text-emerald-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Mot-clé</p><h2 className="mt-3 text-7xl font-black text-emerald-200">{card.clue}</h2><p className="mt-6 text-slate-400">Réponse attendue cachée aux coéquipiers : {card.answer}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={nextCard} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Nouvelle carte</button><button onClick={() => { award(); nextTurn(); setScreen("team-score") }} className="rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">Correct</button><button onClick={() => { nextTurn(); setScreen("team-score") }} className="rounded-2xl border border-red-300/30 px-5 py-4 font-black">Raté</button></div></Panel></div>
}

function TeamScore({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Tableau des scores" title="Le match est vivant" text="Les scores évoluent après chaque tour d'équipe. Gardez un rythme rapide." /><div className="grid gap-4 md:grid-cols-2">{teams.map((team) => <Panel key={team.id} className="p-6"><div className={`mb-5 h-2 rounded-full bg-gradient-to-r ${team.color}`} /><h2 className="text-3xl font-black">{team.name}</h2><p className="mt-5 text-7xl font-black text-emerald-300">{team.score}</p></Panel>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => setScreen("rotation")} className="rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Tour suivant</button><button onClick={() => setScreen("results")} className="rounded-2xl border border-white/15 px-6 py-4 font-black">Résultats finaux</button></div></div>
}

function HistoryScreen() {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Historique du match" title="Chronologie du direct" text="Un résumé rapide des buts, réponses, révélations et dynamiques d'équipe." /><div className="grid gap-4 md:grid-cols-2">{matchHistory.map((item) => <Panel key={item} className="p-6"><History className="mb-5 h-9 w-9 text-emerald-300" /><p className="leading-7 text-slate-300">{item}</p></Panel>)}</div></div>
}

function Results({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Fin du match" title="Résultats finaux" text="Le classement désigne le vainqueur. Célébrez, débattez, recommencez." /><div className="space-y-3">{sorted.map((team, index) => <Panel key={team.id} className="p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><Medal className="h-9 w-9 text-emerald-300" /><div><p className="text-sm uppercase tracking-[0.25em] text-slate-500">Place {index + 1}</p><h2 className="text-2xl font-black">{team.name}</h2></div></div><p className="text-4xl font-black">{team.score}</p></div></Panel>)}</div><button onClick={() => setScreen("victory")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Soulever le trophée</button></div>
}

function Victory({ teams }: { teams: Team[] }) {
  const winner = [...teams].sort((a, b) => b.score - a.score)[0]
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Trophy className="mx-auto mb-6 h-24 w-24 text-yellow-300" /><p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Champions</p><h1 className="mt-3 text-5xl font-black md:text-7xl">{winner.name}</h1><p className="mt-5 text-slate-300">Ils remportent la session multijoueur locale de GOAL!!!</p></Panel></div>
}

function SimulationLocked() {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Bientôt disponible" title="Simulation de match" text="Aperçu d'un mode tactique premium. Verrouillé pour l'instant, non jouable." /><Panel className="overflow-hidden p-6 md:p-8"><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.22),transparent_45%)] p-5"><div className="grid h-[420px] grid-cols-3 grid-rows-4 gap-4 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-950/20 p-5">{Array.from({ length: 12 }, (_, index) => <div key={index} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5"><Shield className="h-8 w-8 text-emerald-200" /></div>)}</div></div><div><Lock className="mb-5 h-14 w-14 text-yellow-300" /><h2 className="text-3xl font-black">Aperçu du système tactique</h2><div className="mt-5 grid gap-3">{["Passe", "Interception", "Dribble", "Blocage", "Tir"].map((move) => <div key={move} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-black">{move}</div>)}</div><p className="mt-5 text-sm text-slate-400">Deux équipes s'affronteront avec des choix tactiques et des duels de joueurs. Ce mode reste verrouillé.</p></div></div></Panel></div>
}
