"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, BadgeCheck, BookOpen, Clock, Crown, Eye, Fingerprint, Gavel, History, Hourglass, KeyRound, LucideIcon, MessageCircleWarning, Moon, ScrollText, ShieldQuestion, Skull, Timer, UserRound, Users, X } from "lucide-react"
import { useGameRoom } from "@/hooks/use-game-room"
import { RoomFlow } from "@/components/room-flow"
import { GameLoader } from "@/components/game-loader"

type Screen = "loader" | "menu" | "lobby" | "create" | "join" | "waiting" | "room" | "foram-select" | "wish" | "wish-review" | "conditions" | "player" | "foram" | "monitoring" | "round" | "imminent" | "transition" | "accusation" | "reveal" | "condition-reveal" | "elimination" | "survivors" | "memory" | "history" | "profiles" | "end"
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

const statusLabels: Record<PlayerStatus, string> = {
  alive: "en vie",
  watched: "observé",
  suspected: "suspecté",
  eliminated: "éliminé"
}

const initialPlayers: Player[] = [
  { id: "p1", name: "NOVA", code: "W-01", status: "alive", condition: "Faire dire football à quelqu'un.", progress: 42 },
  { id: "p2", name: "MIRAGE", code: "W-02", status: "watched", condition: "Faire rire sincèrement un joueur.", progress: 61 },
  { id: "p3", name: "VANTA", code: "W-03", status: "suspected", condition: "Faire répéter un mot interdit à quelqu'un.", progress: 27 },
  { id: "p4", name: "ORION", code: "W-04", status: "alive", condition: "Faire avouer une préférence privée à quelqu'un.", progress: 54 }
]

const wishIdeas = [
  "Ne jamais dire oui.",
  "Rester debout pendant toute la partie.",
  "Terminer chaque phrase par mouton.",
  "Ne jamais croiser les bras.",
  "Parler lentement avant de répondre.",
  "Ne jamais utiliser le vrai nom d'un joueur."
]

const conditionIdeas = [
  "Faire dire football à quelqu'un.",
  "Faire rire quelqu'un.",
  "Faire mentir un joueur.",
  "Faire répéter un mot précis à quelqu'un.",
  "Provoquer une réaction visible.",
  "Faire avouer à quelqu'un qui il admire.",
  "Faire dire non deux fois à quelqu'un.",
  "Faire détourner le regard à un joueur.",
  "Convaincre quelqu'un de changer de place.",
  "Faire demander à quelqu'un si vous mentez."
]

const events = [
  "Quelqu'un vous observe.",
  "Votre comportement semble étrange.",
  "Le Foram doute de vous.",
  "Un joueur vous soupçonne.",
  "Votre souhait devient dangereux.",
  "Une condition a peut-être été devinée.",
  "Quelqu'un pense connaître votre condition.",
  "Le Foram vous regarde.",
  "Votre comportement attire l'attention.",
  "Un joueur doute de vous.",
  "Faites attention à vos actions.",
  "Votre condition semble exposée."
]

const log = [
  "Le souhait a été proposé et accepté par la table.",
  "Le Foram a modifié l'atmosphère avant la première manche.",
  "Un joueur a posé trop de questions sur le comportement d'un autre.",
  "L'observateur a détecté une hésitation pendant une réponse publique.",
  "Un faux soupçon a changé le rythme de la pièce.",
  "Un joueur s'est défendu avant même d'être accusé.",
  "Le système a enregistré un silence anormal après la deuxième manche."
]

const foramAlerts = [
  "Comportement incohérent détecté.",
  "Le joueur semble nerveux.",
  "Condition potentiellement compromise.",
  "Anomalie sociale détectée près du souhait actif.",
  "Un joueur évite les réponses directes."
]

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
        <button onClick={() => setScreen(screen === "menu" ? "menu" : "room")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold backdrop-blur-xl transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> {screen === "menu" ? "THREE" : "Retour"}</button>
        <div className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.25em] backdrop-blur-xl ${role === "foram" ? "border-amber-300/40 bg-amber-950/30 text-amber-100" : "border-white/10 bg-black/35 text-stone-300"}`}>{role === "foram" ? "FORAM" : "JOUEUR"}</div>
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
  return <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-500 rounded-[1.5rem] border border-amber-200/25 bg-black/75 p-4 shadow-2xl shadow-amber-950/40 backdrop-blur-xl md:left-auto md:right-6"><div className="flex gap-3"><MessageCircleWarning className="h-6 w-6 shrink-0 text-amber-200" /><div className="flex-1"><p className="font-black">Observateur silencieux</p><p className="mt-1 text-sm text-stone-300">{text}</p></div><button onClick={onClose}><X className="h-5 w-5" /></button></div></div>
}

function Blackout({ text, onClose }: { text: string | null; onClose: () => void }) {
  if (!text) return null
  return <button onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-6 text-center backdrop-blur-sm"><div className="animate-in fade-in zoom-in-95 duration-700"><p className="text-xs font-black uppercase tracking-[0.45em] text-red-200">Silence du système</p><h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-stone-100 md:text-7xl">{text}</h2><p className="mt-8 text-sm text-stone-500">Touchez pour respirer à nouveau</p></div></button>
}

export function ThreeDaysExperience({ initialJoinCode = "" }: { initialJoinCode?: string }) {
  const [booted, setBooted] = useState(false)
  const [screen, setScreen] = useState<Screen>(initialJoinCode ? "room" : "menu")
  const [role, setRole] = useState<Role>("player")
  const threeRoom = useGameRoom("three-days")
  const [round, setRound] = useState(1)
  const [duration, setDuration] = useState(5)
  const [wish, setWish] = useState("Ne jamais dire oui.")
  const [condition, setCondition] = useState(conditionIdeas[0])
  const [accused, setAccused] = useState("VANTA")
  const [correctAccusation, setCorrectAccusation] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [blackout, setBlackout] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)

  const randomEvent = () => {
    const message = events[Math.floor(Math.random() * events.length)]
    if (Math.random() > 0.55) setBlackout(message)
    else setNotice(message)
  }
  const eliminate = (name: string) => setPlayers((current) => current.map((player) => player.name === name ? { ...player, status: "eliminated" } : player))

  return (
    <>
      {!booted && <GameLoader title="THREE DAYS" tagline="Le souhait est accordé" logo="/threedays/cover.png" accent="amber" onDone={() => setBooted(true)} />}
      <Shell screen={screen} setScreen={setScreen} role={role}>
      <Blackout text={blackout} onClose={() => setBlackout(null)} />
      <EventNotice text={notice} onClose={() => setNotice(null)} />
      {screen === "menu" && <Menu setScreen={setScreen} />}
      {screen === "room" && <RoomFlow room={threeRoom} gameSlug="threedays" gameTitle="THREE DAYS" accent="amber" minPlayers={2} startScreen="foram-select" initialView={initialJoinCode ? "join" : "select"} initialJoinCode={initialJoinCode} onEnterGame={() => setScreen("foram-select")} onBack={() => setScreen("menu")} />}
      {screen === "foram-select" && <ForamSelect role={role} setRole={setRole} setScreen={setScreen} />}
      {screen === "wish" && <WishProposal wish={wish} setWish={setWish} setScreen={setScreen} />}
      {screen === "wish-review" && <WishReview wish={wish} setWish={setWish} setScreen={setScreen} />}
      {screen === "conditions" && <Conditions condition={condition} setCondition={setCondition} setScreen={setScreen} />}
      {screen === "player" && <PlayerConsole wish={wish} condition={condition} round={round} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "foram" && <ForamConsole players={players} wish={wish} round={round} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "monitoring" && <ForamMonitoring players={players} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "round" && <RoundTimer duration={duration} round={round} setRound={setRound} setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "imminent" && <ImminentDeath setScreen={setScreen} randomEvent={randomEvent} />}
      {screen === "transition" && <RoundTransition round={round} setScreen={setScreen} />}
      {screen === "accusation" && <Accusation players={players} accused={accused} setAccused={setAccused} correct={correctAccusation} setCorrect={setCorrectAccusation} setScreen={setScreen} />}
      {screen === "reveal" && <Reveal accused={accused} correct={correctAccusation} onContinue={() => { if (correctAccusation) eliminate(accused); setScreen(correctAccusation ? "condition-reveal" : "elimination") }} />}
      {screen === "condition-reveal" && <ConditionReveal player={players.find((player) => player.name === accused)} setScreen={setScreen} />}
      {screen === "elimination" && <Elimination players={players} accused={accused} correct={correctAccusation} setScreen={setScreen} />}
      {screen === "survivors" && <Survivors players={players} setScreen={setScreen} />}
      {screen === "memory" && <BehaviorMemory players={players} />}
      {screen === "history" && <InfoGrid eyebrow="Archive" title="Historique" icon={History} items={log} />}
      {screen === "profiles" && <Profiles players={players} />}
      {screen === "end" && <EndGame players={players} />}

      <nav className="fixed bottom-4 left-4 right-4 z-30 mx-auto grid max-w-3xl grid-cols-6 gap-2 rounded-[1.5rem] border border-white/10 bg-black/70 p-2 backdrop-blur-xl">
        {[{ s: "player", i: UserRound }, { s: "monitoring", i: Crown }, { s: "round", i: Timer }, { s: "accusation", i: ShieldQuestion }, { s: "memory", i: History }, { s: "profiles", i: Users }].map(({ s, i: Icon }) => <button key={s} onClick={() => setScreen(s as Screen)} className="flex items-center justify-center rounded-2xl py-3 text-stone-300 transition hover:bg-white/10 hover:text-white"><Icon className="h-5 w-5" /></button>)}
      </nav>
      </Shell>
    </>
  )
}

function Menu({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="w-full max-w-3xl p-6 text-center md:p-10"><div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-[2rem] border border-amber-200/40 md:h-36 md:w-36"><Image src="/threedays/cover.png" alt="THREE DAYS" fill className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.4em] text-amber-200">Le souhait est accordé</p><h1 className="mt-3 text-5xl font-black md:text-8xl">THREE DAYS</h1><p className="mx-auto mt-5 max-w-xl text-stone-300">Faites un souhait. Survivez trois manches. Ne laissez jamais personne deviner ce qui vous sauvera.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><button onClick={() => setScreen("room")} className="rounded-2xl bg-amber-100 px-8 py-5 text-lg font-black text-stone-950 transition hover:scale-[1.02]">Commencer</button><Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-lg font-black transition hover:bg-white/15">Retour</Link></div></Panel></div>
}

function ForamSelect({ role, setRole, setScreen }: { role: Role; setRole: (role: Role) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Le Foram" title="Qui accorde le souhait ?" text="Le Foram gère la partie et tente de vaincre les joueurs avant la fin de la troisième manche." /><div className="grid gap-4 md:grid-cols-2"><button onClick={() => setRole("player")} className={`rounded-[2rem] border p-8 text-left ${role === "player" ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-black/45"}`}><Users className="mb-5 h-12 w-12" /><h2 className="text-3xl font-black">Joueur</h2><p className="mt-3 text-sm opacity-75">Cachez votre condition secrète et survivez.</p></button><button onClick={() => setRole("foram")} className={`rounded-[2rem] border p-8 text-left ${role === "foram" ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-black/45"}`}><Crown className="mb-5 h-12 w-12" /><h2 className="text-3xl font-black">Foram</h2><p className="mt-3 text-sm opacity-75">Accordez les souhaits, surveillez les comportements, déclenchez les révélations.</p></button></div><button onClick={() => setScreen("wish")} className="mt-6 w-full rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continuer vers les souhaits</button></div>
}

function WishProposal({ wish, setWish, setScreen }: { wish: string; setWish: (wish: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Proposition de souhait" title="Choisissez la règle qui hantera tout le monde" text="Chaque souhait devient une interdiction ou une obligation réelle pendant la partie." /><div className="grid gap-3 md:grid-cols-2">{wishIdeas.map((item) => <button key={item} onClick={() => setWish(item)} className={`rounded-2xl border p-5 text-left font-black ${wish === item ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-black/45"}`}>{item}</button>)}</div><button onClick={() => setScreen("wish-review")} className="mt-6 w-full rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Soumettre au Foram</button></div>
}

function WishReview({ wish, setWish, setScreen }: { wish: string; setWish: (wish: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Validation du Foram" title="Accorder ou rejeter" text="Les joueurs peuvent donner leur avis, mais le Foram décide du souhait final." /><Panel className="p-8 text-center"><Gavel className="mx-auto mb-6 h-16 w-16 text-amber-200" /><p className="text-3xl font-black">{wish}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={() => setWish(wishIdeas[Math.floor(Math.random() * wishIdeas.length)])} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Rejeter</button><button className="rounded-2xl border border-white/15 px-5 py-4 font-black">Discuter</button><button onClick={() => setScreen("conditions")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Valider</button></div></Panel></div>
}

function Conditions({ condition, setCondition, setScreen }: { condition: string; setCondition: (condition: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Conditions secrètes" title="Écrivez-en dix. Recevez-en une." text="Si quelqu'un devine votre condition, vous perdez immédiatement." /><Panel className="p-6 md:p-8"><div className="grid gap-2 md:grid-cols-2">{conditionIdeas.map((item, index) => <button key={item} onClick={() => setCondition(item)} className={`rounded-xl border p-3 text-left text-sm ${condition === item ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-white/5"}`}>0{index + 1}. {item}</button>)}</div><div className="mt-6 rounded-2xl border border-amber-200/30 bg-amber-950/20 p-5"><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Sélectionné par le système</p><p className="mt-2 text-2xl font-black">{condition}</p></div><button onClick={() => setScreen("player")} className="mt-6 w-full rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Cacher la condition</button></Panel></div>
}

function PlayerConsole({ wish, condition, round, setScreen, randomEvent }: { wish: string; condition: string; round: number; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow="Écran joueur" title="Ne vous faites pas découvrir" text="Votre téléphone sait ce qui peut vous sauver. Les autres ne voient que votre comportement." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="p-6"><KeyRound className="mb-5 h-12 w-12 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Condition secrète</p><h2 className="mt-3 text-3xl font-black">{condition}</h2><p className="mt-4 text-stone-300">Si le Foram ou un autre joueur devine cette condition, vous perdez immédiatement.</p></Panel><Panel className="p-6"><ScrollText className="mb-5 h-12 w-12 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Souhait actif</p><h2 className="mt-3 text-2xl font-black">{wish}</h2><p className="mt-3 text-sm text-stone-400">Manche {round}/3</p></Panel></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><button onClick={() => setScreen("round")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Lancer la manche</button><button onClick={() => setScreen("accusation")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Accuser</button><button onClick={randomEvent} className="rounded-2xl border border-amber-200/30 bg-amber-950/20 px-5 py-4 font-black">Événement</button></div></div>
}

function ForamConsole({ players, wish, round, setScreen, randomEvent }: { players: Player[]; wish: string; round: number; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Interface Foram" title="Accorder. Observer. Terminer." text="Le Foram voit plus de choses que les joueurs, mais pas tout. Le pouvoir doit sembler dangereux." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="p-5 md:p-6">{players.map((player) => <div key={player.id} className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between"><div><p className="font-black">{player.name}</p><p className="text-xs uppercase tracking-[0.2em] text-stone-500">{player.code} · {statusLabels[player.status]}</p></div><p className="text-2xl font-black text-amber-100">{player.progress}%</p></div><p className="mt-2 text-xs text-stone-500">Signal d'activité caché seulement. Ce n'est pas une preuve.</p></div>)}</Panel><Panel className="p-6"><Crown className="mb-5 h-12 w-12 text-amber-200" /><h2 className="text-2xl font-black">Contrôles du Foram</h2><p className="mt-3 text-sm text-stone-400">Souhait : {wish}</p><p className="mt-2 text-sm text-stone-400">Manche {round}/3</p><div className="mt-6 grid gap-3"><button onClick={randomEvent} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Lancer un événement</button><button onClick={() => setScreen("accusation")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Vérifier une condition</button><button onClick={() => setScreen("elimination")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Annoncer une élimination</button></div></Panel></div></div>
}

function ForamMonitoring({ players, setScreen, randomEvent }: { players: Player[]; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Surveillance du Foram" title="Salle d'observation" text="Le Foram reçoit des signaux suspects, des anomalies sociales et des schémas nerveux. Aucun n'est une preuve." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="p-5 md:p-6"><div className="grid gap-3 md:grid-cols-2">{players.filter((player) => player.status !== "eliminated").map((player) => <div key={player.id} className="rounded-2xl border border-amber-200/10 bg-black/35 p-4"><div className="flex items-center justify-between"><div><p className="text-xl font-black">{player.name}</p><p className="text-xs uppercase tracking-[0.2em] text-stone-500">{player.code} · {statusLabels[player.status]}</p></div><Eye className="h-7 w-7 text-amber-200" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-950 via-amber-700 to-amber-100" style={{ width: `${player.progress}%` }} /></div><p className="mt-3 text-xs text-stone-500">Signal de pression sociale : instable</p></div>)}</div></Panel><Panel className="p-6"><Crown className="mb-5 h-12 w-12 text-amber-200" /><h2 className="text-2xl font-black">Alertes du Foram</h2><div className="mt-5 space-y-3">{foramAlerts.map((alert) => <div key={alert} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-stone-300">{alert}</div>)}</div><div className="mt-6 grid gap-3"><button onClick={randomEvent} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Envoyer une pression silencieuse</button><button onClick={() => setScreen("accusation")} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">Déclencher une vérification</button></div></Panel></div></div>
}

function ImminentDeath({ setScreen, randomEvent }: { setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-3xl animate-pulse border-red-300/30 bg-red-950/15 p-8 text-center shadow-2xl shadow-red-950/40 md:p-12"><AlertTriangle className="mx-auto mb-6 h-20 w-20 text-red-200" /><p className="text-xs font-black uppercase tracking-[0.45em] text-red-200">Silence critique</p><h1 className="mt-4 text-5xl font-black md:text-7xl">Le troisième jour approche.</h1><p className="mx-auto mt-6 max-w-xl text-stone-300">Le temps commence à disparaître. Quelqu'un ne survivra pas. Parlez prudemment. Bougez prudemment. La pièce écoute.</p><div className="mt-8 grid grid-cols-5 gap-2">{Array.from({ length: 15 }, (_, index) => <div key={index} className={`h-2 rounded-full ${index % 3 === 0 ? "bg-red-300" : "bg-white/10"}`} />)}</div><div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={randomEvent} className="rounded-2xl border border-red-200/30 px-6 py-4 font-black">Pulsation du système</button><button onClick={() => setScreen("elimination")} className="rounded-2xl bg-red-200 px-6 py-4 font-black text-stone-950">Laisser le temps finir</button></div></Panel></div>
}

function RoundTimer({ duration, round, setRound, setScreen, randomEvent }: { duration: number; round: number; setRound: (round: number) => void; setScreen: (screen: Screen) => void; randomEvent: () => void }) {
  return <div className="mx-auto max-w-4xl"><Title eyebrow="Minuteur de manche" title={`Jour ${round}`} text="Le minuteur gère la pression. La vraie partie se joue entre les joueurs." /><Panel className={`p-8 text-center md:p-12 ${round >= 3 ? "border-red-300/30 shadow-red-950/40" : ""}`}><Hourglass className="mx-auto mb-6 h-16 w-16 animate-pulse text-amber-200" /><div className="text-7xl font-black tabular-nums md:text-9xl">{duration}:00</div><div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${round >= 3 ? "w-[88%] bg-gradient-to-r from-red-950 via-red-400 to-amber-100" : "w-2/3 bg-gradient-to-r from-amber-900 to-amber-100"}`} /></div><p className="mt-5 text-stone-400">{round >= 3 ? "Le troisième jour approche. Le temps commence à disparaître." : "La tension augmente après chaque manche."}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={randomEvent} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Événement</button><button onClick={() => setScreen("accusation")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Accusation</button><button onClick={() => { if (round >= 3) setScreen("imminent"); else { setRound(round + 1); setScreen("transition") } }} className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950">{round >= 3 ? "Temps critique" : "Fin de manche"}</button></div></Panel></div>
}

function RoundTransition({ round, setScreen }: { round: number; setScreen: (screen: Screen) => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Moon className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">Le jour suivant commence</p><h1 className="mt-3 text-5xl font-black">Jour {round}</h1><p className="mt-5 text-stone-300">Le souhait reste actif. Les conditions restent cachées. Pour quelqu'un, il est peut-être déjà trop tard.</p><button onClick={() => setScreen("round")} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continuer</button></Panel></div>
}

function Accusation({ players, accused, setAccused, correct, setCorrect, setScreen }: { players: Player[]; accused: string; setAccused: (value: string) => void; correct: boolean; setCorrect: (value: boolean) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Accusation publique" title="Devinez la condition" text="Si la condition est devinée correctement, la cible perd immédiatement. Sinon, la méfiance reste." /><Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-amber-100"><Clock className="h-8 w-8" /><span className="text-6xl font-black tabular-nums">00:45</span></div><div className="grid gap-3 md:grid-cols-4">{players.filter((p) => p.status !== "eliminated").map((player) => <button key={player.id} onClick={() => setAccused(player.name)} className={`rounded-2xl border p-5 text-left ${accused === player.name ? "border-amber-200 bg-amber-100 text-stone-950" : "border-white/10 bg-white/5"}`}><Eye className="mb-4 h-8 w-8" /><p className="text-xl font-black">{player.name}</p><p className="text-sm opacity-70">{statusLabels[player.status]}</p></button>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><button onClick={() => setCorrect(true)} className={`rounded-2xl px-5 py-4 font-black ${correct ? "bg-amber-100 text-stone-950" : "border border-white/15"}`}>Bonne hypothèse</button><button onClick={() => setCorrect(false)} className={`rounded-2xl px-5 py-4 font-black ${!correct ? "bg-amber-100 text-stone-950" : "border border-white/15"}`}>Mauvaise hypothèse</button><button onClick={() => setScreen("reveal")} className="rounded-2xl border border-amber-200/30 bg-amber-950/20 px-5 py-4 font-black">Révéler</button></div></Panel></div>
}

function Reveal({ accused, correct, onContinue }: { accused: string; correct: boolean; onContinue: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Skull className="mx-auto mb-6 h-20 w-20 animate-pulse text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">Révélation</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{correct ? `${accused} a été exposé` : "La condition reste cachée"}</h1><p className="mt-5 text-stone-300">{correct ? "La condition devinée suffit. Le joueur ne peut pas continuer." : "L'accusation a échoué. La pièce devient moins sûre."}</p><button onClick={onContinue} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Continuer</button></Panel></div>
}

function ConditionReveal({ player, setScreen }: { player?: Player; setScreen: (screen: Screen) => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl border-red-300/20 bg-black/60 p-8 text-center shadow-2xl shadow-red-950/30 md:p-12"><ScrollText className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-red-200">Condition révélée</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{player?.name ?? "Le joueur"} n'a pas réussi à la cacher.</h1><p className="mt-6 text-xl leading-9 text-stone-200">Sa condition était : <span className="font-black text-amber-100">{player?.condition ?? "inconnue"}</span></p><p className="mt-5 text-stone-400">La pièce en sait maintenant trop. Le joueur disparaît lentement de la partie.</p><button onClick={() => setScreen("elimination")} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Les laisser s'effacer</button></Panel></div>
}

function Elimination({ players, accused, correct, setScreen }: { players: Player[]; accused: string; correct: boolean; setScreen: (screen: Screen) => void }) {
  const survivors = players.filter((player) => player.status !== "eliminated").length
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Skull className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">Élimination</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{correct ? accused : "Un joueur s'efface"}</h1><p className="mt-5 text-stone-300">Une nouvelle partie commence avec un joueur en moins. Survivants restants : {survivors}.</p><button onClick={() => setScreen("survivors")} className="mt-8 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Mettre à jour les survivants</button></Panel></div>
}

function Survivors({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  const remaining = players.filter((player) => player.status !== "eliminated").length
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Redémarrage émotionnel" title={`${remaining} survivants restent`} text="La table est plus petite. Le silence est plus lourd. Chaque élimination change la respiration du groupe." /><Panel className="mb-5 border-red-300/20 bg-red-950/10 p-6 text-center"><p className="text-2xl font-black">Chaque élimination impacte le groupe.</p><p className="mt-2 text-sm text-stone-400">Une nouvelle partie commence, mais la confiance ne se réinitialise pas.</p></Panel><div className="grid gap-4 md:grid-cols-4">{players.map((player) => <Panel key={player.id} className={`p-5 text-center transition duration-700 ${player.status === "eliminated" ? "opacity-30 grayscale scale-95" : ""}`}><UserRound className="mx-auto mb-4 h-10 w-10 text-amber-200" /><h2 className="font-black">{player.name}</h2><p className="mt-1 text-sm text-stone-500">{statusLabels[player.status]}</p></Panel>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => setScreen("wish")} className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950">Recréer la tension</button><button onClick={() => setScreen("end")} className="rounded-2xl border border-white/15 px-6 py-4 font-black">Terminer</button></div></div>
}

function BehaviorMemory({ players }: { players: Player[] }) {
  const records = [
    "NOVA a été soupçonné après avoir parlé trop prudemment.",
    "MIRAGE a évité de répondre pendant le souhait actif.",
    "VANTA a été accusé sans assez de certitude.",
    "ORION a changé de comportement après une notification silencieuse.",
    "Une accusation ratée reste socialement irrésolue."
  ]
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Mémoire comportementale" title="Le téléphone se souvient des schémas" text="Les accusations passées, joueurs suspects, comportements inhabituels et l'historique social sont enregistrés sans révéler la vraie vérité." /><div className="grid gap-4 lg:grid-cols-[1fr_340px]"><Panel className="p-5 md:p-6"><div className="space-y-3">{records.map((record, index) => <div key={record} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Mémoire {index + 1}</p><p className="mt-2 text-stone-300">{record}</p></div>)}</div></Panel><Panel className="p-6"><BookOpen className="mb-5 h-12 w-12 text-amber-200" /><h2 className="text-2xl font-black">Indice de suspicion</h2><div className="mt-5 space-y-4">{players.filter((player) => player.status !== "eliminated").map((player) => <div key={player.id}><div className="mb-2 flex justify-between text-sm"><span>{player.name}</span><span>{player.progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-950 to-amber-100" style={{ width: `${player.progress}%` }} /></div></div>)}</div></Panel></div></div>
}

function InfoGrid({ eyebrow, title, icon: Icon, items }: { eyebrow: string; title: string; icon: LucideIcon; items: string[] }) {
  return <div className="mx-auto max-w-5xl"><Title eyebrow={eyebrow} title={title} text="Le téléphone garde une trace silencieuse. Il n'explique jamais tout." /><div className="grid gap-4 md:grid-cols-2">{items.map((item) => <Panel key={item} className="p-6"><Icon className="mb-5 h-9 w-9 text-amber-200" /><p className="leading-7 text-stone-300">{item}</p></Panel>)}</div></div>
}

function Profiles({ players }: { players: Player[] }) {
  return <div className="mx-auto max-w-6xl"><Title eyebrow="Profils" title="Tout le monde est observé" text="Statut, pression de survie et progression partielle. Les conditions restent cachées." /><div className="grid gap-4 md:grid-cols-4">{players.map((player) => <Panel key={player.id} className={`p-5 ${player.status === "eliminated" ? "opacity-40 grayscale" : ""}`}><Fingerprint className="mb-4 h-10 w-10 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">{player.code}</p><h2 className="mt-2 text-2xl font-black">{player.name}</h2><p className="mt-2 text-sm text-stone-400">Statut : {statusLabels[player.status]}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-900 to-amber-100" style={{ width: `${player.progress}%` }} /></div></Panel>)}</div></div>
}

function EndGame({ players }: { players: Player[] }) {
  const survivors = players.filter((player) => player.status !== "eliminated")
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><BadgeCheck className="mx-auto mb-6 h-20 w-20 text-amber-200" /><p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">Fin de partie</p><h1 className="mt-3 text-5xl font-black">{survivors.length} ont survécu</h1><p className="mt-5 text-stone-300">Le souhait s'arrête ici, mais les joueurs ne devraient pas se sentir en sécurité. La prochaine partie commence avec moins de monde.</p></Panel></div>
}
