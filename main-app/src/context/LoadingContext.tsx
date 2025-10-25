"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react'
import Image from 'next/image'

type LoadingContextType = {
  show: () => void
  hide: () => void
  visible: boolean
}

const LoadingContext = createContext<LoadingContextType | null>(null)

export function useLoading(){
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider')
  return ctx
}

export function LoadingProvider({ children }: { children: ReactNode }){
  const [visible, setVisible] = useState(false)
  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  return (
    <LoadingContext.Provider value={{ show, hide, visible }}>
      {children}
      <LoadingOverlay visible={visible} />
    </LoadingContext.Provider>
  )
}

function LoadingOverlay({ visible }: { visible: boolean }){
  if (!visible) return null
  return (
    <div aria-hidden={!visible} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cta-start to-cta-end flex items-center justify-center animate-pulse-shadow">
          <Image src="/favicon.svg" alt="logo" width={48} height={48} className="w-12 h-12" />
        </div>
        <div className="text-white">Carregando...</div>
      </div>
    </div>
  )
}
