"use client"
import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

type Props = { images: string[], priorityFirst?: boolean }

export default function Gallery({ images, priorityFirst }: Props){
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const prev = useCallback(()=> setIndex(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(()=> setIndex(i => (i + 1) % images.length), [images.length])

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if(!open) return
      if(e.key === 'ArrowLeft') prev()
      if(e.key === 'ArrowRight') next()
      if(e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [open, prev, next])

  if(!images || images.length === 0) return null

  return (
    <div>
      <div className="relative w-full rounded-lg overflow-hidden">
          <div className="w-full aspect-[4/3] relative">
          <Image src={images[index]} alt={`Foto ${index+1}`} fill className="object-cover" priority={Boolean(priorityFirst && index === 0)} />
        </div>
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <button aria-label="Anterior" onClick={prev} className="bg-black/40 text-white rounded-full p-2">‹</button>
          <button aria-label="Abrir galeria" onClick={()=> setOpen(true)} className="bg-black/40 text-white rounded-full p-2">+</button>
          <button aria-label="Próximo" onClick={next} className="bg-black/40 text-white rounded-full p-2">›</button>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-auto">
        {images.map((src, i) => (
          <button key={i} onClick={()=> setIndex(i)} className={`flex-shrink-0 rounded-md overflow-hidden border ${i === index ? 'ring-2 ring-cta-start' : 'border-transparent'}`} style={{ width: 80, height: 60 }}>
            <Image src={src} alt={`Miniatura ${i+1}`} width={80} height={60} className="object-cover" />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full relative">
            <div className="w-full aspect-[16/10] relative rounded-lg overflow-hidden shadow-xl">
              <Image src={images[index]} alt={`Foto ${index+1}`} fill className="object-contain bg-black" priority={Boolean(priorityFirst && index === 0)} />
            </div>
            <button onClick={()=> setOpen(false)} aria-label="Fechar" className="absolute top-3 right-3 bg-white/10 text-white rounded-full p-2">✕</button>
            <button onClick={prev} aria-label="Anterior" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-2">‹</button>
            <button onClick={next} aria-label="Próximo" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-2">›</button>
          </div>
        </div>
      )}
    </div>
  )
}
