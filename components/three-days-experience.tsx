"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, BadgeCheck, BookOpen, Check, Clock, Crown, Eye, Fingerprint, Gavel, History, Hourglass, KeyRound, LogIn, LucideIcon, MessageCircleWarning, Moon, QrCode, Radio, RefreshCw, ScanLine, ScrollText, ShieldQuestion, Skull, Sparkles, Timer, UserRound, Users, X } from "lucide-react"

type Screen = "loader" | "menu" | "lobby" | "create" | "join" | "waiting" | "foram-select" | "wish" | "wish-review" | "conditions" | "player" | "foram" | "round" | "transition" | "accusation" | "reveal" | "elimination" | "survivors" | "history" | "profiles" | "end"
type Role = "player" | "foram"
type PlayerStatus = "alive" | "watched" | "suspected" | "eliminated"

type Player = {
  id: string
  name: string
  code: string
  status: PlayerStatus
  condition: string
  progress: number
}

const initialPlayers: Player[] = [
  { id: "p1", name: "NOVA", code: "W-01", status: "alive", condition: "Make someone say football.", progress: 42 },
  { id: "p2", name: "MIRAGE", code: "W-02", status: "watched", condition: "Make a player laugh sincerely.", progress: 61 },
  { id: "p3", name: "VANTA", code: "W-03", status: "suspected", condition: "Get someone to repeat a forbidden word.", progress: 27 },
  { id: "p4", name: "ORION", code: "W-04", status: "alive", condition: "Make someone confess a private preference.", progress: 54 }
]

const wishIdeas = [
  "Never say yes.",
  "Remain standing throughout the game.",
  "End every sentence with sheep.",
  "Never cross your arms.",
  "Speak slowly before answering.",
  "Never use a player's real name."
]

const conditionIdeas = [
  "Get someone to say football.",
  "Make someone laugh.",
  "Make a player lie.",
  "Get someone to repeat a specific word.",
  "Provoke a visible reaction.",
  "Make someone confess who they admire.",
  "Get someone to say no twice.",
  "Make a player look away.",
  "Convince someone to change seat.",
  "Make someone ask if you are lying."
]

const events = [
  "Someone is watching you.",
  "Your behavior seems strange.",
  "The Foram doubts you.",
  "A player suspects you.",
  "Your wish is becoming dangerous.",
  "A condition may have been guessed."
]

const log = [
  "The wish was proposed and accepted by the table.",
  "The Foram modified the atmosphere before round one.",
  "A player asked too many questions about another player's behavior.",
  "The observer detected hesitation during a public answer."
]

function generateCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  return `TD-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(100 + Math.random() * 900)}`
}

function ThreeQr({ code }: { code: string }) {
  const cells = useMemo(() => Array.from({ length: 81 }, (_, index) => (code.charCodeAt(index % code.length) + index * 13) % 4 !== 0), [code])
  return <div className="grid h-48 w-48 grid-cols-9 gap-1 rounded-[2rem] bg-stone-100 p-4 shadow-2xl shadow-amber-950/40 md:h-60 md:w-60">{cells.map((active, index) => <div key={index} className={`rounded-[2px] ${active ? "bg-stone-950" : "bg-stone-100"}`} />)}</div>
}

function Shell({ children, screen, setScreen, role }: { children: React.ReactNode; screen: Screen; setScreen: (screen: Screen) => void; role: Role }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-100">
      <div className="fixed inset-0">
        <Image src="/threedays/mobile7.png" alt="" fill priority className="object-cover md:hidden" />
        <Image src="/threedays/desktop.png" alt="" fill priority className="hidden object-cover md:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,.24),transparent_34%),linear-gradient(180deg,rgba(12,10,9,.66),rgba(12,10,9,.96))]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:px-8">
        <button onClick={() => setScreen(screen === "menu" ? "menu" : "lobby")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold backdrop-blur-xl transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> {screen === "menu" ? "THREE" : "Back"}</button>
        <div className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.25em] backdrop-blur-xl ${role === "foram" ? "border-amber-300/40 bg-amber-950/30 text-amber-100" : "border-white/10 bg-black/35 text-stone-300"}`}>{role === "foram" ? "FORAM" : "PLAYER"}</div>
      </header>
      <div className="relative z-10 min-h-screen px-4 pb-28 pt-24 md:px-8">{children}</div>
    </main>
  )
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[2rem] border border-white/10 bg-black/45 shadow-2xl shadow-black/40 backdrop-blur-xl ${className}`}>{children}</section>
}

function Title({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mx-auto mb-8 max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-7xl">{title}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-300 md:text-base">{text}</p></div>
}

function EventNotice({ text, onClose }: { text: string | null; onClose: () => void }) {
  if (!text) return null
  return <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-500 rounded-[1.5rem] border border-amber-200/25 bg-black/75 p-4 shadow-2xl shadow-amber-950/40 backdrop-blur-xl md:left-auto md:right-6"><div className="flex gap-3"><MessageCircleWarning className="h-6 w-6 shrink-0 text-amber-200" /><div className="flex-1"><p className="font-black">Silent observer</p><p className="mt-1 text-sm text-stone-300">{text}</p></div><button onClick={onClose}><X className="h-5 w-5" /></button></div></div>
}

export function ThreeDaysExperience() {
  const [screen, setScreen] = useState<Screen>("loader")
  const [role, setRole] = useState<Role>("player")
  const [progress, setProgress] = useState(0)
  const [code, setCode] = useState(generateCode)
  const [joinCode, setJoinCode] = useState("")
  const [round, setRound] = useState(1)
  const [duration, setDuration] = useState(5)
  const [wish, setWish] = useState("Never say yes.")
  const [condition, setCondition] = useState(conditionIdeas[0])
  const [accused, setAccused] = useState("VANTA")
  const [correctAccusation, setCorrectAccusation] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)

  useEffect(() => {
    if (screen !== "loader") return
    const assets = ["/threedays/cover.png", "/threedays/mobile7.png", "/threedays/desktop.png"]
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

  const randomEvent = () => setNotice(events[Math.floor(Math.random() * events.length)])
  const eliminate = (name: string) => setPlayers((current) => current.map((player) => player.name === name ? { ...player, status: "eliminated" } : player))

  if (screen === "loader") {
    return <main className="flex min-h-screen items-center justify-center overflow-hidden bg-stone-950 px-6 text-stone-100"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(146,64,14,.32),transparent_45%)]" /><div className="relative z-10 w-full max-w-sm text-center"><div className="relative mx-auto mb-7 h-28 w-28 overflow-hidden rounded-[2rem] border border-amber-200/40 shadow-2xl shadow-amber-950/60"><Image src="/threedays/cover.png" alt="THREE DAYS" fill priority className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.45em] text-amber-200">Wish detected</p><h1 className="mt-3 text-5xl font-black">THREE DAYS</h1><div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-900 via-amber-200 to-stone-100 transition-all duration-300" style={{ width: `${progress}%` }} /></div><p className="mt-4 text-sm text-stone-400">Preparing the silent observer... {progress}%</p></div></main>
  }

  return (
    <Shell screen={screen} setScreen={setScreen} role={role}>
      <EventNotice text={notice} onClose={() => setNotice(null)} />
      {screen === "menu" && <Menu setScreen={setScreen} />}
      {screen === "lobby" && <Lobby setScreen={setScreen} />}
      {screen === "create" && <CreateRoom code={code} setCode={setCode} duration={duration} setDuration={setDuration} setScreen={setScreen} />}
      {screen === "join" && <JoinRoom joinCode={joinCode} setJoinCode={setJoinCode} setScreen={setScreen} />}
      {screen === "waiting" && <Waiting setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "foram-select" && <ForamSelect role={role} setRole={setRole} setScreen={setScreen} />}
      {screen === "wish" && <WishProposal wish={wish} setWish={setWish} setScreen={setScreen} />}
      {screen === "wish-review" && <WishReview wish={wish} setWish={setWish} setScreen={setScreen} />}
      {screen === "conditions" && <Conditions condition={condition} setCondition={setCondition} setScreen={setScreen} />}
      {screen === "player" && <PlayerConsole wish={wish} condition={condition} round={round} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "foram" && <ForamConsole players={players} wish={wish} round={round} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "round" && <RoundTimer duration={duration} round={round} setRound={setRound} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "transition" && <RoundTransition round={round} setScreen={setScreen} />}
      {screen === "accusation" && <Accusation players={players} accused={accused} setAccused={setAccused} correct={correctAccusation} setCorrect={setCorrectAccusation} setScreen={setScreen} />}
      {screen === "reveal" && <Reveal accused={accused} correct={correctAccusation} onContinue={() => { if (correctAccusation) eliminate(accused); setScreen("elimination") }} />}
      {screen === "elimination" && <Elimination players={players} accused={accused} correct={correctAccusation} setScreen={setScreen} />}
      {screen === "survivors" && <Survivors players={players} setScreen={setScreen} />}
      {screen === "history" && <InfoGrid eyebrow="Archive" title="History" icon={History} items={log} />}
      {screen === "profiles" && <Profiles players={players} />}
      {screen === "end" && <EndGame players={players} />}

      <nav className="fixed bottom-4 left-4 right-4 z-30 mx-auto grid max-w-3xl grid-cols-6 gap-2 rounded-[1.5rem] border border-white/10 bg-black/70 p-2 backdrop-blur-xl">
        {[{ s: "player", i: UserRound }, { s: "foram", i: Crown }, { s: "round", i: Timer }, { s: "accusation", i: ShieldQuestion }, { s: "history", i: History }, { s: "profiles", i: Users }].map(({ s, i: Icon }) => <button key={s} onClick={() => setScreen(s as Screen)} className="flex items-center justify-center rounded-2xl py-3 text-stone-300 transition hover:bg-white/10 hover:text-white"><Icon className="h-5 w-5" /></button>)}
      </nav>
    </Shell>
  )
}

function Menu({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="w-full max-w-3xl p-6 text-center md:p-10"><div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-[2rem] border border-amber-200/40 md:h-36 md:w-36"><Image src="/threedays/cover.png" alt="THREE DAYS" fill className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.4em] text-amber-200">The wish is granted</p><h1 className="mt-3 text-5xl font-black md:text-8xl">THREE DAYS</h1><p className="mx-auto mt-5 max-w-xl text-stone-300">Make a wish. Survive three rounds. Never let anyone guess what will save you.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><button onClick={() => setScreen("lobby")} className="rounded-2xl bg-amber-100 px-8 py-5 text-lg font-black text-stone-950 transition hover:scale-[1.02]">Begin</button><Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-lg font-black transition hover:bg-white/15">Return</Link></div></Panel></div>
}

function Lobby({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div><Title eyebrow="Local play" title="The phone only observes" text="Players interact face to face. The phone hides conditions, manages the wish, and decides who disappears." /><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{[{ icon: QrCode, title: "Create game", text: "Generate local code and choose round duration.", target: "create" as Screen }, { icon: LogIn, title: "Join game", text: "Enter the room and wait for the Foram.", target: "join" as Screen }, { icon: Crown, title: "Choose Foram", text: "Assign the administrator who grants wishes.", target: "foram-select" as Screen }].map((item) => <button key={item.title} onClick={() => setScreen(item.target)} className="rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-200/50"><item.icon className="mb-5 h-10 w-10 text-amber-200" /><h2 className="text-2xl font-black">{item.title}</h2><p className="mt-3 text-sm leading-6 text-stone-400">{item.text}</p></button>)}</div></div>
}

function CreateRoom({ code, setCode, duration, setDuration, setScreen }: { code: string; setCode: (code: string) => void; duration: number; setDuration: (value: number) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Create room" title="Open the three days" text="Choose the pressure duration. This is a local simulated lobby for players in the same room." /><Panel className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-10"><div className="mx-auto"><ThreeQr code={code} /></div><div><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Room code</p><div className="mt-4 inline-flex rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-4xl font-black tracking-[0.2em] md:text-6xl">{code}</div><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => setDuration(5)} className={`rounded-2xl px-5 py-4 font-black ${duration === 5 ? "bg-amber-100 text-stone-950" : "border border-white/15"}`}>5 min</button><button onClick={() => setDuration(10)} className={`rounded-2xl px-5 py-4 font-black ${duration === 10 ? "bg-amber-100 text-stone-950" : "border border-white/15"}`}>10 min</button></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={() => setCode(generateCode())} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-4 font-black"><RefreshCw className="h-5 w-5" /> New code</button><button onClick={() => setScreen("foram-select")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950"><Check className="h-5 w-5" /> Continue</button></div></div></Panel></div>
}

function JoinRoom({ joinCode, setJoinCode, setScreen }: { joinCode: string; setJoinCode: (value: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-3xl"><Title eyebrow="Player device" title="Join the wish" text="Scan the code or enter it. Your condition will remain private." /><Panel className="grid gap-4 p-6 md:grid-cols-2 md:p-8"><button onClick={() => setScreen("waiting")} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 transition hover:bg-white/15"><ScanLine className="mx-auto mb-4 h-12 w-12 text-amber-200" /><span className="text-xl font-black">Scan QR</span></button><div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="TD-000" className="mb-4 w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.2em] outline-none focus:border-amber-200" /><button disabled={!joinCode.trim()} onClick={() => setScreen("waiting")} className="w-full rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950 disabled:opacity-40">Join</button></div></Panel></div>
}

function Waiting({ setScreen, randomEvent }: { setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-xl p-8 text-center md:p-12"><Radio className="mx-auto mb-6 h-16 w-16 animate-pulse text-amber-200" /><h1 className="text-4xl font-black">Waiting for the Foram</h1><p className="mt-5 text-stone-300">The room is quiet. The wish has not been granted yet.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={randomEvent} className="rounded-2xl border border-white/15 px-6 py-4 font-black">Psychological event</button><button onClick={() => setScreen("foram-select")} className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continue</button></div></Panel></div>
}

function ForamSelect({ role, setRole, setScreen }: { role: Role; setRole: (role: Role) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="The Foram" title="Who grants the wish?" text="The Foram manages the game and tries to defeat the players before the third round ends." /><div className="grid gap-4 md:grid-cols-2"><button onClick={() => setRole("player")} className={`rounded-[2rem] border p-8 text-left ${role === "player" ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-black/45"}`}><Users className="mb-5 h-12 w-12" /><h2 className="text-3xl font-black">Player</h2><p className="mt-3 text-sm opacity-75">Hide your secret condition and survive.</p></button><button onClick={() => setRole("foram")} className={`rounded-[2rem] border p-8 text-left ${role === "foram" ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-black/45"}`}><Crown className="mb-5 h-12 w-12" /><h2 className="text-3xl font-black">Foram</h2><p className="mt-3 text-sm opacity-75">Grant wishes, monitor behavior, trigger reveals.</p></button></div><button onClick={() => setScreen("wish")} className="mt-6 w-full rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continue to wishes</button></div>
}

function WishProposal({ wish, setWish, setScreen }: { wish: string; setWish: (wish: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Wish proposal" title="Choose the rule that will haunt everyone" text="Every wish becomes a real prohibition or obligation during the game." /><div className="grid gap-3 md:grid-cols-2">{wishIdeas.map((item) => <button key={item} onClick={() => setWish(item)} className={`rounded-2xl border p-5 text-left font-black ${wish === item ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-black/45"}`}>{item}</button>)}</div><button onClick={() => setScreen("wish-review")} className="mt-6 w-full rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Submit to Foram</button></div>
}

function WishReview({ wish, setWish, setScreen }: { wish: string; setWish: (wish: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Foram validation" title="Grant or reject" text="Players may give opinions, but the Foram decides the final wish." /><Panel className="p-8 text-center"><Gavel className="mx-auto mb-6 h-16 w-16 text-amber-200" /><p className="text-3xl font-black">{wish}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={() => setWish(wishIdeas[Math.floor(Math.random() * wishIdeas.length)])} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Reject</button><button className="rounded-2xl border border-white/15 px-5 py-4 font-black">Discuss</button><button onClick={() => setScreen("conditions")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Validate</button></div></Panel></div>
}

function Conditions({ condition, setCondition, setScreen }: { condition: string; setCondition: (condition: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Secret conditions" title="Write ten. Receive one." text="If anyone guesses your condition, you lose immediately." /><Panel className="p-6 md:p-8"><div className="grid gap-2 md:grid-cols-2">{conditionIdeas.map((item, index) => <button key={item} onClick={() => setCondition(item)} className={`rounded-xl border p-3 text-left text-sm ${condition === item ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-white/5"}`}>0{index + 1}. {item}</button>)}</div><div className="mt-6 rounded-2xl border border-amber-200/30 bg-amber-950/20 p-5"><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Selected by system</p><p className="mt-2 text-2xl font-black">{condition}</p></div><button onClick={() => setScreen("player")} className="mt-6 w-full rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Hide condition</button></Panel></div>
}

function PlayerConsole({ wish, condition, round, setScreen, randomEvent }: { wish: string; condition: string; round: number; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Player screen" title="Do not get discovered" text="Your phone knows what can save you. Everyone else only sees your behavior." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="p-6"><KeyRound className="mb-5 h-12 w-12 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Secret condition</p><h2 className="mt-3 text-3xl font-black">{condition}</h2><p className="mt-4 text-stone-300">If the Foram or another player guesses this condition, you lose immediately.</p></Panel><Panel className="p-6"><ScrollText className="mb-5 h-12 w-12 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Active wish</p><h2 className="mt-3 text-2xl font-black">{wish}</h2><p className="mt-3 text-sm text-stone-400">Round {round}/3</p></Panel></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><button onClick={() => setScreen("round")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Start round</button><button onClick={() => setScreen("accusation")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Accuse</button><button onClick={randomEvent} className="rounded-2xl border border-amber-200/30 bg-amber-950/20 px-5 py-4 font-black">Event</button></div></div>
}

function ForamConsole({ players, wish, round, setScreen, randomEvent }: { players: Player[]; wish: string; round: number; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Foram interface" title="Grant. Watch. End." text="The Foram sees more than players, but still not everything. Power should feel dangerous." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="p-5 md:p-6">{players.map((player) => <div key={player.id} className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between"><div><p className="font-black">{player.name}</p><p className="text-xs uppercase tracking-[0.2em] text-stone-500">{player.code} · {player.status}</p></div><p className="text-2xl font-black text-amber-100">{player.progress}%</p></div><p className="mt-2 text-xs text-stone-500">Hidden activity signal only. Not proof.</p></div>)}</Panel><Panel className="p-6"><Crown className="mb-5 h-12 w-12 text-amber-200" /><h2 className="text-2xl font-black">Foram controls</h2><p className="mt-3 text-sm text-stone-400">Wish: {wish}</p><p className="mt-2 text-sm text-stone-400">Round {round}/3</p><div className="mt-6 grid gap-3"><button onClick={randomEvent} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Launch event</button><button onClick={() => setScreen("accusation")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Check condition</button><button onClick={() => setScreen("elimination")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Announce elimination</button></div></Panel></div></div>
}

function RoundTimer({ duration, round, setRound, setScreen, randomEvent }: { duration: number; round: number; setRound: (round: number) => void; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Round timer" title={`Day ${round}`} text="The timer manages pressure. The real game happens between the players." /><Panel className="p-8 text-center md:p-12"><Hourglass className="mx-auto mb-6 h-16 w-16 animate-pulse text-amber-200" /><div className="text-7xl font-black tabular-nums md:text-9xl">{duration}:00</div><div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-900 to-amber-100" /></div><p className="mt-5 text-stone-400">Tension increases after each round.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={randomEvent} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Event</button><button onClick={() => setScreen("accusation")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Accusation</button><button onClick={() => { if (round >= 3) setScreen("elimination"); else { setRound(round + 1); setScreen("transition") } }} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">End round</button></div></Panel></div>
}

function RoundTransition({ round, setScreen }: { round: number; setScreen: (screen: Screen) => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Moon className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">The next day begins</p><h1 className="mt-3 text-5xl font-black">Day {round}</h1><p className="mt-5 text-stone-300">The wish remains active. The conditions remain hidden. Someone may already be too late.</p><button onClick={() => setScreen("round")} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continue</button></Panel></div>
}

function Accusation({ players, accused, setAccused, correct, setCorrect, setScreen }: { players: Player[]; accused: string; setAccused: (value: string) => void; correct: boolean; setCorrect: (value: boolean) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Public accusation" title="Guess the condition" text="If the condition is guessed correctly, the target loses immediately. If not, mistrust remains." /><Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-amber-100"><Clock className="h-8 w-8" /><span className="text-6xl font-black tabular-nums">00:45</span></div><div className="grid gap-3 md:grid-cols-4">{players.filter((p) => p.status !== "eliminated").map((player) => <button key={player.id} onClick={() => setAccused(player.name)} className={`rounded-2xl border p-5 text-left ${accused === player.name ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-white/5"}`}><Eye className="mb-4 h-8 w-8" /><p className="text-xl font-black">{player.name}</p><p className="text-sm opacity-70">{player.status}</p></button>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><button onClick={() => setCorrect(true)} className={`rounded-2xl px-5 py-4 font-black ${correct ? "bg-amber-100 text-stone-950" : "border border-white/15"}`}>Correct guess</button><button onClick={() => setCorrect(false)} className={`rounded-2xl px-5 py-4 font-black ${!correct ? "bg-amber-100 text-stone-950" : "border border-white/15"}`}>Wrong guess</button><button onClick={() => setScreen("reveal")} className="rounded-2xl border border-amber-200/30 bg-amber-950/20 px-5 py-4 font-black">Reveal</button></div></Panel></div>
}

function Reveal({ accused, correct, onContinue }: { accused: string; correct: boolean; onContinue: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Skull className="mx-auto mb-6 h-20 w-20 animate-pulse text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">Revelation</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{correct ? `${accused} was exposed` : "The condition remains hidden"}</h1><p className="mt-5 text-stone-300">{correct ? "The guessed condition is enough. The player cannot continue." : "The accusation failed. The room becomes less safe."}</p><button onClick={onContinue} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continue</button></Panel></div>
}

function Elimination({ players, accused, correct, setScreen }: { players: Player[]; accused: string; correct: boolean; setScreen: (screen: Screen) => void }) {
  const survivors = players.filter((player) => player.status !== "eliminated").length
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Skull className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">Elimination</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{correct ? accused : "One player fades"}</h1><p className="mt-5 text-stone-300">A new game begins with one fewer player. Survivors remaining: {survivors}.</p><button onClick={() => setScreen("survivors")} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Update survivors</button></Panel></div>
}

function Survivors({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Survivors" title="The table is smaller" text="The game can begin again with fewer players and the same fear." /><div className="grid gap-4 md:grid-cols-4">{players.map((player) => <Panel key={player.id} className={`p-5 text-center ${player.status === "eliminated" ? "opacity-40 grayscale" : ""}`}><UserRound className="mx-auto mb-4 h-10 w-10 text-amber-200" /><h2 className="font-black">{player.name}</h2><p className="mt-1 text-sm text-stone-500">{player.status}</p></Panel>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => setScreen("wish")} className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">New game</button><button onClick={() => setScreen("end")} className="rounded-2xl border border-white/15 px-6 py-4 font-black">End</button></div></div>
}

function InfoGrid({ eyebrow, title, icon: Icon, items }: { eyebrow: string; title: string; icon: LucideIcon; items: string[] }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={eyebrow} title={title} text="The phone keeps a quiet record. It never explains everything." /><div className="grid gap-4 md:grid-cols-2">{items.map((item) => <Panel key={item} className="p-6"><Icon className="mb-5 h-9 w-9 text-amber-200" /><p className="leading-7 text-stone-300">{item}</p></Panel>)}</div></div>
}

function Profiles({ players }: { players: Player[] }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Profiles" title="Everyone is being watched" text="Status, survival pressure, and partial progress. Conditions remain hidden." /><div className="grid gap-4 md:grid-cols-4">{players.map((player) => <Panel key={player.id} className={`p-5 ${player.status === "eliminated" ? "opacity-40 grayscale" : ""}`}><Fingerprint className="mb-4 h-10 w-10 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">{player.code}</p><h2 className="mt-2 text-2xl font-black">{player.name}</h2><p className="mt-2 text-sm text-stone-400">Status: {player.status}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-900 to-amber-100" style={{ width: `${player.progress}%` }} /></div></Panel>)}</div></div>
}

function EndGame({ players }: { players: Player[] }) {
  const survivors = players.filter((player) => player.status !== "eliminated")
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><BadgeCheck className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">End of game</p><h1 className="mt-3 text-5xl font-black">{survivors.length} survived</h1><p className="mt-5 text-stone-300">The wish ends here, but the players should not feel safe. The next game starts with fewer people.</p></Panel></div>
}
