"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

function SliderCard() {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(50000);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [value, setValue] = useState(70000);
  const [tipo, setTipo] = useState<'Casa'|'Apartamento'>('Casa')
  const [presets, setPresets] = useState([70000, 150000, 500000])

  // Buscar faixa de preços do banco baseado no tipo selecionado
  useEffect(() => {
    async function fetchPriceRange() {
      try {
        // Passar o tipo como query parameter
        const response = await fetch(`http://localhost:8001/api/search/price-range?type=${tipo}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const { min, max } = data.data;
            setMinPrice(min);
            setMaxPrice(max);
            
            // Definir valor inicial como o mínimo (onde o slider começa)
            setValue(min);
            
            // Calcular presets: mínimo, meio e 75%
            const preset1 = min; // Primeiro preset = menor preço real
            const preset2 = Math.round(min + (max - min) * 0.5); // Meio
            const preset3 = Math.round(min + (max - min) * 0.75); // 75%
            setPresets([preset1, preset2, preset3]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar faixa de preços:', error);
      }
    }
    
    fetchPriceRange();
  }, [tipo]); // Re-executar quando o tipo mudar!

  const pct = useMemo(() => {
    const p = Math.max(0, Math.min(1, (value - minPrice) / (maxPrice - minPrice)))
    return Math.round(p * 100)
  }, [value, minPrice, maxPrice])

  function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function choose(p: number){
    setValue(p)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div role="radiogroup" aria-label="Tipo de imóvel" className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
        {(['Casa','Apartamento'] as const).map((opt)=> (
          <button
            key={opt}
            onClick={() => setTipo(opt)}
            aria-pressed={tipo===opt}
            className={`px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${tipo===opt ? 'radio-selected' : 'radio-unselected'}`}>
            {opt}
          </button>
        ))}
      </div>

      <div className="bg-white/12 backdrop-blur-3xl border border-white/30 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl animate-fade-in-up">
        {/* Price display - white text to match header design */}
        <div className="text-center text-white font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 drop-shadow-lg">
          Até {formatBRL(value)}
        </div>

        <input
          aria-label="Valor desejado"
          type="range"
          min={minPrice}
          max={maxPrice}
          step={1000}
          value={value}
          onChange={(e)=> setValue(Number(e.target.value))}
          className="w-full slider-blue mb-4 sm:mb-6"
          style={{background: `linear-gradient(90deg, #10aff8 ${pct}%, rgba(255,255,255,0.25) ${pct}%)`}}
        />

        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => choose(p)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 ${value===p ? 'radio-selected' : 'radio-unselected'}`}>
              {formatBRL(p)}
            </button>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 flex items-center justify-center px-2">
          <button 
            onClick={() => router.push(`/imoveis?type=${encodeURIComponent(tipo)}&priceMax=${value}`)} 
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm sm:text-base font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 animate-pulse-gentle">
            Buscar Imóveis
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home(){
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Darker blue gradient base layer for ice design */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 z-0" />
      
      {/* Background image on top with 60% opacity for perfect blending */}
      <div className="absolute inset-0 bg-[url('/img-1.webp')] bg-cover bg-center bg-fixed opacity-60 z-0" />
      
      {/* Additional dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="relative z-10">
        <Header />

        <main className="relative w-full flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-16 sm:py-20 pt-20 sm:pt-24">
          {/* small top logo */}
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 bg-white/6 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
            <Image src="/icons8-home.svg" alt="EasyHome" width={28} height={28} className="sm:w-9 sm:h-9" />
            <span className="font-bold text-sm sm:text-base text-white">EasyHome</span>
          </div>

          {/* headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white text-center max-w-3xl leading-tight mb-3 sm:mb-4 px-2 drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
            Compre o imóvel dos seus sonhos em Goiânia.
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/95 text-center max-w-2xl mb-6 sm:mb-8 px-4 font-medium" style={{textShadow: '0 10px 40px rgba(0,0,0,0.9)'}}>
            Encontre casas e apartamentos na capital de Goiás. Defina seu orçamento e descubra as melhores oportunidades.
          </p>

          {/* frosted hero card (single clean card without large translucent outer) */}
          <div className="w-full max-w-3xl px-2 sm:px-4">
            <div className="mx-auto p-0">
              <SliderCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

