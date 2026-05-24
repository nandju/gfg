"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, BadgeDollarSign, BarChart3, Check, ChevronRight, Clock, Crown, Dice5, Eye, Fingerprint, Gauge, History, Lock, LogIn, LucideIcon, MessageSquareWarning, QrCode, Radio, RefreshCw, ScanLine, ShieldAlert, Skull, Sparkles, Timer, Trophy, Users, Vote, X, Zap } from "lucide-react"

type Screen = "loader" | "menu" | "lobby" | "create" | "join" | "waiting" | "duos" | "games" | "poker" | "rps" | "signal" | "ranking" | "debate" | "vote" | "vote-correct" | "vote-incorrect" | "recompose" | "analysis" | "traitor" | "history" | "profiles" | "elimination" | "locked"
type PlayerStatus = "active" | "unstable" | "suspect" | "eliminated"
type VoteTone = "Silent" | "Aggressive" | "Suspicious" | "Defensive"

type Player = {
  id: string
  name: string
  code: string
  score: number
  status: PlayerStatus
  partner: string
  tone: VoteTone
}

const initialPlayers: Player[] = [
  { id: "p1", name: "NOVA", code: "A-01", score: 8.4, status: "active", partner: "MIRAGE", tone: "Silent" },
  { id: "p2", name: "MIRAGE", code: "A-02", score: 7.1, status: "suspect", partner: "NOVA", tone: "Defensive" },
  { id: "p3", name: "VANTA", code: "B-01", score: 6.8, status: "unstable", partner: "ORION", tone: "Aggressive" },
  { id: "p4", name: "ORION", code: "B-02", score: 5.9, status: "active", partner: "VANTA", tone: "Suspicious" },
  { id: "p5", name: "ECHO", code: "C-01", score: 4.6, status: "active", partner: "LYNX", tone: "Silent" },
  { id: "p6", name: "LYNX", code: "C-02", score: 3.2, status: "eliminated", partner: "ECHO", tone: "Defensive" }
]

const narrativeMessages = [
  "A traitor is among you.",
  "Trust is becoming dangerous.",
  "The scores are unstable.",
  "Someone is manipulating you.",
  "Your duo may not be yours anymore."
]

const alerts = [
  "A player suspects you.",
  "Your duo seems unstable.",
  "The system is watching your choices.",
  "One phone received a message before the others.",
  "A ranking movement cannot be explained yet."
]

const history = [
  "Round 01 closed with an unexplained score variation.",
  "Two partners reported incompatible instructions.",
  "Ranking updated without revealing calculation details.",
  "A private condition was accepted by an unknown player.",
  "A vote created more instability than certainty."
]

const trials = [
  { id: "monopolice", title: "MONOPOLICE OF THE KING", status: "Coming Soon", locked: true, text: "Strategic psychological race. The board is visible but sealed." },
  { id: "poker", title: "POKER FACE  LITTLE GIANT", status: "Playable simulation", locked: false, text: "Hidden logic. Choose, observe, deduce." },
  { id: "rps", title: "ROCK-PAPER KINGS", status: "Playable simulation", locked: false, text: "Simple gestures. Unclear consequences." },
  { id: "signal", title: "THE SIGNAL", status: "Playable simulation", locked: false, text: "Synchronization under pressure." }
]

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  return `CW-${alphabet[Math.floor(Math.random() * alphabet.length)]}${Math.floor(100 + Math.random() * 900)}`
}

function CageQr({ code }: { code: string }) {
  const cells = useMemo(() => Array.from({ length: 100 }, (_, index) => (code.charCodeAt(index % code.length) + index * 11) % 4 !== 0), [code])

  return <div className="grid h-52 w-52 grid-cols-10 gap-1 rounded-[2rem] bg-zinc-100 p-4 shadow-2xl shadow-red-950/40 md:h-64 md:w-64">{cells.map((active, index) => <div key={index} className={`rounded-[2px] ${active ? "bg-zinc-950" : "bg-zinc-100"}`} />)}</div>
}

function Shell({ children, screen, setScreen }: { children: React.ReactNode; screen: Screen; setScreen: (screen: Screen) => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0">
        <Image src="/cagewild/mobile4.png" alt="" fill priority className="object-cover md:hidden" />
        <Image src="/cagewild/desktop.png" alt="" fill priority className="hidden object-cover md:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.34),transparent_34%),radial-gradient(circle_at_bottom,rgba(127,29,29,0.22),transparent_38%),linear-gradient(180deg,rgba(9,9,11,0.62),rgba(9,9,11,0.97))]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:px-8">
        <button onClick={() => setScreen(screen === "menu" ? "menu" : "lobby")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold backdrop-blur-xl transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> {screen === "menu" ? "CAGE" : "Back"}</button>
        <div className="rounded-full border border-red-500/30 bg-red-950/25 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200 backdrop-blur-xl">Local Online</div>
      </header>
      <div className="relative z-10 min-h-screen px-4 pb-28 pt-24 md:px-8">{children}</div>
    </main>
  )
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[2rem] border border-white/10 bg-black/45 shadow-2xl shadow-black/40 backdrop-blur-xl ${className}`}>{children}</section>
}

function ScreenTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mx-auto mb-8 max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-7xl">{title}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">{text}</p></div>
}

function CinematicOverlay({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null
  return <button onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6 text-center backdrop-blur-sm"><div className="animate-in fade-in zoom-in-95 duration-700"><p className="text-xs font-black uppercase tracking-[0.45em] text-red-300">System broadcast</p><h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-zinc-100 md:text-7xl">{message}</h2><p className="mt-8 text-sm text-zinc-500">Tap to continue</p></div></button>
}

function ImmersiveNotification({ text, onClose }: { text: string | null; onClose: () => void }) {
  if (!text) return null
  return <div className="fixed right-4 top-24 z-40 max-w-sm animate-in slide-in-from-right-4 duration-500 rounded-[1.5rem] border border-red-400/30 bg-black/75 p-4 shadow-2xl shadow-red-950/50 backdrop-blur-xl"><div className="flex gap-3"><MessageSquareWarning className="h-6 w-6 shrink-0 text-red-300" /><div><p className="font-black">Private alert</p><p className="mt-1 text-sm text-zinc-300">{text}</p></div><button onClick={onClose}><X className="h-5 w-5" /></button></div></div>
}

export function CageWildExperience() {
  const [screen, setScreen] = useState<Screen>("loader")
  const [progress, setProgress] = useState(0)
  const [code, setCode] = useState(generateCode)
  const [joinCode, setJoinCode] = useState("")
  const [betrayal, setBetrayal] = useState(false)
  const [betrayalRecorded, setBetrayalRecorded] = useState(false)
  const [choice, setChoice] = useState("?")
  const [signalStop, setSignalStop] = useState<number | null>(null)
  const [voteTarget, setVoteTarget] = useState("MIRAGE")
  const [voteCorrect, setVoteCorrect] = useState(true)
  const [cinema, setCinema] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)

  useEffect(() => {
    if (screen !== "loader") return
    const assets = ["/cagewild/cover.png", "/cagewild/mobile4.png", "/cagewild/desktop.png", "/cagewild/Gemini_Generated_Image_om1y20om1y20om1y.png"]
    let loaded = 0
    let mounted = true
    const mark = () => {
      loaded += 1
      if (!mounted) return
      const next = Math.round((loaded / assets.length) * 100)
      setProgress(next)
      if (loaded === assets.length) requestAnimationFrame(() => requestAnimationFrame(() => setScreen("menu")))
    }
    assets.forEach((src) => {
      const image = new window.Image()
      image.onload = mark
      image.onerror = mark
      image.src = src
    })
    return () => {
      mounted = false
    }
  }, [screen])

  const openCinema = () => setCinema(narrativeMessages[Math.floor(Math.random() * narrativeMessages.length)])
  const openNotice = () => setNotice(alerts[Math.floor(Math.random() * alerts.length)])
  const resolveVote = () => setScreen(voteCorrect ? "vote-correct" : "vote-incorrect")
  const removePlayer = (name: string) => setPlayers((current) => current.map((player) => player.name === name || player.partner === name ? { ...player, status: "eliminated" } : player))

  if (screen === "loader") {
    return <main className="flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 text-zinc-100"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(127,29,29,.35),transparent_45%)]" /><div className="relative z-10 w-full max-w-sm text-center"><div className="relative mx-auto mb-7 h-28 w-28 overflow-hidden rounded-[2rem] border border-red-400/50 shadow-2xl shadow-red-950/60"><Image src="/cagewild/cover.png" alt="Cage Wild" fill priority className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.45em] text-red-300">Psychological link active</p><h1 className="mt-3 text-5xl font-black">CAGE WILD</h1><div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-800 via-red-400 to-zinc-100 transition-all duration-300" style={{ width: `${progress}%` }} /></div><p className="mt-4 text-sm text-zinc-400">Loading local pressure system... {progress}%</p></div></main>
  }

  return (
    <Shell screen={screen} setScreen={setScreen}>
      <CinematicOverlay message={cinema} onClose={() => setCinema(null)} />
      <ImmersiveNotification text={notice} onClose={() => setNotice(null)} />
      {betrayal && <BetrayalModal recorded={betrayalRecorded} onAccept={() => { setBetrayalRecorded(true); setNotice("Your choice has been recorded.") }} onDecline={() => { setBetrayal(false); setBetrayalRecorded(false) }} onClose={() => { setBetrayal(false); setBetrayalRecorded(false) }} />}

      {screen === "menu" && <Menu setScreen={setScreen} openCinema={openCinema} />}
      {screen === "lobby" && <Lobby setScreen={setScreen} />}
      {screen === "create" && <CreateRoom code={code} setCode={setCode} setScreen={setScreen} />}
      {screen === "join" && <JoinRoom joinCode={joinCode} setJoinCode={setJoinCode} setScreen={setScreen} />}
      {screen === "waiting" && <Waiting setScreen={setScreen} openNotice={openNotice} />}
      {screen === "duos" && <Duos players={players} setScreen={setScreen} />}
      {screen === "games" && <Games setScreen={setScreen} openCinema={openCinema} openNotice={openNotice} />}
      {screen === "locked" && <MonopolicePreview />}
      {screen === "poker" && <PokerFace setScreen={setScreen} openNotice={openNotice} />}
      {screen === "rps" && <RockPaperKings choice={choice} setChoice={setChoice} setScreen={setScreen} openBetrayal={() => setBetrayal(true)} />}
      {screen === "signal" && <Signal signalStop={signalStop} setSignalStop={setSignalStop} setScreen={setScreen} openNotice={openNotice} />}
      {screen === "ranking" && <Ranking players={players} setScreen={setScreen} />}
      {screen === "debate" && <Debate players={players} voteTarget={voteTarget} setVoteTarget={setVoteTarget} setScreen={setScreen} />}
      {screen === "vote" && <VoteScreen players={players} voteTarget={voteTarget} setVoteTarget={setVoteTarget} voteCorrect={voteCorrect} setVoteCorrect={setVoteCorrect} resolveVote={resolveVote} />}
      {screen === "vote-correct" && <VoteResult correct target={voteTarget} onContinue={() => { removePlayer(voteTarget); setScreen("recompose") }} />}
      {screen === "vote-incorrect" && <VoteResult target={voteTarget} onContinue={() => { removePlayer("NOVA"); setScreen("recompose") }} />}
      {screen === "recompose" && <Recompose players={players} setScreen={setScreen} />}
      {screen === "analysis" && <Analysis />}
      {screen === "elimination" && <VoteResult correct target={voteTarget} onContinue={() => setScreen("recompose")} />}
      {screen === "traitor" && <InfoGrid eyebrow="Private layer" title="Traitor screen" icon={Eye} items={["Secret offers can appear during any trial.", "Accepting alters local simulated outcomes immediately.", "The system never reveals traitor names publicly."]} />}
      {screen === "history" && <InfoGrid eyebrow="Archive" title="History" icon={History} items={history} />}
      {screen === "profiles" && <Profiles players={players} />}

      <nav className="fixed bottom-4 left-4 right-4 z-30 mx-auto grid max-w-3xl grid-cols-6 gap-2 rounded-[1.5rem] border border-white/10 bg-black/70 p-2 backdrop-blur-xl">
        {[{ s: "games", i: Trophy }, { s: "ranking", i: BarChart3 }, { s: "analysis", i: Sparkles }, { s: "traitor", i: ShieldAlert }, { s: "history", i: History }, { s: "profiles", i: Users }].map(({ s, i: Icon }) => <button key={s} onClick={() => setScreen(s as Screen)} className="flex items-center justify-center rounded-2xl py-3 text-zinc-300 transition hover:bg-white/10 hover:text-white"><Icon className="h-5 w-5" /></button>)}
      </nav>
    </Shell>
  )
}

function BetrayalModal({ recorded, onAccept, onDecline, onClose }: { recorded: boolean; onAccept: () => void; onDecline: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-5 backdrop-blur-md"><Panel className={`w-full max-w-lg p-7 text-center md:p-10 ${recorded ? "animate-pulse border-red-300/70 shadow-red-950/80" : ""}`}><ShieldAlert className="mx-auto mb-6 h-16 w-16 text-red-300" /><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">Private offer</p><h2 className="mt-4 text-4xl font-black">{recorded ? "Your choice has been recorded." : "Betray your partner to get more."}</h2><p className="mt-5 text-zinc-300">{recorded ? "The system will not explain what changed. Your partner will only see the consequences." : "This screen is visible only on this device. Accepting changes the next result silently."}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{recorded ? <button onClick={onClose} className="sm:col-span-2 rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Return to the game</button> : <><button onClick={onAccept} className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">ACCEPT</button><button onClick={onDecline} className="rounded-2xl border border-white/15 px-5 py-4 font-black">DECLINE</button></>}</div></Panel></div>
}

function Menu({ setScreen, openCinema }: { setScreen: (screen: Screen) => void; openCinema: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="w-full max-w-3xl p-6 text-center md:p-10"><div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-[2rem] border border-red-400/40 md:h-36 md:w-36"><Image src="/cagewild/cover.png" alt="Cage Wild" fill className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.4em] text-red-300">No one quits</p><h1 className="mt-3 text-5xl font-black md:text-8xl">CAGE WILD</h1><p className="mx-auto mt-5 max-w-xl text-zinc-300">A local multiplayer psychological experience for pairs. Phones carry secrets. Faces carry lies.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><button onClick={() => setScreen("lobby")} className="rounded-2xl bg-red-200 px-6 py-5 text-lg font-black text-zinc-950 transition hover:scale-[1.02]">Enter</button><button onClick={openCinema} className="rounded-2xl border border-red-300/30 bg-red-950/30 px-6 py-5 text-lg font-black">Broadcast</button><Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-lg font-black transition hover:bg-white/15">Quit platform</Link></div></Panel></div>
}

function Lobby({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div><ScreenTitle eyebrow="Local multiplayer" title="Face to face. Online inside." text="Create a room, join with a phone, form duos, receive hidden pressure, and interpret the ranking without seeing the full truth." /><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{[{ icon: QrCode, title: "Create game", text: "Generate a local QR code and lobby code.", target: "create" as Screen }, { icon: LogIn, title: "Join game", text: "Scan or enter the code. Wait for the organizer.", target: "join" as Screen }, { icon: Users, title: "Duo selection", text: "Pairs only. The system can reorganize after elimination.", target: "duos" as Screen }].map((item) => <button key={item.title} onClick={() => setScreen(item.target)} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-300/50"><item.icon className="mb-5 h-10 w-10 text-red-300" /><h2 className="text-2xl font-black">{item.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p></button>)}</div></div>
}

function CreateRoom({ code, setCode, setScreen }: { code: string; setCode: (code: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow="Organizer console" title="Open a local cage" text="The code is visible only long enough for nearby players to enter. This is simulated frontend logic." /><Panel className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-10"><div className="mx-auto"><CageQr code={code} /></div><div className="flex flex-col justify-center"><p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">Lobby code</p><div className="mt-4 inline-flex w-fit rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-4xl font-black tracking-[0.2em] md:text-6xl">{code}</div><p className="mt-5 text-zinc-300">Players join locally. Remote play is not represented here.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={() => setCode(generateCode())} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-4 font-black"><RefreshCw className="h-5 w-5" /> New code</button><button onClick={() => setScreen("duos")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950"><Check className="h-5 w-5" /> Lock room</button></div></div></Panel></div>
}

function JoinRoom({ joinCode, setJoinCode, setScreen }: { joinCode: string; setJoinCode: (code: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-3xl"><ScreenTitle eyebrow="Player device" title="Join the cage" text="Use the local code or QR code. After joining, wait until the organizer seals the room." /><Panel className="grid gap-4 p-6 md:grid-cols-2 md:p-8"><button onClick={() => setScreen("waiting")} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 transition hover:bg-white/15"><ScanLine className="mx-auto mb-4 h-12 w-12 text-red-300" /><span className="text-xl font-black">Scan QR</span></button><div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="CW-000" className="mb-4 w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.2em] outline-none focus:border-red-300" /><button disabled={!joinCode.trim()} onClick={() => setScreen("waiting")} className="w-full rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950 disabled:opacity-40">Join</button></div></Panel></div>
}

function Waiting({ setScreen, openNotice }: { setScreen: (screen: Screen) => void; openNotice: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-xl p-8 text-center md:p-12"><Radio className="mx-auto mb-6 h-16 w-16 animate-pulse text-red-300" /><h1 className="text-4xl font-black">Waiting for organizer</h1><p className="mt-5 text-zinc-300">Stay near your partner. You will not receive the same information.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={openNotice} className="rounded-2xl border border-white/15 px-6 py-4 font-black">Receive alert</button><button onClick={() => setScreen("duos")} className="rounded-2xl bg-red-200 px-6 py-4 font-black text-zinc-950">Simulate finish</button></div></Panel></div>
}

function Duos({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  const duos = [["NOVA", "MIRAGE"], ["VANTA", "ORION"], ["ECHO", "LYNX"]]
  return <div><ScreenTitle eyebrow="Pair system" title="Duo selection" text="Pairs are visible, but the pressure assigned to each device remains private." /><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{duos.map((duo, index) => { const broken = duo.some((name) => players.find((p) => p.name === name)?.status === "eliminated"); return <Panel key={duo.join("/")} className={`p-6 ${broken ? "border-red-300/50 bg-red-950/20" : ""}`}><div className="mb-5 flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-950/60 to-white/5"><Fingerprint className="h-10 w-10 text-red-300" /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Duo {index + 1}</p><h2 className="mt-2 text-2xl font-black">{duo.join(" / ")}</h2><p className="mt-3 text-sm text-zinc-400">{broken ? "Bond broken. One player stands alone." : "Link stable. Trust level unknown."}</p></Panel> })}</div><div className="mx-auto mt-6 flex max-w-6xl justify-center"><button onClick={() => setScreen("games")} className="rounded-2xl bg-red-200 px-8 py-4 font-black text-zinc-950">Choose trial</button></div></div>
}

function Games({ setScreen, openCinema, openNotice }: { setScreen: (screen: Screen) => void; openCinema: () => void; openNotice: () => void }) {
  return <div><ScreenTitle eyebrow="Trials" title="Games inside the cage" text="Some rules are visible. The important parts are not." /><div className="mx-auto mb-5 grid max-w-6xl gap-3 sm:grid-cols-2"><button onClick={openCinema} className="rounded-2xl border border-red-300/30 bg-red-950/25 px-5 py-4 font-black">Cinematic broadcast</button><button onClick={openNotice} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 font-black">Private notification</button></div><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">{trials.map((game) => <button key={game.id} onClick={() => setScreen(game.locked ? "locked" : game.id as Screen)} className="group rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-300/50"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">{game.status}</p><h2 className="mt-3 text-2xl font-black md:text-3xl">{game.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{game.text}</p></div>{game.locked ? <Lock className="h-8 w-8 text-zinc-500" /> : <ChevronRight className="h-8 w-8 text-red-300 transition group-hover:translate-x-1" />}</div></button>)}</div></div>
}

function MonopolicePreview() {
  const spaces = ["BONUS", "PASS", "VOID", "PENALTY", "NEUTRAL", "BREAK", "BONUS", "PENALTY", "KING", "PASS", "VOID", "END"]
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Coming soon" title="MONOPOLICE OF THE KING" text="The king has not opened the game, but the board already watches the players." /><div className="grid gap-5 lg:grid-cols-[1fr_340px]"><Panel className="p-5 md:p-8"><div className="grid grid-cols-3 gap-3 md:grid-cols-4">{spaces.map((space, index) => <div key={`${space}-${index}`} className={`flex aspect-square flex-col items-center justify-center rounded-2xl border text-center text-xs font-black ${space === "VOID" || space === "BREAK" ? "border-red-300/40 bg-red-950/40 text-red-100" : space === "BONUS" ? "border-emerald-300/30 bg-emerald-950/20 text-emerald-100" : "border-white/10 bg-white/5 text-zinc-300"}`}><span>{space}</span>{space === "KING" && <Lock className="mt-2 h-5 w-5" />}</div>)}</div></Panel><Panel className="p-6"><Dice5 className="mb-5 h-14 w-14 animate-pulse text-red-300" /><h2 className="text-3xl font-black">Preview sealed</h2><p className="mt-4 text-sm leading-7 text-zinc-300">One player rolls. The other suffers. Penalties reduce the pass gauge. Bonuses restore it. Destructive spaces remain classified.</p><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-500"><span>Pass gauge</span><span>63%</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[63%] rounded-full bg-gradient-to-r from-red-700 to-red-200" /></div></div><div className="mt-6 rounded-2xl border border-red-300/30 bg-red-950/20 p-4 text-center font-black text-red-100"><Lock className="mx-auto mb-2 h-6 w-6" />Coming soon</div></Panel></div></div>
}

function PokerFace({ setScreen, openNotice }: { setScreen: (screen: Screen) => void; openNotice: () => void }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow="Hidden logic" title="POKER FACE" text="Enter a number. Choose a hand. The system appears to calculate, but never tells the full truth." /><Panel className="grid gap-5 p-6 md:grid-cols-2 md:p-8"><div className="rounded-[1.5rem] bg-white/5 p-6"><p className="text-sm text-zinc-400">Secret number</p><div className="mt-4 grid grid-cols-6 gap-2">{Array.from({ length: 11 }, (_, i) => <button key={i} className="rounded-xl border border-white/10 py-3 font-black hover:border-red-300">{i}</button>)}</div></div><div className="rounded-[1.5rem] bg-white/5 p-6"><p className="text-sm text-zinc-400">Mental analysis</p><div className="mt-5 space-y-3">{["Average forming...", "False clue injected", "Pattern unstable"].map((item, index) => <div key={item} className="rounded-xl bg-black/35 p-3 text-sm text-zinc-300"><span className="mr-3 text-red-300">0{index + 1}</span>{item}</div>)}</div><div className="mt-5 flex gap-2 text-xs text-zinc-500">{[6.4, 2.1, 5.8, 4.9].map((avg) => <span key={avg} className="rounded-full bg-white/10 px-3 py-1">avg {avg}</span>)}</div></div></Panel><div className="mt-5 grid gap-3 sm:grid-cols-3"><button onClick={openNotice} className="rounded-2xl border border-white/15 px-5 py-4 font-black">False clue</button><button className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Strong hand</button><button onClick={() => setScreen("ranking")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Seal</button></div></div>
}

function RockPaperKings({ choice, setChoice, setScreen, openBetrayal }: { choice: string; setChoice: (choice: string) => void; setScreen: (screen: Screen) => void; openBetrayal: () => void }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow="Every 3 rounds ranking appears" title="ROCK-PAPER KINGS" text="Choose a gesture. The reveal is slow. Your partner may not remain aligned." /><div className="grid gap-4 md:grid-cols-3">{["Rock", "Paper", "Scissors"].map((item) => <button key={item} onClick={() => setChoice(item)} className={`rounded-[2rem] border p-8 text-3xl font-black transition hover:-translate-y-1 ${choice === item ? "border-red-300 bg-red-200 text-zinc-950" : "border-white/10 bg-black/45"}`}>{item}</button>)}</div><Panel className="mt-5 p-6 text-center"><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">Slow reveal</p><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-white/5 p-5"><p className="text-3xl"></p><p className="mt-2 text-xs text-zinc-500">You</p></div><div className="rounded-2xl bg-red-950/30 p-5 animate-pulse"><p className="text-3xl">?</p><p className="mt-2 text-xs text-zinc-500">Partner</p></div><div className="rounded-2xl bg-white/5 p-5"><p className="text-3xl">?</p><p className="mt-2 text-xs text-zinc-500">Opponent</p></div></div><p className="mt-5 text-sm text-zinc-400">The system reports confidence, then withdraws it.</p></Panel><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={openBetrayal} className="flex-1 rounded-2xl border border-red-400/40 bg-red-950/30 px-5 py-4 font-black text-red-100">Trigger secret offer</button><button onClick={() => setScreen("ranking")} className="flex-1 rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Ambiguous result</button></div></div>
}

function Signal({ signalStop, setSignalStop, setScreen, openNotice }: { signalStop: number | null; setSignalStop: (value: number) => void; setScreen: (screen: Screen) => void; openNotice: () => void }) {
  return <div className="mx-auto max-w-3xl"><ScreenTitle eyebrow="Secret synchronization" title="THE SIGNAL" text="One phone knows the time. The partner must resist false signals and visual pressure." /><Panel className="p-8 text-center md:p-12"><div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-full border border-red-300/30 bg-red-950/20 shadow-2xl shadow-red-950/40"><Zap className="h-16 w-16 animate-pulse text-red-300" /></div><div className="text-7xl font-black tabular-nums md:text-9xl">00:{signalStop ?? "??"}</div><div className="mt-6 grid grid-cols-5 gap-2">{Array.from({ length: 15 }, (_, index) => <div key={index} className={`h-2 rounded-full ${index % 4 === 0 ? "bg-red-300 animate-pulse" : "bg-white/10"}`} />)}</div><p className="mt-5 text-zinc-400">False beats may appear before the real window.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={openNotice} className="rounded-2xl border border-white/15 px-5 py-4 font-black">False signal</button><button onClick={() => setSignalStop(Math.floor(15 + Math.random() * 46))} className="rounded-2xl border border-red-300/40 bg-red-950/25 px-5 py-4 font-black">STOP</button><button onClick={() => setScreen("ranking")} className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Rank</button></div></Panel></div>
}

function Ranking({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Indirect truth" title="Ranking" text="No formulas. No exact explanation. Only movement, suspicion, and interpretation." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="overflow-hidden p-4 md:p-6">{players.map((player, index) => <div key={player.id} className="mb-3 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-200 font-black text-zinc-950">{index + 1}</div><div className="flex-1"><p className="font-black">{player.name}</p><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{player.code}  {player.status}</p></div><div className="text-right"><p className="text-2xl font-black">{player.score.toFixed(1)}P</p><p className="text-xs text-zinc-500">estimated</p></div></div>)}</Panel><Panel className="p-6"><AlertTriangle className="mb-4 h-10 w-10 text-red-300" /><h2 className="text-2xl font-black">Traitor count</h2><p className="mt-3 text-5xl font-black">1?</p><p className="mt-3 text-sm text-zinc-400">The system indicates instability, but no name is revealed.</p><div className="mt-6 grid gap-3"><button onClick={() => setScreen("debate")} className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Start debate</button><button onClick={() => setScreen("analysis")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Analysis</button></div></Panel></div></div>
}

function Debate({ players, voteTarget, setVoteTarget, setScreen }: { players: Player[]; voteTarget: string; setVoteTarget: (target: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Accusation phase" title="Speak before the vote" text="Select a suspect, defend your position verbally, and watch how each portrait behaves under pressure." /><Panel className="p-6 md:p-8"><div className="mb-8 flex items-center justify-center gap-3 text-red-200"><Clock className="h-8 w-8" /><span className="text-6xl font-black tabular-nums md:text-8xl">01:15</span></div><div className="grid gap-3 md:grid-cols-3">{players.filter((p) => p.status !== "eliminated").map((player) => <button key={player.id} onClick={() => setVoteTarget(player.name)} className={`rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-1 ${voteTarget === player.name ? "border-red-300 bg-red-200 text-zinc-950" : "border-white/10 bg-white/5"}`}><div className="mb-4 flex h-20 items-center justify-center rounded-2xl bg-black/25"><Eye className="h-8 w-8" /></div><p className="text-xl font-black">{player.name}</p><p className="text-sm opacity-70">{player.tone}</p></button>)}</div><button onClick={() => setScreen("vote")} className="mt-6 w-full rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Confirm accusation</button></Panel></div>
}

function VoteScreen({ players, voteTarget, setVoteTarget, voteCorrect, setVoteCorrect, resolveVote }: { players: Player[]; voteTarget: string; setVoteTarget: (target: string) => void; voteCorrect: boolean; setVoteCorrect: (value: boolean) => void; resolveVote: () => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Public vote" title="Choose who disappears" text="This frontend simulation lets you preview both correct and incorrect psychological resolutions." /><Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-red-200"><Vote className="h-8 w-8" /><span className="text-5xl font-black tabular-nums">00:45</span></div><div className="grid gap-3 md:grid-cols-3">{players.filter((p) => p.status !== "eliminated").map((player) => <button key={player.id} onClick={() => setVoteTarget(player.name)} className={`rounded-2xl border p-5 text-left ${voteTarget === player.name ? "border-red-300 bg-red-200 text-zinc-950" : "border-white/10 bg-white/5"}`}><p className="text-xl font-black">{player.name}</p><p className="text-sm opacity-70">{player.code}  {player.tone}</p></button>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><button onClick={() => setVoteCorrect(true)} className={`rounded-2xl px-5 py-4 font-black ${voteCorrect ? "bg-red-200 text-zinc-950" : "border border-white/15"}`}>Correct vote</button><button onClick={() => setVoteCorrect(false)} className={`rounded-2xl px-5 py-4 font-black ${!voteCorrect ? "bg-red-200 text-zinc-950" : "border border-white/15"}`}>Incorrect vote</button><button onClick={resolveVote} className="rounded-2xl border border-red-300/40 bg-red-950/30 px-5 py-4 font-black text-red-100">Reveal</button></div></Panel></div>
}

function VoteResult({ correct = false, target, onContinue }: { correct?: boolean; target: string; onContinue: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Skull className="mx-auto mb-6 h-20 w-20 animate-pulse text-red-300" /><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">{correct ? "Correct vote" : "Incorrect vote"}</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{correct ? `${target} disappears` : "The real traitor is still among you."}</h1><p className="mt-5 text-zinc-300">{correct ? "A traitor has been removed. Their partner also loses their place in the cage." : "The main accuser disappears. The group must live with the mistake."}</p><button onClick={onContinue} className="mt-8 rounded-2xl bg-red-200 px-6 py-4 font-black text-zinc-950">Continue</button></Panel></div>
}

function Recompose({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Recomposition" title="Trust has been broken" text="A disappearance breaks a duo. The system searches for new pairs without asking whether anyone is ready." /><div className="grid gap-4 md:grid-cols-3">{players.filter((p) => p.status !== "eliminated").slice(0, 3).map((player, index) => <Panel key={player.id} className="p-6"><div className="mb-5 flex h-24 items-center justify-center rounded-2xl bg-red-950/25"><Fingerprint className="h-10 w-10 text-red-300" /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">New link {index + 1}</p><h2 className="mt-2 text-2xl font-black">{player.name}</h2><p className="mt-3 text-sm text-zinc-400">Searching for a compatible survivor...</p></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-red-200 px-6 py-4 font-black text-zinc-950">Accept new order</button></div>
}

function Analysis() {
  const items = ["One player has more points than their partner.", "An anomaly has been detected.", "The results seem inconsistent.", "A private choice may have influenced a public result.", "Trust coefficient is decreasing.", "Point discrepancies are growing silently."]
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Psychological analysis" title="Ambiguous statistics" text="The system shows suspicious patterns, never proof." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <Panel key={item} className="p-6"><Gauge className="mb-5 h-10 w-10 text-red-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Signal {index + 1}</p><h2 className="mt-3 text-xl font-black leading-8">{item}</h2><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-200" style={{ width: `${52 + index * 7}%` }} /></div></Panel>)}</div></div>
}

function InfoGrid({ eyebrow, title, icon: Icon, items }: { eyebrow: string; title: string; icon: LucideIcon; items: string[] }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow={eyebrow} title={title} text="Information is partial by design. The system gives enough to create doubt, never enough to create certainty." /><div className="grid gap-4 md:grid-cols-3">{items.map((item) => <Panel key={item} className="p-6"><Icon className="mb-5 h-9 w-9 text-red-300" /><p className="leading-7 text-zinc-300">{item}</p></Panel>)}</div></div>
}

function Profiles({ players }: { players: Player[] }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Players" title="Profiles" text="Portraits, status, partners, and incomplete financial pressure indicators." /><div className="grid gap-4 md:grid-cols-3">{players.map((player) => <Panel key={player.id} className={`p-6 ${player.status === "eliminated" ? "opacity-45 grayscale" : ""}`}><div className="mb-5 flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-950/70 to-white/5"><Crown className="h-10 w-10 text-red-300" /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">{player.code}</p><h2 className="mt-2 text-2xl font-black">{player.name}</h2><p className="mt-2 text-sm text-zinc-400">Partner: {player.partner}</p><p className="mt-1 text-sm text-zinc-500">Status: {player.status}</p><div className="mt-5 flex items-center gap-2 text-red-200"><BadgeDollarSign className="h-5 w-5" /><span className="font-black">{player.score.toFixed(1)}P</span></div></Panel>)}</div></div>
}
