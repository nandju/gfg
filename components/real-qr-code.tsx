"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import QRCode from "qrcode"

export function RealQrCode({ value, size = 224, className = "" }: { value: string; size?: number; className?: string }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    QRCode.toDataURL(value, { width: size * 2, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => { if (mounted) setSrc(url) })
      .catch(() => { if (mounted) setSrc(null) })
    return () => { mounted = false }
  }, [value, size])

  return (
    <div className={`flex items-center justify-center rounded-3xl bg-white p-4 shadow-2xl ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt="QR code pour rejoindre la partie" width={size - 32} height={size - 32} unoptimized />
      ) : (
        <div className="h-full w-full animate-pulse rounded-2xl bg-zinc-200" />
      )}
    </div>
  )
}
