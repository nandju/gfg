"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, BarChart3, Bot, Check, CircleHelp, Dumbbell, History, KeyRound, Lock, LogIn, Medal, Play, Plus, RefreshCw, ScanLine, Shield, Timer, Trophy, Users, Volleyball } from "lucide-react"
import { z } from "zod"

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

const quizQuestionSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).length(4),
  answer: z.string(),
  category: z.enum(["Teams", "Players", "International Competitions"]),
  difficulty: z.enum(["easy", "medium", "hard"])
})

const quizPackSchema = z.object({ questions: z.array(quizQuestionSchema).min(5) })

const fallbackQuestions: QuizQuestion[] = [
  { question: "Which country won the 2022 FIFA World Cup?", choices: ["France", "Argentina", "Brazil", "Germany"], answer: "Argentina", category: "International Competitions", difficulty: "easy" },
  { question: "Which club is known as The Red Devils?", choices: ["Liverpool", "Arsenal", "Manchester United", "AC Milan"], answer: "Manchester United", category: "Teams", difficulty: "easy" },
  { question: "Who has won multiple Ballon d'Or awards with Barcelona?", choices: ["Lionel Messi", "Neymar", "Xavi", "Iniesta"], answer: "Lionel Messi", category: "Players", difficulty: "easy" },
  { question: "Which competition is often called AFCON?", choices: ["Asian Cup", "Africa Cup of Nations", "Copa America", "Euro"], answer: "Africa Cup of Nations", category: "International Competitions", difficulty: "easy" },
  { question: "Which tournament crowns the champion of Europe between clubs?", choices: ["Europa League", "Champions League", "Euro", "Nations League"], answer: "Champions League", category: "International Competitions", difficulty: "easy" },
  { question: "Which player is strongly associated with the number 7 and Portugal?", choices: ["Cristiano Ronaldo", "Luis Figo", "Eusebio", "Bruno Fernandes"], answer: "Cristiano Ronaldo", category: "Players", difficulty: "easy" },
  { question: "Which national team is nicknamed La Albiceleste?", choices: ["Uruguay", "Argentina", "Italy", "Spain"], answer: "Argentina", category: "Teams", difficulty: "medium" },
  { question: "Which competition features CONMEBOL national teams?", choices: ["Copa America", "Euro", "AFCON", "Gold Cup"], answer: "Copa America", category: "International Competitions", difficulty: "medium" },
  { question: "Which club plays at the Santiago Bernabeu?", choices: ["Barcelona", "Atletico Madrid", "Real Madrid", "Sevilla"], answer: "Real Madrid", category: "Teams", difficulty: "easy" },
  { question: "Who is known as King Eric in English football culture?", choices: ["Eric Cantona", "Eric Bailly", "Thierry Henry", "Dennis Bergkamp"], answer: "Eric Cantona", category: "Players", difficulty: "medium" }
]

const initialTeams: Team[] = [
  { id: "blue", name: "Blue Stars", color: "from-sky-500 to-blue-700", players: ["NOVA", "MILO"], score: 0 },
  { id: "gold", name: "Golden XI", color: "from-yellow-300 to-orange-500", players: ["LINA", "KAI"], score: 0 }
]

const mimePlayers = ["Kylian Mbappe", "Cristiano Ronaldo", "Lionel Messi", "Erling Haaland", "Neymar", "Sadio Mane", "Mohamed Salah", "Zinedine Zidane"]
const keywordCards = [
  { clue: "7", answer: "Cristiano Ronaldo" },
  { clue: "Barcelona", answer: "Lionel Messi" },
  { clue: "King", answer: "Eric Cantona" },
  { clue: "Norway", answer: "Erling Haaland" },
  { clue: "Egypt", answer: "Mohamed Salah" },
  { clue: "Paris", answer: "Kylian Mbappe" }
]
const matchHistory = ["Blue Stars won Quiz Round 1 after a late answer.", "Golden XI dominated Mime Mode with two perfect guesses.", "A keyword clue changed the match momentum.", "Scores were hidden until the fifth question reveal."]

function generateCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  return `GL-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(100 + Math.random() * 900)}`
}

async function generateQuizPack(category: QuizCategory): Promise<QuizQuestion[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 900))
  const pack = quizPackSchema.parse({ questions: fallbackQuestions.filter((question) => question.category === category || category === "International Competitions").slice(0, 5) })
  return pack.questions
}

function QrPattern({ code }: { code: string }) {
  const cells = useMemo(() => Array.from({ length: 81 }, (_, index) => (code.charCodeAt(index % code.length) + index * 11) % 3 !== 0), [code])
  return <div className="grid h-48 w-48 grid-cols-9 gap-1 rounded-[2rem] bg-white p-4 shadow-2xl shadow-emerald-950/40 md:h-56 md:w-56">{cells.map((active, index) => <div key={index} className={`rounded-sm ${active ? "bg-slate-950" : "bg-white"}`} />)}</div>
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[2rem] border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}>{children}</section>
}

function Shell({ children, screen, setScreen }: { children: React.ReactNode; screen: Screen; setScreen: (screen: Screen) => void }) {
  return <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white"><div className="fixed inset-0"><Image src="/goal!!!/mobile3.png" alt="" fill priority className="object-cover md:hidden" /><Image src="/goal!!!/desktop.png" alt="" fill priority className="hidden object-cover md:block" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,.35),transparent_30%),linear-gradient(180deg,rgba(2,6,23,.5),rgba(2,6,23,.96))]" /><div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px]" /></div><header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:px-8"><button onClick={() => setScreen(screen === "menu" ? "menu" : "games")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-black backdrop-blur-xl"><ArrowLeft className="h-4 w-4" /> GOAL</button><div className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-100">Local match</div></header><div className="relative z-10 min-h-screen px-4 pb-28 pt-24 md:px-8">{children}</div></main>
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
  const [questions, setQuestions] = useState<QuizQuestion[]>(fallbackQuestions.slice(0, 5))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [aiError, setAiError] = useState<string | null>(null)
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
      const generated = await generateQuizPack(category)
      setQuestions(generated)
      setQuestionIndex(0)
      setSelectedAnswer("")
      setScreen("quiz-question")
    } catch {
      setAiError("AI generation failed. Validated fallback questions loaded.")
      setQuestions(fallbackQuestions.slice(0, 5))
      setQuestionIndex(0)
      setScreen("quiz-question")
    }
  }

  if (screen === "loader") return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.28),transparent_45%)]" /><div className="relative z-10 w-full max-w-sm text-center"><div className="relative mx-auto mb-7 h-28 w-28 overflow-hidden rounded-[2rem] border border-emerald-300/60 shadow-2xl shadow-emerald-950/60"><Image src="/goal!!!/cover.png" alt="GOAL!!!" fill priority className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.45em] text-emerald-300">Kick-off loading</p><h1 className="mt-3 text-6xl font-black">GOAL!!!</h1><div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-300 to-white transition-all duration-200" style={{ width: `${progress}%` }} /></div><p className="mt-4 text-sm text-slate-400">Stadium lights warming up... {progress}%</p></div></main>

  return <Shell screen={screen} setScreen={setScreen}>
    {screen === "menu" && <Menu setScreen={setScreen} />}
    {screen === "lobby" && <Lobby setScreen={setScreen} />}
    {screen === "create" && <CreateRoom code={code} setCode={setCode} setScreen={setScreen} />}
    {screen === "join" && <JoinRoom joinCode={joinCode} setJoinCode={setJoinCode} setScreen={setScreen} />}
    {screen === "teams" && <Teams teams={teams} setScreen={setScreen} />}
    {screen === "games" && <GameSelection setScreen={setScreen} />}
    {screen === "quiz-select" && <QuizSelect category={category} setCategory={setCategory} loadQuiz={loadQuiz} />}
    {screen === "quiz-loading" && <QuizLoading category={category} />}
    {screen === "quiz-question" && <QuizQuestionScreen question={questions[questionIndex]} selected={selectedAnswer} setSelected={setSelectedAnswer} setScreen={setScreen} aiError={aiError} />}
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
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="w-full max-w-3xl p-6 text-center md:p-10"><div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-[2rem] border border-emerald-300/60 md:h-36 md:w-36"><Image src="/goal!!!/cover.png" alt="GOAL!!!" fill className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-300">Local football party</p><h1 className="mt-3 text-6xl font-black md:text-8xl">GOAL!!!</h1><p className="mx-auto mt-5 max-w-xl text-slate-300">Fast football mini-games for players in the same room. Phones manage scores, timers, teams, and reveals.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><button onClick={() => setScreen("lobby")} className="rounded-2xl bg-emerald-300 px-8 py-5 text-lg font-black text-slate-950 transition hover:scale-[1.02]">Kick off</button><Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-lg font-black transition hover:bg-white/15">Quit</Link></div></Panel></div>
}

function Lobby({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div><Title eyebrow="Local lobby" title="Phones ready. Players close." text="Create a room, join by code, then form teams before choosing a football mini-game." /><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{[{ icon: Plus, title: "Create match", text: "Generate a local room code and QR.", target: "create" as Screen }, { icon: LogIn, title: "Join team", text: "Join from your phone in the same room.", target: "join" as Screen }, { icon: Users, title: "Create teams", text: "Prepare team names and player order.", target: "teams" as Screen }].map((item) => <button key={item.title} onClick={() => setScreen(item.target)} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/50"><item.icon className="mb-5 h-10 w-10 text-emerald-300" /><h2 className="text-2xl font-black">{item.title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p></button>)}</div></div>
}

function CreateRoom({ code, setCode, setScreen }: { code: string; setCode: (code: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Create match" title="Invite the squad" text="This is a simulated local lobby. Everyone is physically together and uses their phone." /><Panel className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-10"><div className="mx-auto"><QrPattern code={code} /></div><div><p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Room code</p><div className="mt-4 inline-flex rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-4xl font-black tracking-[0.2em] md:text-6xl">{code}</div><p className="mt-5 text-slate-300">Scan, join, pick teams, and start a quick football party.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={() => setCode(generateCode())} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-4 font-black"><RefreshCw className="h-5 w-5" /> New code</button><button onClick={() => setScreen("teams")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950"><Check className="h-5 w-5" /> Teams ready</button></div></div></Panel></div>
}

function JoinRoom({ joinCode, setJoinCode, setScreen }: { joinCode: string; setJoinCode: (value: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-3xl"><Title eyebrow="Join" title="Enter the stadium" text="Scan the QR code or enter the room code from the organizer." /><Panel className="grid gap-4 p-6 md:grid-cols-2 md:p-8"><button onClick={() => setScreen("teams")} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 transition hover:bg-white/15"><ScanLine className="mx-auto mb-4 h-12 w-12 text-emerald-300" /><span className="text-xl font-black">Scan QR</span></button><div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="GL-000" className="mb-4 w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.2em] outline-none focus:border-emerald-300" /><button disabled={!joinCode.trim()} onClick={() => setScreen("teams")} className="w-full rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950 disabled:opacity-40">Join</button></div></Panel></div>
}

function Teams({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Teams" title="Create the dressing room" text="Teams are local simulated groups. Players rotate phone roles during mini-games." /><div className="grid gap-4 md:grid-cols-2">{teams.map((team) => <Panel key={team.id} className="overflow-hidden p-6"><div className={`mb-5 h-2 rounded-full bg-gradient-to-r ${team.color}`} /><h2 className="text-3xl font-black">{team.name}</h2><div className="mt-5 grid gap-2">{team.players.map((player) => <div key={player} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold">{player}</div>)}</div></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Choose mini-game</button></div>
}

function GameSelection({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Game selection" title="Choose the football challenge" text="Fast, social, competitive mini-games. Tactical match simulation is preview-only for now." /><div className="grid gap-4 md:grid-cols-3"><button onClick={() => setScreen("quiz-select")} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-300"><CircleHelp className="mb-5 h-12 w-12 text-emerald-300" /><h2 className="text-3xl font-black">Football Quiz</h2><p className="mt-3 text-slate-400">Individual answers, hidden scores, reveal every five questions.</p></button><button onClick={() => setScreen("rotation")} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-300"><Volleyball className="mb-5 h-12 w-12 text-emerald-300" /><h2 className="text-3xl font-black">Mime & Keyword</h2><p className="mt-3 text-slate-400">Team turns, quick guesses, football stars and clues.</p></button><button onClick={() => setScreen("simulation")} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left transition hover:-translate-y-1 hover:border-yellow-300"><Lock className="mb-5 h-12 w-12 text-yellow-300" /><h2 className="text-3xl font-black">Match Simulation</h2><p className="mt-3 text-slate-400">Locked tactical preview with passes, blocks, shots, and formations.</p></button></div></div>
}

function QuizSelect({ category, setCategory, loadQuiz }: { category: QuizCategory; setCategory: (category: QuizCategory) => void; loadQuiz: () => void }) {
  const categories: QuizCategory[] = ["Teams", "Players", "International Competitions"]
  return <div className="mx-auto max-w-5xl"><Title eyebrow="AI quiz generator" title="Pick a football theme" text="The quiz architecture validates structured question JSON with Zod and falls back visually if generation fails." /><div className="grid gap-3 md:grid-cols-3">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-2xl border p-5 text-left font-black ${category === item ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/10 bg-black/45"}`}>{item}</button>)}</div><Panel className="mt-5 p-5"><div className="flex items-start gap-3"><Bot className="h-7 w-7 text-emerald-300" /><p className="text-sm leading-7 text-slate-300">AI-ready flow: generateObject-style generation boundary, Zod schema validation, structured JSON shape, loading screen, error fallback, categories, answer choices, correct answers, and difficulty.</p></div></Panel><button onClick={loadQuiz} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Generate quiz</button></div>
}

function QuizLoading({ category }: { category: QuizCategory }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-xl p-8 text-center md:p-12"><Bot className="mx-auto mb-6 h-16 w-16 animate-pulse text-emerald-300" /><h1 className="text-4xl font-black">Generating questions</h1><p className="mt-5 text-slate-300">Theme: {category}. Building validated football JSON pack...</p></Panel></div>
}

function QuizQuestionScreen({ question, selected, setSelected, setScreen, aiError }: { question: QuizQuestion; selected: string; setSelected: (value: string) => void; setScreen: (screen: Screen) => void; aiError: string | null }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={`${question.category} · ${question.difficulty}`} title="Question on the pitch" text="Answer individually. Scores stay hidden until the ranking reveal." />{aiError && <Panel className="mb-4 border-yellow-300/30 p-4 text-sm text-yellow-100">{aiError}</Panel>}<Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-emerald-100"><Timer className="h-8 w-8" /><span className="text-6xl font-black tabular-nums">00:20</span></div><h2 className="text-center text-3xl font-black md:text-5xl">{question.question}</h2><div className="mt-8 grid gap-3 md:grid-cols-2">{question.choices.map((choice) => <button key={choice} onClick={() => setSelected(choice)} className={`rounded-2xl border p-5 text-left text-lg font-black ${selected === choice ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/10 bg-white/5"}`}>{choice}</button>)}</div><button disabled={!selected} onClick={() => setScreen("quiz-reveal")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950 disabled:opacity-40">Lock answer</button></Panel></div>
}

function QuizReveal({ question, selected, award, questionIndex, setQuestionIndex, setSelectedAnswer, setScreen }: { question: QuizQuestion; selected: string; award: () => void; questionIndex: number; setQuestionIndex: (value: number) => void; setSelectedAnswer: (value: string) => void; setScreen: (screen: Screen) => void }) {
  const correct = selected === question.answer
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><BadgeCheck className={`mx-auto mb-6 h-20 w-20 ${correct ? "text-emerald-300" : "text-red-300"}`} /><p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">VAR reveal</p><h1 className="mt-3 text-5xl font-black">{correct ? "Correct!" : "Missed!"}</h1><p className="mt-5 text-xl text-slate-200">Answer: <span className="font-black text-emerald-200">{question.answer}</span></p><button onClick={() => { if (correct) award(); setSelectedAnswer(""); if ((questionIndex + 1) % 5 === 0) setScreen("quiz-ranking"); else { setQuestionIndex(questionIndex + 1); setScreen("quiz-question") } }} className="mt-8 rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Continue</button></Panel></div>
}

function Ranking({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Hidden scores revealed" title="Leaderboard" text="Every five quiz rounds, the room sees who is actually leading." /><div className="grid gap-4 md:grid-cols-2">{[...teams].sort((a, b) => b.score - a.score).map((team, index) => <Panel key={team.id} className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Rank {index + 1}</p><h2 className="mt-2 text-3xl font-black">{team.name}</h2></div><p className="text-5xl font-black text-emerald-300">{team.score}</p></div></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Back to games</button></div>
}

function Rotation({ teams, turn, mode, setMode, setScreen }: { teams: Team[]; turn: number; mode: PartyMode; setMode: (mode: PartyMode) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Team rotation" title={`${teams[turn]?.name} plays now`} text="Choose mime or keyword. One player performs, teammates guess before time runs out." /><Panel className="p-6 md:p-8"><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setMode("mime")} className={`rounded-2xl px-5 py-5 font-black ${mode === "mime" ? "bg-emerald-300 text-slate-950" : "border border-white/15"}`}>Mime mode</button><button onClick={() => setMode("keyword")} className={`rounded-2xl px-5 py-5 font-black ${mode === "keyword" ? "bg-emerald-300 text-slate-950" : "border border-white/15"}`}>Keyword mode</button></div><button onClick={() => setScreen(mode)} className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-black text-slate-950">Start turn</button></Panel></div>
}

function MimeMode({ teams, turn, target, setTarget, award, nextTurn, setScreen }: { teams: Team[]; turn: number; target: string; setTarget: (target: string) => void; award: () => void; nextTurn: () => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Mime mode" title="No talking. Only gestures." text={`${teams[turn]?.name}: imitate the player. Teammates must guess before the timer ends.`} /><Panel className="p-8 text-center md:p-12"><Dumbbell className="mx-auto mb-6 h-16 w-16 text-emerald-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Miming player sees</p><h2 className="mt-3 text-5xl font-black">{target}</h2><div className="mt-8 text-8xl font-black tabular-nums text-emerald-300">00:45</div><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={() => setTarget(mimePlayers[Math.floor(Math.random() * mimePlayers.length)])} className="rounded-2xl border border-white/15 px-5 py-4 font-black">New player</button><button onClick={() => { award(); nextTurn(); setScreen("team-score") }} className="rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">Correct</button><button onClick={() => { nextTurn(); setScreen("team-score") }} className="rounded-2xl border border-red-300/30 px-5 py-4 font-black">Time out</button></div></Panel></div>
}

function KeywordMode({ teams, turn, card, nextCard, award, nextTurn, setScreen }: { teams: Team[]; turn: number; card: { clue: string; answer: string }; nextCard: () => void; award: () => void; nextTurn: () => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Keyword mode" title="One clue. One goal." text={`${teams[turn]?.name}: give the clue and let teammates guess the footballer.`} /><Panel className="p-8 text-center md:p-12"><KeyRound className="mx-auto mb-6 h-16 w-16 text-emerald-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Keyword</p><h2 className="mt-3 text-7xl font-black text-emerald-200">{card.clue}</h2><p className="mt-6 text-slate-400">Expected answer hidden from teammates: {card.answer}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={nextCard} className="rounded-2xl border border-white/15 px-5 py-4 font-black">New card</button><button onClick={() => { award(); nextTurn(); setScreen("team-score") }} className="rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">Correct</button><button onClick={() => { nextTurn(); setScreen("team-score") }} className="rounded-2xl border border-red-300/30 px-5 py-4 font-black">Miss</button></div></Panel></div>
}

function TeamScore({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Scoreboard" title="The match is alive" text="Scores update after each team turn. Keep the rhythm fast." /><div className="grid gap-4 md:grid-cols-2">{teams.map((team) => <Panel key={team.id} className="p-6"><div className={`mb-5 h-2 rounded-full bg-gradient-to-r ${team.color}`} /><h2 className="text-3xl font-black">{team.name}</h2><p className="mt-5 text-7xl font-black text-emerald-300">{team.score}</p></Panel>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => setScreen("rotation")} className="rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Next turn</button><button onClick={() => setScreen("results")} className="rounded-2xl border border-white/15 px-6 py-4 font-black">Final results</button></div></div>
}

function HistoryScreen() {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Match history" title="Broadcast timeline" text="A fast recap of goals, guesses, reveals, and team momentum." /><div className="grid gap-4 md:grid-cols-2">{matchHistory.map((item) => <Panel key={item} className="p-6"><History className="mb-5 h-9 w-9 text-emerald-300" /><p className="leading-7 text-slate-300">{item}</p></Panel>)}</div></div>
}

function Results({ teams, setScreen }: { teams: Team[]; setScreen: (screen: Screen) => void }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Full time" title="Final results" text="The leaderboard determines the winner. Celebrate, argue, restart." /><div className="space-y-3">{sorted.map((team, index) => <Panel key={team.id} className="p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><Medal className="h-9 w-9 text-emerald-300" /><div><p className="text-sm uppercase tracking-[0.25em] text-slate-500">Place {index + 1}</p><h2 className="text-2xl font-black">{team.name}</h2></div></div><p className="text-4xl font-black">{team.score}</p></div></Panel>)}</div><button onClick={() => setScreen("victory")} className="mt-6 w-full rounded-2xl bg-emerald-300 px-6 py-4 font-black text-slate-950">Lift trophy</button></div>
}

function Victory({ teams }: { teams: Team[] }) {
  const winner = [...teams].sort((a, b) => b.score - a.score)[0]
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Trophy className="mx-auto mb-6 h-24 w-24 text-yellow-300" /><p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Champions</p><h1 className="mt-3 text-5xl font-black md:text-7xl">{winner.name}</h1><p className="mt-5 text-slate-300">They win the GOAL!!! local multiplayer session.</p></Panel></div>
}

function SimulationLocked() {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Coming soon" title="Simulation Match" text="A premium tactical mode preview. Locked for now, not playable." /><Panel className="overflow-hidden p-6 md:p-8"><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.22),transparent_45%)] p-5"><div className="grid h-[420px] grid-cols-3 grid-rows-4 gap-4 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-950/20 p-5">{Array.from({ length: 12 }, (_, index) => <div key={index} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5"><Shield className="h-8 w-8 text-emerald-200" /></div>)}</div></div><div><Lock className="mb-5 h-14 w-14 text-yellow-300" /><h2 className="text-3xl font-black">Tactical system preview</h2><div className="mt-5 grid gap-3">{["Pass", "Interception", "Dribble", "Block", "Shot"].map((move) => <div key={move} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-black">{move}</div>)}</div><p className="mt-5 text-sm text-slate-400">Two teams will face off through tactical choices and player matchups. This mode remains locked.</p></div></div></Panel></div>
}
