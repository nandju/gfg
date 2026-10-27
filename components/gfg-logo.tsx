export function GFGLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-red-500 font-black text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.32, letterSpacing: "0.02em" }}
      aria-label="GFG"
    >
      GFG
    </div>
  )
}
