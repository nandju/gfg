"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, BarChart3, Bot, Check, CircleHelp, Dumbbell, History, KeyRound, Lock, LogIn, Medal, Play, Plus, RefreshCw, ScanLine, Shield, Timer, Trophy, Users, Volleyball } from "lucide-react"
import { useGoalRoom } from "@/hooks/use-goal-room"

type Screen = "loader" | "menu" | "lobby" | "create" | "join" | "teams" | "games" | "quiz-select" | "quiz-loading" | "quiz-question" | "quiz-reveal" | "quiz-ranking" | "mime-loading" | "keyword-loading" | "mime" | "keyword" | "rotation" | "team-score" | "history" | "results" | "victory" | "simulation"
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

type MimeChallenge = {
  player: string
  difficulty: Difficulty
  mimeHints: string[]
}

type KeywordChallenge = {
  answer: string
  keywords: string[]
  difficulty: Difficulty
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
  { id: "blue", name: "Étoiles bleues", color: "from-sky-500 to-blue-700", players: ["NOVA", "MILO"], score: 0 },
  { id: "gold", name: "Onze doré", color: "from-yellow-300 to-orange-500", players: ["LINA", "KAI"], score: 0 }
]

const mimePlayers = ["Kylian Mbappe", "Cristiano Ronaldo", "Lionel Messi", "Erling Haaland", "Neymar", "Sadio Mane", "Mohamed Salah", "Zinedine Zidane"]
const keywordCards = [
  { keywords: ["7", "Portugal", "Siiiu"], answer: "Cristiano Ronaldo", difficulty: "easy" as Difficulty },
  { keywords: ["Barcelone", "Argentine", "10"], answer: "Lionel Messi", difficulty: "easy" as Difficulty },
  { keywords: ["Roi", "Manchester", "Col relevé"], answer: "Eric Cantona", difficulty: "medium" as Difficulty },
  { keywords: ["Norvège", "Puissance", "City"], answer: "Erling Haaland", difficulty: "medium" as Difficulty },
  { keywords: ["Égypte", "Liverpool", "Pharaon"], answer: "Mohamed Salah", difficulty: "medium" as Difficulty },
  { keywords: ["Paris", "Vitesse", "France"], answer: "Kylian Mbappe", difficulty: "easy" as Difficulty }
]
const matchHistory = ["Les Étoiles bleues ont gagné la manche de quiz 1 grâce à une réponse tardive.", "Le Onze doré a dominé le mode Mime avec deux réponses parfaites.", "Un indice mot-clé a changé le rythme du match.", "Les scores sont restés cachés jusqu'à la révélation de la cinquième question."]

function generateCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  return `GL-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(100 + Math.random() * 900)}`
}

async function fetchWithRetry<T>(
  url: string,
  body: unknown,
  parser: (data: unknown) => T,
  options: { retries?: number; timeoutMs?: number } = {}
): Promise<T> {
  const { retries = 2, timeoutMs = 12000 } = options
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal
      })

      window.clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return parser(data)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < retries) {
        await new Promise((resolve) => window.setTimeout(resolve, 800 * (attempt + 1)))
      }
    }
  }

  throw lastError ?? new Error("Échec après plusieurs tentatives")
}

async function requestQuizPack(category: QuizCategory, difficulty: Difficulty): Promise<{ questions: QuizQuestion[]; source: "ai" | "fallback" }> {
  return fetchWithRetry(
    "/api/goal-quiz",
    { category, difficulty, count: 5 },
    (data) => {
      const payload = data as Record<string, unknown>
      if (!Array.isArray(payload.questions) || payload.questions.length < 5) {
        throw new Error("Réponse de quiz invalide")
      }
      return {
        questions: payload.questions as QuizQuestion[],
        source: payload.source === "ai" ? "ai" : "fallback"
      }
    },
    { retries: 2, timeoutMs: 15000 }
  )
}

async function requestMimeChallenge(difficulty: Difficulty): Promise<{ challenge: MimeChallenge; source: "ai" | "fallback" }> {
  return fetchWithRetry(
    "/api/goal-mime",
    { difficulty },
    (data) => {
      const payload = data as Record<string, unknown>
      if (!payload?.challenge || typeof (payload.challenge as Record<string, unknown>).player !== "string" || !Array.isArray((payload.challenge as Record<string, unknown>).mimeHints)) {
        throw new Error("Réponse de mime invalide")
      }
      return {
        challenge: payload.challenge as MimeChallenge,
        source: payload.source === "ai" ? "ai" : "fallback"
      }
    },
    { retries: 2, timeoutMs: 12000 }
  )
}

async function requestKeywordChallenge(difficulty: Difficulty): Promise<{ challenge: KeywordChallenge; source: "ai" | "fallback" }> {
  return fetchWithRetry(
    "/api/goal-keyword",
    { difficulty },
    (data) => {
      const payload = data as Record<string, unknown>
      if (!payload?.challenge || typeof (payload.challenge as Record<string, unknown>).answer !== "string" || !Array.isArray((payload.challenge as Record<string, unknown>).keywords)) {
        throw new Error("Réponse de mot-clé invalide")
      }
      return {
        challenge: payload.challenge as KeywordChallenge,
        source: payload.source === "ai" ? "ai" : "fallback"
      }
    },
    { retries: 2, timeoutMs: 12000 }
  )
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
  const [mimeSource, setMimeSource] = useState<"ai" | "fallback">("fallback")
  const [keywordSource, setKeywordSource] = useState<"ai" | "fallback">("fallback")
  const [quizError, setQuizError] = useState<string | null>(null)
  const [mimeError, setMimeError] = useState<string | null>(null)
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const [turn, setTurn] = useState(0)
  const [partyMode, setPartyMode] = useState<PartyMode>("mime")
  const [mimeChallenge, setMimeChallenge] = useState<MimeChallenge>({ player: mimePlayers[0], difficulty: "medium", mimeHints: ["Célébration", "Numéro", "Club"] })
  const [keywordChallenge, setKeywordChallenge] = useState<KeywordChallenge>(keywordCards[0])

  useEffect(() => {
    if (screen !== "loader") return
    console.log("[LOADER] Asset loaded")
    const visualDelay = new Promise<"visual">((resolve) => window.setTimeout(() => resolve("visual"), 3200))
    const failsafe = new Promise<"timeout">((resolve) => window.setTimeout(() => resolve("timeout"), 4000))
    let mounted = true
    Promise.race([visualDelay, failsafe]).then((result) => {
      if (!mounted) return
      if (result === "timeout") console.log("[LOADER] Timeout reached")
      console.log("[LOADER] Entering application")
      setScreen("menu")
    })
    return () => {
      mounted = false
    }
  }, [screen])

  // ── Realtime multiplayer (Supabase, host-authoritative) ───────────────────
  const goalRoom = useGoalRoom()
  const roomCreationRef = useRef<"idle" | "creating" | "done">("idle")
  const lastPushedRef = useRef<string>("")
  const lastReceivedRef = useRef<string>("")

  useEffect(() => {
    if (!goalRoom.enabled) return
    if (screen !== "create") return
    if (roomCreationRef.current !== "idle") return
    if (goalRoom.room) return
    roomCreationRef.current = "creating"
    goalRoom.createRoom({ teams: initialTeams }).then((room) => {
      if (room) setCode(room.code)
      roomCreationRef.current = "done"
    }).catch(() => { roomCreationRef.current = "idle" })
  }, [screen, goalRoom])

  const joinScreenSetter = useCallback((next: Screen) => {
    if (next !== "teams" || !goalRoom.enabled || goalRoom.room) {
      setScreen(next)
      return
    }
    if (!joinCode.trim()) { setScreen(next); return }
    goalRoom.joinRoom(joinCode).then((room) => {
      if (room) setCode(room.code)
      setScreen(next)
    }).catch(() => setScreen(next))
  }, [goalRoom, joinCode])

  useEffect(() => {
    if (!goalRoom.enabled || !goalRoom.room || !goalRoom.isHost) return
    const snapshot = JSON.stringify({ screen, teams, turn, partyMode, category, difficulty, questions, questionIndex, selectedAnswer, mimeChallenge, keywordChallenge, quizSource, mimeSource, keywordSource })
    if (snapshot === lastPushedRef.current) return
    lastPushedRef.current = snapshot
    goalRoom.pushState({
      current_screen: screen,
      game_state: { teams, turn, partyMode, category, difficulty, questions, questionIndex, selectedAnswer, mimeChallenge, keywordChallenge, quizSource, mimeSource, keywordSource }
    })
  }, [goalRoom, screen, teams, turn, partyMode, category, difficulty, questions, questionIndex, selectedAnswer, mimeChallenge, keywordChallenge, quizSource, mimeSource, keywordSource])

  useEffect(() => {
    if (!goalRoom.enabled || !goalRoom.room || goalRoom.isHost) return
    const remoteScreen = goalRoom.room.current_screen as Screen | null
    const remoteState = goalRoom.room.game_state as Record<string, unknown>
    const snapshot = JSON.stringify({ remoteScreen, remoteState })
    if (snapshot === lastReceivedRef.current) return
    lastReceivedRef.current = snapshot
    if (remoteScreen) setScreen(remoteScreen)
    if (Array.isArray(remoteState.teams)) setTeams(remoteState.teams as Team[])
    if (typeof remoteState.turn === "number") setTurn(remoteState.turn)
    if (remoteState.partyMode === "mime" || remoteState.partyMode === "keyword") setPartyMode(remoteState.partyMode)
    if (remoteState.category) setCategory(remoteState.category as QuizCategory)
    if (remoteState.difficulty) setDifficulty(remoteState.difficulty as Difficulty)
    if (Array.isArray(remoteState.questions)) setQuestions(remoteState.questions as QuizQuestion[])
    if (typeof remoteState.questionIndex === "number") setQuestionIndex(remoteState.questionIndex)
    if (typeof remoteState.selectedAnswer === "string") setSelectedAnswer(remoteState.selectedAnswer)
    if (remoteState.mimeChallenge) setMimeChallenge(remoteState.mimeChallenge as MimeChallenge)
    if (remoteState.keywordChallenge) setKeywordChallenge(remoteState.keywordChallenge as KeywordChallenge)
    if (remoteState.quizSource === "ai" || remoteState.quizSource === "fallback") setQuizSource(remoteState.quizSource)
    if (remoteState.mimeSource === "ai" || remoteState.mimeSource === "fallback") setMimeSource(remoteState.mimeSource)
    if (remoteState.keywordSource === "ai" || remoteState.keywordSource === "fallback") setKeywordSource(remoteState.keywordSource)
  }, [goalRoom])

  const award = (teamId = teams[turn]?.id, amount = 3) => setTeams((current) => current.map((team) => team.id === teamId ? { ...team, score: team.score + amount } : team))
  const nextTurn = () => setTurn((current) => (current + 1) % teams.length)
  const loadQuiz = async () => {
    setScreen("quiz-loading")
    setAiError(null)
    setQuizError(null)
    try {
      const generated = await requestQuizPack(category, difficulty)
      setQuestions(generated.questions)
      setQuizSource(generated.source)
      if (generated.source === "fallback") setAiError("Quiz local de secours chargé. Le match continue sans interruption.")
      setQuestionIndex(0)
      setSelectedAnswer("")
      setScreen("quiz-question")
    } catch {
      setQuizError("La génération IA a échoué après 3 tentatives. Questions de secours validées chargées.")
      setAiError("La génération IA a échoué. Questions de secours validées chargées.")
      setQuestions(fallbackQuestions.slice(0, 5))
      setQuizSource("fallback")
      setQuestionIndex(0)
      setScreen("quiz-question")
    }
  }
  const loadMime = async () => {
    setScreen("mime-loading")
    setMimeError(null)
    try {
      const generated = await requestMimeChallenge(difficulty)
      setMimeChallenge(generated.challenge)
      setMimeSource(generated.source)
      if (generated.source === "fallback") setMimeError("Mode secours activé. Nouveau joueur local chargé.")
    } catch {
      setMimeError("La génération IA a échoué après 3 tentatives. Joueur local chargé.")
      setMimeChallenge({ player: mimePlayers[Math.floor(Math.random() * mimePlayers.length)], difficulty, mimeHints: ["Célébration", "Numéro", "Club"] })
      setMimeSource("fallback")
    }
    setScreen("mime")
  }
  const loadKeyword = async () => {
    setScreen("keyword-loading")
    setKeywordError(null)
    try {
      const generated = await requestKeywordChallenge(difficulty)
      setKeywordChallenge(generated.challenge)
      setKeywordSource(generated.source)
      if (generated.source === "fallback") setKeywordError("Mode secours activé. Nouvelle carte locale chargée.")
    } catch {
      setKeywordError("La génération IA a échoué après 3 tentatives. Carte locale chargée.")
      setKeywordChallenge(keywordCards[Math.floor(Math.random() * keywordCards.length)])
      setKeywordSource("fallback")
    }
    setScreen("keyword")
  }

  if (screen === "loader") return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.28),transparent_45%)]" /><div className="relative z-10 w-full max-w-sm text-center"><div className="relative mx-auto mb-7 h-28 w-28 overflow-hidden rounded-[2rem] border border-emerald-300/60 shadow-2xl shadow-emerald-950/60"><Image src="/goal!!!/cover.png" alt="GOAL!!!" fill priority className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.45em] text-emerald-300">Coup d'envoi en chargement</p><h1 className="mt-3 text-6xl font-black">GOAL!!!</h1><div className="mt-8 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.35em] text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />Préparation<span className="h-2 w-2 animate-pulse rounded-full bg-lime-200" /></div></div></main>

  return <Shell screen={screen} setScreen={setScreen}>
    {screen === "menu" && <Menu setScreen={setScreen} />}
    {screen === "lobby" && <Lobby setScreen={setScreen} />}
    {screen === "create" && <CreateRoom code={code} setCode={setCode} setScreen={setScreen} />}
    {screen === "join" && <JoinRoom joinCode={joinCode} setJoinCode={setJoinCode} setScreen={joinScreenSetter} />}
    {screen === "teams" && <Teams teams={teams} setScreen={setScreen} />}
    {screen === "games" && <GameSelection setScreen={setScreen} />}
    {screen === "quiz-select" && <QuizSelect category={category} setCategory={setCategory} difficulty={difficulty} setDifficulty={setDifficulty} loadQuiz={loadQuiz} />}
    {screen === "quiz-loading" && <QuizLoading category={category} />}
    {screen === "quiz-question" && <QuizQuestionScreen question={questions[questionIndex]} selected={selectedAnswer} setSelected={setSelectedAnswer} setScreen={setScreen} aiError={aiError} quizSource={quizSource} onRetry={loadQuiz} quizError={quizError} />}
    {screen === "quiz-reveal" && <QuizReveal question={questions[questionIndex]} selected={selectedAnswer} award={award} questionIndex={questionIndex} setQuestionIndex={setQuestionIndex} setSelectedAnswer={setSelectedAnswer} setScreen={setScreen} />}
    {screen === "quiz-ranking" && <Ranking teams={teams} setScreen={setScreen} />}
    {screen === "mime-loading" && <AiModeLoading title="Sélection du joueur légendaire..." lines={["Analyse des célébrations football...", "Génération des gestes de mime..."]} />}
    {screen === "keyword-loading" && <AiModeLoading title="Construction des indices football..." lines={["Analyse de l'héritage du joueur...", "Préparation du défi mot-clé..."]} />}
    {screen === "mime" && <MimeMode teams={teams} turn={turn} challenge={mimeChallenge} source={mimeSource} loadMime={loadMime} award={award} nextTurn={nextTurn} setScreen={setScreen} mimeError={mimeError} />}
    {screen === "keyword" && <KeywordMode teams={teams} turn={turn} challenge={keywordChallenge} source={keywordSource} loadKeyword={loadKeyword} award={award} nextTurn={nextTurn} setScreen={setScreen} keywordError={keywordError} />}
    {screen === "rotation" && <Rotation teams={teams} turn={turn} mode={partyMode} setMode={setPartyMode} loadMime={loadMime} loadKeyword={loadKeyword} />}
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
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-xl p-8 text-center md:p-12"><Bot className="mx-auto mb-6 h-16 w-16 animate-pulse text-emerald-300" /><h1 className="text-4xl font-black">Génération IA des questions</h1><p className="mt-5 text-slate-300">Thème: {category === "Teams" ? "Équipes" : category === "Players" ? "Joueurs" : "Compétitions internationales"}. Le serveur génère un pack JSON structuré avec secours automatique...</p><div className="mt-6 space-y-2"><div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-white/10"><div className="h-full animate-pulse rounded-full bg-emerald-400" /></div><p className="text-xs text-slate-500">Jusqu'à 3 tentatives · 15 secondes max</p></div></Panel></div>
}

function AiModeLoading({ title, lines }: { title: string; lines: string[] }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-xl p-8 text-center md:p-12"><Bot className="mx-auto mb-6 h-16 w-16 animate-pulse text-emerald-300" /><h1 className="text-4xl font-black">{title}</h1><div className="mt-6 space-y-3">{lines.map((line) => <div key={line} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300">{line}</div>)}</div><div className="mt-6 space-y-2"><div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-white/10"><div className="h-full animate-pulse rounded-full bg-emerald-400" /></div><p className="text-xs text-slate-500">Jusqu'à 3 tentatives · 12 secondes max · Secours automatique</p></div></Panel></div>
}

function QuizQuestionScreen({ question, selected, setSelected, setScreen, aiError, quizSource, onRetry, quizError }: { question: QuizQuestion; selected: string; setSelected: (value: string) => void; setScreen: (screen: Screen) => void; aiError: string | null; quizSource: "ai" | "fallback"; onRetry?: () => void; quizError: string | null }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={`${question.category} · ${question.difficulty} · ${quizSource === "ai" ? "généré par IA" : "secours local"}`} title="Question sur le terrain" text="Répondez individuellement. Les scores restent cachés jusqu'à la révélation du classement." />{aiError && <Panel className="mb-4 border-yellow-300/30 p-4 text-sm text-yellow-100">{aiError}</Panel>}{quizSource === "fallback" && quizError && onRetry && <Panel className="mb-4 flex flex-col gap-3 border-yellow-300/30 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-yellow-100">{quizError}</p><button onClick={onRetry} className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-300/40 px-4 py-2 text-sm font-black text-yellow-200 transition hover:bg-yellow-300/10"><RefreshCw className="h-4 w-4" /> Réessayer l'IA</button></Panel>}<Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-emerald-100"><Timer className="h-8 w-8" /><span className="text-6xl font-black tabular-nums">00:20</span></div><h2 className="text-center text-3xl font-black md:text-5xl">{question.question}</h2><div className="mt-8 grid gap-3 md:grid-cols-2">{question.choices.map((choice) => <button key={choice} onClick={() => setSelected(choice)} className={`rounded-2xl border p-5 text-left text-lg font-black ${selected === choice ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/10 bg-white/5"}`}>{choice}</button>)}</div><button disabled={!selected} onClick={() => setScreen("quiz-reveal")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950 disabled:opacity-40">Verrouiller la réponse</button></Panel></div>
}

function QuizReveal({ question, selected, award, questionIndex, setQuestionIndex, setSelectedAnswer, setScreen }: { question: QuizQuestion; selected: string; award: () => void; questionIndex: number; setQuestionIndex: (value: number) => void; setSelectedAnswer: (value: string) => void; setScreen: (screen: Screen) => void }) {
  const correct = selected === question.answer
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><BadgeCheck className={`mx-auto mb-6 h-20 w-20 ${correct ? "text-emerald-300" : "text-red-300"}`} /><p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Révélation VAR</p><h1 className="mt-3 text-5xl font-black">{correct ? "Correct !" : "Raté !"}</h1><p className="mt-5 text-xl text-slate-200">Réponse : <span className="font-black text-emerald-200">{question.answer}</span></p><button onClick={() => { if (correct) award(); setSelectedAnswer(""); if ((questionIndex + 1) % 5 === 0) setScreen("quiz-ranking"); else { setQuestionIndex(questionIndex + 1); setScreen("quiz-question") } }} className="mt-8 rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Continuer</button></Panel></div>
}

function Ranking({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Scores cachés révélés" title="Classement" text="Toutes les cinq questions, la salle découvre qui mène vraiment." /><div className="grid gap-4 md:grid-cols-2">{[...teams].sort((a, b) => b.score - a.score).map((team, index) => <Panel key={team.id} className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Rang {index + 1}</p><h2 className="mt-2 text-3xl font-black">{team.name}</h2></div><p className="text-5xl font-black text-emerald-300">{team.score}</p></div></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Retour aux jeux</button></div>
}

function Rotation({ teams, turn, mode, setMode, loadMime, loadKeyword }: { teams: Team[]; turn: number; mode: PartyMode; setMode: (mode: PartyMode) => void; loadMime: () => void; loadKeyword: () => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Rotation d'équipe" title={`${teams[turn]?.name} joue maintenant`} text="Choisissez mime ou mot-clé. Le serveur prépare un défi football dynamique avec secours automatique." /><Panel className="p-6 md:p-8"><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setMode("mime")} className={`rounded-2xl px-5 py-5 font-black ${mode === "mime" ? "bg-emerald-300 text-slate-950" : "border border-white/15"}`}>Mode mime IA</button><button onClick={() => setMode("keyword")} className={`rounded-2xl px-5 py-5 font-black ${mode === "keyword" ? "bg-emerald-300 text-slate-950" : "border border-white/15"}`}>Mode mot-clé IA</button></div><button onClick={mode === "mime" ? loadMime : loadKeyword} className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-black text-slate-950">Générer le tour</button></Panel></div>
}

function MimeMode({ teams, turn, challenge, source, loadMime, award, nextTurn, setScreen, mimeError }: { teams: Team[]; turn: number; challenge: MimeChallenge; source: "ai" | "fallback"; loadMime: () => void; award: () => void; nextTurn: () => void; setScreen: (screen: Screen) => void; mimeError?: string | null }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={`Mode mime · ${source === "ai" ? "généré par IA" : "secours local"}`} title="Interdit de parler. Gestes seulement." text={`${teams[turn]?.name}: imitez le joueur. Les coéquipiers doivent deviner avant la fin du temps.`} />{mimeError && <Panel className="mb-4 border-yellow-300/30 p-4 text-sm text-yellow-100">{mimeError}</Panel>}<Panel className="p-8 text-center md:p-12"><Dumbbell className="mx-auto mb-6 h-16 w-16 text-emerald-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Le joueur mimeur voit</p><h2 className="mt-3 text-5xl font-black">{challenge.player}</h2><div className="mt-6 grid gap-2 sm:grid-cols-2">{challenge.mimeHints.map((hint) => <div key={hint} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300">{hint}</div>)}</div><div className="mt-8 text-8xl font-black tabular-nums text-emerald-300">00:45</div><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={loadMime} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Nouveau joueur IA</button><button onClick={() => { award(); nextTurn(); setScreen("team-score") }} className="rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">Correct</button><button onClick={() => { nextTurn(); setScreen("team-score") }} className="rounded-2xl border border-red-300/30 px-5 py-4 font-black">Temps écoulé</button></div></Panel></div>
}

function KeywordMode({ teams, turn, challenge, source, loadKeyword, award, nextTurn, setScreen, keywordError }: { teams: Team[]; turn: number; challenge: KeywordChallenge; source: "ai" | "fallback"; loadKeyword: () => void; award: () => void; nextTurn: () => void; setScreen: (screen: Screen) => void; keywordError?: string | null }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={`Mode mot-clé · ${source === "ai" ? "généré par IA" : "secours local"}`} title="Des indices. Un but." text={`${teams[turn]?.name}: donnez les indices et laissez vos coéquipiers deviner le footballeur.`} />{keywordError && <Panel className="mb-4 border-yellow-300/30 p-4 text-sm text-yellow-100">{keywordError}</Panel>}<Panel className="p-8 text-center md:p-12"><KeyRound className="mx-auto mb-6 h-16 w-16 text-emerald-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Mots-clés</p><div className="mt-5 flex flex-wrap justify-center gap-3">{challenge.keywords.map((keyword) => <span key={keyword} className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-2xl font-black text-emerald-100">{keyword}</span>)}</div><p className="mt-6 text-slate-400">Réponse attendue cachée aux coéquipiers : {challenge.answer}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={loadKeyword} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Nouvelle carte IA</button><button onClick={() => { award(); nextTurn(); setScreen("team-score") }} className="rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">Correct</button><button onClick={() => { nextTurn(); setScreen("team-score") }} className="rounded-2xl border border-red-300/30 px-5 py-4 font-black">Raté</button></div></Panel></div>
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
