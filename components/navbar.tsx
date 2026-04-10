"use client"

import { User, Music, Image as ImageIcon, Gift, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"

interface NavbarProps {
  isMusicPlaying: boolean
  onToggleMusic: () => void
}

export function Navbar({ isMusicPlaying, onToggleMusic }: NavbarProps) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-30 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Logo */}
        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-1D4w14VdJaweQDPMBlcaNX8jygy0Yp.jpg"
            alt="Logo"
            fill
            className="object-cover"
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 md:gap-2 bg-secondary/80 backdrop-blur-md rounded-full px-2 py-1 md:px-3 md:py-2">
          <NavButton icon={User} label="Profil" active />
          <NavButton 
            icon={isMusicPlaying ? Volume2 : VolumeX} 
            label="Musique" 
            onClick={onToggleMusic}
          />
          <NavButton icon={ImageIcon} label="Galerie" />
          <NavButton icon={Gift} label="Bonus" />
        </div>
      </div>
    </nav>
  )
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  onClick?: () => void
}

function NavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/70 hover:bg-primary/20 hover:text-foreground"
      }`}
      title={label}
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
      <span className="hidden md:inline text-sm font-medium">{label}</span>
    </button>
  )
}
