"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

function resolveImageUrl(img: string): string {
  if (!img) return "/placeholder.webp"
  if (img.startsWith("http")) return img
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${img}`
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const resolved = images.length > 0 ? images.map(resolveImageUrl) : ["/placeholder.webp"]
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-50">
        <Image
          src={resolved[activeIdx]}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {resolved.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resolved.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                idx === activeIdx
                  ? "border-zinc-900"
                  : "border-transparent hover:border-zinc-300"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
