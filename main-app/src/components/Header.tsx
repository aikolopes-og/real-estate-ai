"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { SlMagnifier, SlHome, SlHeart, SlPlus, SlUser, SlLogout, SlLogin } from "react-icons/sl"

export default function Header(){
  const { user, logout } = useAuth()
  
  // Verifica se o usuário pode cadastrar imóveis (BROKER)
  const canRegisterProperties = user?.role === 'BROKER';
  
  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 backdrop-blur-3xl bg-white/12 border-b border-white/25 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md">
            <Image src="/favicon.svg" alt="logo" width={24} height={24} className="sm:w-7 sm:h-7" />
          </div>
          <span className="font-extrabold text-base sm:text-xl text-white drop-shadow-lg hidden sm:inline">EasyHome</span>
        </Link>

        <div className="flex-1 hidden md:block">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/25 rounded-full shadow-lg px-4 py-2.5 hover:bg-white/15 transition-all">
              <input 
                aria-label="Pesquisar" 
                placeholder="Buscar cidade, bairro ou imóvel" 
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/90 font-medium" 
              />
              <button 
                aria-label="Buscar" 
                className="ml-3 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <SlMagnifier className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <Link 
            href="/imoveis" 
            className="text-xs sm:text-sm font-bold text-white/95 hover:text-white transition-colors drop-shadow-lg hidden sm:flex items-center gap-1"
          >
            <SlHome className="w-4 h-4" />
            Imóveis
          </Link>
          {/* Mostrar Recomendações apenas para usuários normais (não BROKER) */}
          {(!user || user.role !== 'BROKER') && (
            <Link 
              href="/recommendations" 
              className="text-xs sm:text-sm font-bold text-white/95 hover:text-white transition-colors drop-shadow-lg hidden sm:flex items-center gap-1"
            >
              <SlHeart className="w-4 h-4" />
              Recomendações
            </Link>
          )}
          {user ? (
            <>
              {canRegisterProperties && (
                <Link 
                  href="/cadastrar-imovel" 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-xl border border-white/40 text-xs sm:text-sm font-bold text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center gap-1"
                >
                  <SlPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Cadastrar Imóvel</span>
                  <span className="sm:hidden">Cadastrar</span>
                </Link>
              )}
              <Link 
                href="/profile" 
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-xs sm:text-sm font-bold text-white hover:bg-white/30 transition-all shadow-lg truncate max-w-[120px] sm:max-w-none flex items-center gap-1"
              >
                <SlUser className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{user.name ?? user.email}</span>
              </Link>
              <button
                onClick={logout}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500/20 backdrop-blur-xl border border-red-500/40 text-xs sm:text-sm font-bold text-red-200 hover:bg-red-500/30 transition-all shadow-lg flex items-center gap-1"
              >
                <SlLogout className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <Link 
              href="/auth/login" 
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-xs sm:text-sm font-bold text-white hover:bg-white/30 transition-all shadow-lg flex items-center gap-1"
            >
              <SlLogin className="w-4 h-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
