"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, BadgeDollarSign, BarChart3, ChevronRight, Clock, Crown, Dice5, Eye, Fingerprint, Gauge, History, Lock, LucideIcon, MessageSquareWarning, ShieldAlert, Skull, Sparkles, Trophy, Users, Vote, X, Zap } from "lucide-react"
import { useGameRoom } from "@/hooks/use-game-room"
import { RoomFlow } from "@/components/room-flow"
import { GameLoader } from "@/components/game-loader"

type Screen = "loader" | "menu" | "lobby" | "create" | "join" | "waiting" | "room" | "duos" | "games" | "poker" | "rps" | "signal" | "ranking" | "debate" | "vote" | "vote-correct" | "vote-incorrect" | "recompose" | "analysis" | "traitor" | "history" | "profiles" | "elimination" | "locked"
type PlayerStatus = "active" | "unstable" | "suspect" | "eliminated"
type VoteTone = "Silencieux" | "Agressif" | "Suspect" | "Défensif"

type Player = {
  id: string
  name: string
  code: string
  score: number
  status: PlayerStatus
  partner: string
  tone: VoteTone
}

const statusLabels: Record<PlayerStatus, string> = {
  active: "actif",
  unstable: "instable",
  suspect: "suspect",
  eliminated: "éliminé"
}

const initialPlayers: Player[] = [
  { id: "p1", name: "NOVA", code: "A-01", score: 8.4, status: "active", partner: "MIRAGE", tone: "Silencieux" },
  { id: "p2", name: "MIRAGE", code: "A-02", score: 7.1, status: "suspect", partner: "NOVA", tone: "Défensif" },
  { id: "p3", name: "VANTA", code: "B-01", score: 6.8, status: "unstable", partner: "ORION", tone: "Agressif" },
  { id: "p4", name: "ORION", code: "B-02", score: 5.9, status: "active", partner: "VANTA", tone: "Suspect" },
  { id: "p5", name: "ECHO", code: "C-01", score: 4.6, status: "active", partner: "LYNX", tone: "Silencieux" },
  { id: "p6", name: "LYNX", code: "C-02", score: 3.2, status: "eliminated", partner: "ECHO", tone: "Défensif" }
]

const narrativeMessages = [
  "Un traître est parmi vous.",
  "La confiance devient dangereuse.",
  "Les scores sont instables.",
  "Quelqu'un vous manipule.",
  "Votre duo n'est peut-être plus le vôtre."
]

const alerts = [
  "Un joueur vous soupçonne.",
  "Votre duo semble instable.",
  "Le système observe vos choix.",
  "Un téléphone a reçu un message avant les autres.",
  "Un mouvement de classement reste inexpliqué."
]

const history = [
  "La manche 01 s'est terminée avec une variation de score inexpliquée.",
  "Deux partenaires ont signalé des instructions incompatibles.",
  "Le classement a été mis à jour sans révéler les détails du calcul.",
  "Une condition privée a été acceptée par un joueur inconnu.",
  "Un vote a créé plus d'instabilité que de certitude."
]

const trials = [
  { id: "monopolice", title: "MONOPOLICE DU ROI", status: "Bientôt disponible", locked: true, text: "Course psychologique stratégique. Le plateau est visible mais scellé." },
  { id: "poker", title: "POKER FACE  PETIT GÉANT", status: "Simulation jouable", locked: false, text: "Logique cachée. Choisissez, observez, déduisez." },
  { id: "rps", title: "ROIS PIERRE-PAPIER", status: "Simulation jouable", locked: false, text: "Gestes simples. Conséquences floues." },
  { id: "signal", title: "LE SIGNAL", status: "Simulation jouable", locked: false, text: "Synchronisation sous pression." }
]

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
        <button onClick={() => setScreen(screen === "menu" ? "menu" : "room")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold backdrop-blur-xl transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> {screen === "menu" ? "CAGE" : "Retour"}</button>
        <div className="rounded-full border border-red-500/30 bg-red-950/25 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200 backdrop-blur-xl">Local en ligne</div>
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
  return <button onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6 text-center backdrop-blur-sm"><div className="animate-in fade-in zoom-in-95 duration-700"><p className="text-xs font-black uppercase tracking-[0.45em] text-red-300">Diffusion du système</p><h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-zinc-100 md:text-7xl">{message}</h2><p className="mt-8 text-sm text-zinc-500">Touchez pour continuer</p></div></button>
}

function ImmersiveNotification({ text, onClose }: { text: string | null; onClose: () => void }) {
  if (!text) return null
  return <div className="fixed right-4 top-24 z-40 max-w-sm animate-in slide-in-from-right-4 duration-500 rounded-[1.5rem] border border-red-400/30 bg-black/75 p-4 shadow-2xl shadow-red-950/50 backdrop-blur-xl"><div className="flex gap-3"><MessageSquareWarning className="h-6 w-6 shrink-0 text-red-300" /><div><p className="font-black">Alerte privée</p><p className="mt-1 text-sm text-zinc-300">{text}</p></div><button onClick={onClose}><X className="h-5 w-5" /></button></div></div>
}

export function CageWildExperience({ initialJoinCode = "" }: { initialJoinCode?: string }) {
  const [booted, setBooted] = useState(false)
  const [screen, setScreen] = useState<Screen>(initialJoinCode ? "room" : "menu")
  const [progress, setProgress] = useState(0)
  const cageRoom = useGameRoom("cage-wild")
  const [betrayal, setBetrayal] = useState(false)
  const [betrayalRecorded, setBetrayalRecorded] = useState(false)
  const [choice, setChoice] = useState("?")
  const [signalStop, setSignalStop] = useState<number | null>(null)
  const [voteTarget, setVoteTarget] = useState("MIRAGE")
  const [voteCorrect, setVoteCorrect] = useState(true)
  const [cinema, setCinema] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)

  const openCinema = () => setCinema(narrativeMessages[Math.floor(Math.random() * narrativeMessages.length)])
  const openNotice = () => setNotice(alerts[Math.floor(Math.random() * alerts.length)])
  const resolveVote = () => setScreen(voteCorrect ? "vote-correct" : "vote-incorrect")
  const removePlayer = (name: string) => setPlayers((current) => current.map((player) => player.name === name || player.partner === name ? { ...player, status: "eliminated" } : player))

  return (
    <>
      {!booted && <GameLoader title="CAGE WILD" tagline="Lien psychologique actif" logo="/cagewild/cover.png" accent="red" onDone={() => setBooted(true)} />}
      <Shell screen={screen} setScreen={setScreen}>
      <CinematicOverlay message={cinema} onClose={() => setCinema(null)} />
      <ImmersiveNotification text={notice} onClose={() => setNotice(null)} />
      {betrayal && <BetrayalModal recorded={betrayalRecorded} onAccept={() => { setBetrayalRecorded(true); setNotice("Votre choix a été enregistré.") }} onDecline={() => { setBetrayal(false); setBetrayalRecorded(false) }} onClose={() => { setBetrayal(false); setBetrayalRecorded(false) }} />}

      {screen === "menu" && <Menu setScreen={setScreen} openCinema={openCinema} />}
      {screen === "room" && <RoomFlow room={cageRoom} gameSlug="cagewild" gameTitle="CAGE WILD" accent="red" minPlayers={2} startScreen="duos" initialView={initialJoinCode ? "join" : "select"} initialJoinCode={initialJoinCode} onEnterGame={() => setScreen("duos")} onBack={() => setScreen("menu")} />}
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
      {screen === "traitor" && <InfoGrid eyebrow="Couche privée" title="Écran du traître" icon={Eye} items={["Des offres secrètes peuvent apparaître pendant n'importe quelle épreuve.", "Accepter modifie immédiatement les résultats simulés localement.", "Le système ne révèle jamais publiquement les noms des traîtres."]} />}
      {screen === "history" && <InfoGrid eyebrow="Archive" title="Historique" icon={History} items={history} />}
      {screen === "profiles" && <Profiles players={players} />}

      <nav className="fixed bottom-4 left-4 right-4 z-30 mx-auto grid max-w-3xl grid-cols-6 gap-2 rounded-[1.5rem] border border-white/10 bg-black/70 p-2 backdrop-blur-xl">
        {[{ s: "games", i: Trophy }, { s: "ranking", i: BarChart3 }, { s: "analysis", i: Sparkles }, { s: "traitor", i: ShieldAlert }, { s: "history", i: History }, { s: "profiles", i: Users }].map(({ s, i: Icon }) => <button key={s} onClick={() => setScreen(s as Screen)} className="flex items-center justify-center rounded-2xl py-3 text-zinc-300 transition hover:bg-white/10 hover:text-white"><Icon className="h-5 w-5" /></button>)}
      </nav>
      </Shell>
    </>
  )
}

function BetrayalModal({ recorded, onAccept, onDecline, onClose }: { recorded: boolean; onAccept: () => void; onDecline: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-5 backdrop-blur-md"><Panel className={`w-full max-w-lg p-7 text-center md:p-10 ${recorded ? "animate-pulse border-red-300/70 shadow-red-950/80" : ""}`}><ShieldAlert className="mx-auto mb-6 h-16 w-16 text-red-300" /><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">Offre privée</p><h2 className="mt-4 text-4xl font-black">{recorded ? "Votre choix a été enregistré." : "Trahissez votre partenaire pour obtenir plus."}</h2><p className="mt-5 text-zinc-300">{recorded ? "Le système n'expliquera pas ce qui a changé. Votre partenaire ne verra que les conséquences." : "Cet écran n'est visible que sur cet appareil. Accepter modifie silencieusement le prochain résultat."}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{recorded ? <button onClick={onClose} className="sm:col-span-2 rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Retour à la partie</button> : <><button onClick={onAccept} className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">ACCEPTER</button><button onClick={onDecline} className="rounded-2xl border border-white/15 px-5 py-4 font-black">REFUSER</button></>}</div></Panel></div>
}

function Menu({ setScreen, openCinema }: { setScreen: (screen: Screen) => void; openCinema: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="w-full max-w-3xl p-6 text-center md:p-10"><div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-[2rem] border border-red-400/40 md:h-36 md:w-36"><Image src="/cagewild/cover.png" alt="Cage Wild" fill className="object-cover" /></div><p className="text-xs font-black uppercase tracking-[0.4em] text-red-300">Personne n'abandonne</p><h1 className="mt-3 text-5xl font-black md:text-8xl">CAGE WILD</h1><p className="mx-auto mt-5 max-w-xl text-zinc-300">Une expérience psychologique multijoueur locale en duo. Les téléphones portent des secrets. Les visages portent des mensonges.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><button onClick={() => setScreen("room")} className="rounded-2xl bg-red-200 px-6 py-5 text-lg font-black text-zinc-950 transition hover:scale-[1.02]">Entrer</button><button onClick={openCinema} className="rounded-2xl border border-red-300/30 bg-red-950/30 px-6 py-5 text-lg font-black">Diffusion</button><Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-lg font-black transition hover:bg-white/15">Quitter la plateforme</Link></div></Panel></div>
}

function Duos({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  const duos = [["NOVA", "MIRAGE"], ["VANTA", "ORION"], ["ECHO", "LYNX"]]
  return <div><ScreenTitle eyebrow="Système de paires" title="Sélection des duos" text="Les paires sont visibles, mais la pression assignée à chaque appareil reste privée." /><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{duos.map((duo, index) => { const broken = duo.some((name) => players.find((p) => p.name === name)?.status === "eliminated"); return <Panel key={duo.join("/")} className={`p-6 ${broken ? "border-red-300/50 bg-red-950/20" : ""}`}><div className="mb-5 flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-950/60 to-white/5"><Fingerprint className="h-10 w-10 text-red-300" /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Duo {index + 1}</p><h2 className="mt-2 text-2xl font-black">{duo.join(" / ")}</h2><p className="mt-3 text-sm text-zinc-400">{broken ? "Lien brisé. Un joueur reste seul." : "Lien stable. Niveau de confiance inconnu."}</p></Panel> })}</div><div className="mx-auto mt-6 flex max-w-6xl justify-center"><button onClick={() => setScreen("games")} className="rounded-2xl bg-red-200 px-8 py-4 font-black text-zinc-950">Choisir une épreuve</button></div></div>
}

function Games({ setScreen, openCinema, openNotice }: { setScreen: (screen: Screen) => void; openCinema: () => void; openNotice: () => void }) {
  return <div><ScreenTitle eyebrow="Épreuves" title="Jeux dans la cage" text="Certaines règles sont visibles. Les parties importantes ne le sont pas." /><div className="mx-auto mb-5 grid max-w-6xl gap-3 sm:grid-cols-2"><button onClick={openCinema} className="rounded-2xl border border-red-300/30 bg-red-950/25 px-5 py-4 font-black">Diffusion cinématique</button><button onClick={openNotice} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 font-black">Notification privée</button></div><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">{trials.map((game) => <button key={game.id} onClick={() => setScreen(game.locked ? "locked" : game.id as Screen)} className="group rounded-[2rem] border border-white/10 bg-black/45 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-300/50"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">{game.status}</p><h2 className="mt-3 text-2xl font-black md:text-3xl">{game.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{game.text}</p></div>{game.locked ? <Lock className="h-8 w-8 text-zinc-500" /> : <ChevronRight className="h-8 w-8 text-red-300 transition group-hover:translate-x-1" />}</div></button>)}</div></div>
}

function MonopolicePreview() {
  const spaces = ["BONUS", "PASSE", "VIDE", "PÉNALITÉ", "NEUTRE", "RUPTURE", "BONUS", "PÉNALITÉ", "ROI", "PASSE", "VIDE", "FIN"]
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Bientôt disponible" title="MONOPOLICE DU ROI" text="Le roi n'a pas encore ouvert le jeu, mais le plateau observe déjà les joueurs." /><div className="grid gap-5 lg:grid-cols-[1fr_340px]"><Panel className="p-5 md:p-8"><div className="grid grid-cols-3 gap-3 md:grid-cols-4">{spaces.map((space, index) => <div key={`${space}-${index}`} className={`flex aspect-square flex-col items-center justify-center rounded-2xl border text-center text-xs font-black ${space === "VIDE" || space === "RUPTURE" ? "border-red-300/40 bg-red-950/40 text-red-100" : space === "BONUS" ? "border-emerald-300/30 bg-emerald-950/20 text-emerald-100" : "border-white/10 bg-white/5 text-zinc-300"}`}><span>{space}</span>{space === "ROI" && <Lock className="mt-2 h-5 w-5" />}</div>)}</div></Panel><Panel className="p-6"><Dice5 className="mb-5 h-14 w-14 animate-pulse text-red-300" /><h2 className="text-3xl font-black">Aperçu scellé</h2><p className="mt-4 text-sm leading-7 text-zinc-300">Un joueur lance. L'autre subit. Les pénalités réduisent la jauge de passe. Les bonus la restaurent. Les cases destructrices restent classifiées.</p><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-500"><span>Jauge de passe</span><span>63%</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[63%] rounded-full bg-gradient-to-r from-red-700 to-red-200" /></div></div><div className="mt-6 rounded-2xl border border-red-300/30 bg-red-950/20 p-4 text-center font-black text-red-100"><Lock className="mx-auto mb-2 h-6 w-6" />Bientôt disponible</div></Panel></div></div>
}

function PokerFace({ setScreen, openNotice }: { setScreen: (screen: Screen) => void; openNotice: () => void }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow="Logique cachée" title="POKER FACE" text="Saisissez un nombre. Choisissez une main. Le système semble calculer, mais ne dit jamais toute la vérité." /><Panel className="grid gap-5 p-6 md:grid-cols-2 md:p-8"><div className="rounded-[1.5rem] bg-white/5 p-6"><p className="text-sm text-zinc-400">Nombre secret</p><div className="mt-4 grid grid-cols-6 gap-2">{Array.from({ length: 11 }, (_, i) => <button key={i} className="rounded-xl border border-white/10 py-3 font-black hover:border-red-300">{i}</button>)}</div></div><div className="rounded-[1.5rem] bg-white/5 p-6"><p className="text-sm text-zinc-400">Analyse mentale</p><div className="mt-5 space-y-3">{["Moyenne en formation...", "Faux indice injecté", "Schéma instable"].map((item, index) => <div key={item} className="rounded-xl bg-black/35 p-3 text-sm text-zinc-300"><span className="mr-3 text-red-300">0{index + 1}</span>{item}</div>)}</div><div className="mt-5 flex gap-2 text-xs text-zinc-500">{[6.4, 2.1, 5.8, 4.9].map((avg) => <span key={avg} className="rounded-full bg-white/10 px-3 py-1">moy {avg}</span>)}</div></div></Panel><div className="mt-5 grid gap-3 sm:grid-cols-3"><button onClick={openNotice} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Faux indice</button><button className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Main forte</button><button onClick={() => setScreen("ranking")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Sceller</button></div></div>
}

function RockPaperKings({ choice, setChoice, setScreen, openBetrayal }: { choice: string; setChoice: (choice: string) => void; setScreen: (screen: Screen) => void; openBetrayal: () => void }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow="Classement toutes les 3 manches" title="ROIS PIERRE-PAPIER" text="Choisissez un geste. La révélation est lente. Votre partenaire peut ne plus être aligné." /><div className="grid gap-4 md:grid-cols-3">{["Pierre", "Papier", "Ciseaux"].map((item) => <button key={item} onClick={() => setChoice(item)} className={`rounded-[2rem] border p-8 text-3xl font-black transition hover:-translate-y-1 ${choice === item ? "border-red-300 bg-red-200 text-zinc-950" : "border-white/10 bg-black/45"}`}>{item}</button>)}</div><Panel className="mt-5 p-6 text-center"><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">Révélation lente</p><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-white/5 p-5"><p className="text-3xl"></p><p className="mt-2 text-xs text-zinc-500">Vous</p></div><div className="rounded-2xl bg-red-950/30 p-5 animate-pulse"><p className="text-3xl">?</p><p className="mt-2 text-xs text-zinc-500">Partenaire</p></div><div className="rounded-2xl bg-white/5 p-5"><p className="text-3xl">?</p><p className="mt-2 text-xs text-zinc-500">Adversaire</p></div></div><p className="mt-5 text-sm text-zinc-400">Le système annonce une confiance, puis la retire.</p></Panel><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={openBetrayal} className="flex-1 rounded-2xl border border-red-400/40 bg-red-950/30 px-5 py-4 font-black text-red-100">Déclencher une offre secrète</button><button onClick={() => setScreen("ranking")} className="flex-1 rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Résultat ambigu</button></div></div>
}

function Signal({ signalStop, setSignalStop, setScreen, openNotice }: { signalStop: number | null; setSignalStop: (value: number) => void; setScreen: (screen: Screen) => void; openNotice: () => void }) {
  return <div className="mx-auto max-w-3xl"><ScreenTitle eyebrow="Synchronisation secrète" title="LE SIGNAL" text="Un téléphone connaît le temps. Le partenaire doit résister aux faux signaux et à la pression visuelle." /><Panel className="p-8 text-center md:p-12"><div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-full border border-red-300/30 bg-red-950/20 shadow-2xl shadow-red-950/40"><Zap className="h-16 w-16 animate-pulse text-red-300" /></div><div className="text-7xl font-black tabular-nums md:text-9xl">00:{signalStop ?? "??"}</div><div className="mt-6 grid grid-cols-5 gap-2">{Array.from({ length: 15 }, (_, index) => <div key={index} className={`h-2 rounded-full ${index % 4 === 0 ? "bg-red-300 animate-pulse" : "bg-white/10"}`} />)}</div><p className="mt-5 text-zinc-400">De faux battements peuvent apparaître avant la vraie fenêtre.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><button onClick={openNotice} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Faux signal</button><button onClick={() => setSignalStop(Math.floor(15 + Math.random() * 46))} className="rounded-2xl border border-red-300/40 bg-red-950/25 px-5 py-4 font-black">STOP</button><button onClick={() => setScreen("ranking")} className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Classer</button></div></Panel></div>
}

function Ranking({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Vérité indirecte" title="Classement" text="Aucune formule. Aucune explication exacte. Seulement du mouvement, du soupçon et de l'interprétation." /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Panel className="overflow-hidden p-4 md:p-6">{players.map((player, index) => <div key={player.id} className="mb-3 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-200 font-black text-zinc-950">{index + 1}</div><div className="flex-1"><p className="font-black">{player.name}</p><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{player.code}  {statusLabels[player.status]}</p></div><div className="text-right"><p className="text-2xl font-black">{player.score.toFixed(1)}P</p><p className="text-xs text-zinc-500">estimé</p></div></div>)}</Panel><Panel className="p-6"><AlertTriangle className="mb-4 h-10 w-10 text-red-300" /><h2 className="text-2xl font-black">Nombre de traîtres</h2><p className="mt-3 text-5xl font-black">1?</p><p className="mt-3 text-sm text-zinc-400">Le système indique une instabilité, mais aucun nom n'est révélé.</p><div className="mt-6 grid gap-3"><button onClick={() => setScreen("debate")} className="rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Lancer le débat</button><button onClick={() => setScreen("analysis")} className="rounded-2xl border border-white/15 px-5 py-4 font-black">Analyse</button></div></Panel></div></div>
}

function Debate({ players, voteTarget, setVoteTarget, setScreen }: { players: Player[]; voteTarget: string; setVoteTarget: (target: string) => void; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Phase d'accusation" title="Parlez avant le vote" text="Sélectionnez un suspect, défendez votre position à voix haute et observez comment chaque portrait réagit sous pression." /><Panel className="p-6 md:p-8"><div className="mb-8 flex items-center justify-center gap-3 text-red-200"><Clock className="h-8 w-8" /><span className="text-6xl font-black tabular-nums md:text-8xl">01:15</span></div><div className="grid gap-3 md:grid-cols-3">{players.filter((p) => p.status !== "eliminated").map((player) => <button key={player.id} onClick={() => setVoteTarget(player.name)} className={`rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-1 ${voteTarget === player.name ? "border-red-300 bg-red-200 text-zinc-950" : "border-white/10 bg-white/5"}`}><div className="mb-4 flex h-20 items-center justify-center rounded-2xl bg-black/25"><Eye className="h-8 w-8" /></div><p className="text-xl font-black">{player.name}</p><p className="text-sm opacity-70">{player.tone}</p></button>)}</div><button onClick={() => setScreen("vote")} className="mt-6 w-full rounded-2xl bg-red-200 px-5 py-4 font-black text-zinc-950">Confirmer l'accusation</button></Panel></div>
}

function VoteScreen({ players, voteTarget, setVoteTarget, voteCorrect, setVoteCorrect, resolveVote }: { players: Player[]; voteTarget: string; setVoteTarget: (target: string) => void; voteCorrect: boolean; setVoteCorrect: (value: boolean) => void; resolveVote: () => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Vote public" title="Choisissez qui disparaît" text="Cette simulation frontend permet de prévisualiser les résolutions psychologiques correctes et incorrectes." /><Panel className="p-6 md:p-8"><div className="mb-6 flex items-center justify-center gap-3 text-red-200"><Vote className="h-8 w-8" /><span className="text-5xl font-black tabular-nums">00:45</span></div><div className="grid gap-3 md:grid-cols-3">{players.filter((p) => p.status !== "eliminated").map((player) => <button key={player.id} onClick={() => setVoteTarget(player.name)} className={`rounded-2xl border p-5 text-left ${voteTarget === player.name ? "border-red-300 bg-red-200 text-zinc-950" : "border-white/10 bg-white/5"}`}><p className="text-xl font-black">{player.name}</p><p className="text-sm opacity-70">{player.code}  {player.tone}</p></button>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><button onClick={() => setVoteCorrect(true)} className={`rounded-2xl px-5 py-4 font-black ${voteCorrect ? "bg-red-200 text-zinc-950" : "border border-white/15"}`}>Vote correct</button><button onClick={() => setVoteCorrect(false)} className={`rounded-2xl px-5 py-4 font-black ${!voteCorrect ? "bg-red-200 text-zinc-950" : "border border-white/15"}`}>Vote incorrect</button><button onClick={resolveVote} className="rounded-2xl border border-red-300/40 bg-red-950/30 px-5 py-4 font-black text-red-100">Révéler</button></div></Panel></div>
}

function VoteResult({ correct = false, target, onContinue }: { correct?: boolean; target: string; onContinue: () => void }) {
  return <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"><Panel className="max-w-2xl p-8 text-center md:p-12"><Skull className="mx-auto mb-6 h-20 w-20 animate-pulse text-red-300" /><p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">{correct ? "Vote correct" : "Vote incorrect"}</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{correct ? `${target} disparaît` : "Le vrai traître est encore parmi vous."}</h1><p className="mt-5 text-zinc-300">{correct ? "Un traître a été retiré. Son partenaire perd aussi sa place dans la cage." : "L'accusateur principal disparaît. Le groupe doit vivre avec l'erreur."}</p><button onClick={onContinue} className="mt-8 rounded-2xl bg-red-200 px-6 py-4 font-black text-zinc-950">Continuer</button></Panel></div>
}

function Recompose({ players, setScreen }: { players: Player[]; setScreen: (screen: Screen) => void }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Recomposition" title="La confiance a été brisée" text="Une disparition brise un duo. Le système cherche de nouvelles paires sans demander si quelqu'un est prêt." /><div className="grid gap-4 md:grid-cols-3">{players.filter((p) => p.status !== "eliminated").slice(0, 3).map((player, index) => <Panel key={player.id} className="p-6"><div className="mb-5 flex h-24 items-center justify-center rounded-2xl bg-red-950/25"><Fingerprint className="h-10 w-10 text-red-300" /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Nouveau lien {index + 1}</p><h2 className="mt-2 text-2xl font-black">{player.name}</h2><p className="mt-3 text-sm text-zinc-400">Recherche d'un survivant compatible...</p></Panel>)}</div><button onClick={() => setScreen("games")} className="mt-6 w-full rounded-2xl bg-red-200 px-6 py-4 font-black text-zinc-950">Accepter le nouvel ordre</button></div>
}

function Analysis() {
  const items = ["Un joueur a plus de points que son partenaire.", "Une anomalie a été détectée.", "Les résultats semblent incohérents.", "Un choix privé a peut-être influencé un résultat public.", "Le coefficient de confiance diminue.", "Les écarts de points augmentent silencieusement."]
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Analyse psychologique" title="Statistiques ambiguës" text="Le système montre des schémas suspects, jamais de preuve." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <Panel key={item} className="p-6"><Gauge className="mb-5 h-10 w-10 text-red-300" /><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Signal {index + 1}</p><h2 className="mt-3 text-xl font-black leading-8">{item}</h2><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-200" style={{ width: `${52 + index * 7}%` }} /></div></Panel>)}</div></div>
}

function InfoGrid({ eyebrow, title, icon: Icon, items }: { eyebrow: string; title: string; icon: LucideIcon; items: string[] }) {
  return <div className="mx-auto max-w-5xl"><ScreenTitle eyebrow={eyebrow} title={title} text="L'information est volontairement partielle. Le système en donne assez pour créer le doute, jamais assez pour créer la certitude." /><div className="grid gap-4 md:grid-cols-3">{items.map((item) => <Panel key={item} className="p-6"><Icon className="mb-5 h-9 w-9 text-red-300" /><p className="leading-7 text-zinc-300">{item}</p></Panel>)}</div></div>
}

function Profiles({ players }: { players: Player[] }) {
  return <div className="mx-auto max-w-6xl"><ScreenTitle eyebrow="Joueurs" title="Profils" text="Portraits, statuts, partenaires et indicateurs incomplets de pression financière." /><div className="grid gap-4 md:grid-cols-3">{players.map((player) => <Panel key={player.id} className={`p-6 ${player.status === "eliminated" ? "opacity-45 grayscale" : ""}`}><div className="mb-5 flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-950/70 to-white/5"><Crown className="h-10 w-10 text-red-300" /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">{player.code}</p><h2 className="mt-2 text-2xl font-black">{player.name}</h2><p className="mt-2 text-sm text-zinc-400">Partenaire : {player.partner}</p><p className="mt-1 text-sm text-zinc-500">Statut : {statusLabels[player.status]}</p><div className="mt-5 flex items-center gap-2 text-red-200"><BadgeDollarSign className="h-5 w-5" /><span className="font-black">{player.score.toFixed(1)}P</span></div></Panel>)}</div></div>
}
