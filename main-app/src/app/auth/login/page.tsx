"use client";

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient, EmailExistsError } from '@/lib/api'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) setEmail(emailParam)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', email)
        await login(email, password)
        console.log('Login successful')
        const returnTo = searchParams.get('returnTo')
        router.push(returnTo || '/recommendations')
      } else {
        // Registration validations
        if (!firstName.trim()) {
          setError('Nome é obrigatório')
          return
        }
        if (!lastName.trim()) {
          setError('Sobrenome é obrigatório')
          return
        }
        if (password !== confirmPassword) {
          setError('As senhas não conferem')
          return
        }
        if (password.length < 8) {
          setError('A senha deve ter pelo menos 8 caracteres')
          return
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          setError('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
          return
        }
        
        console.log('Attempting registration with:', { email, firstName, lastName })
        await apiClient.register(email, password, 'USER', firstName, lastName)
        console.log('Registration successful, logging in...')
        await login(email, password)
        console.log('Login after registration successful')
        const returnTo = searchParams.get('returnTo')
        router.push(returnTo || '/recommendations')
      }
    } catch (err: unknown) {
      console.error('Auth error:', err)
      
      // Handle email already exists error specifically
      if (err instanceof EmailExistsError) {
        // Switch to login mode and show helpful message
        setIsLogin(true)
        setError(`Este email já possui uma conta. Entre com sua senha ou redefina-a se esqueceu.`)
        // Keep the email filled, clear password fields for security
        setPassword('')
        setConfirmPassword('')
        return
      }
      
      let msg = isLogin ? 'Erro ao fazer login' : 'Erro ao criar conta'
      if (err && typeof err === 'object' && 'message' in err) {
        msg = String((err as Record<string, unknown>)['message'])
      } else if (typeof err === 'string') {
        msg = err
      }
      
      // Fallback for other email exists errors (if the custom error didn't catch it)
      if (!isLogin && (msg.includes('Email já cadastrado') || msg.includes('already exists') || msg.includes('já existe'))) {
        setIsLogin(true)
        setError('Este email já possui uma conta. Entre com sua senha ou redefina-a se esqueceu.')
        setPassword('')
        setConfirmPassword('')
        return
      }
      
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/img-1.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      
      <main className="relative z-10 w-full max-w-md px-6 py-20">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3 bg-white/6 backdrop-blur-md rounded-full px-4 py-2 w-fit mx-auto">
          <Image src="/icons8-home.svg" alt="EasyHome" width={36} height={36} />
          <span className="font-bold text-white">EasyHome</span>
        </div>

        {/* Auth Card */}
        <div className="card-glass p-8 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-white text-center mb-2 gradient-text">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-white/80 text-center mb-8 font-medium">
            {isLogin ? 'Entre para continuar sua busca' : 'Comece a encontrar seu imóvel ideal'}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-white/90 mb-2">
                    Nome
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder="João"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-white/90 mb-2">
                    Sobrenome
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder="Silva"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="••••••••"
                minLength={8}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-white/60">
                  Mínimo 8 caracteres, com letra maiúscula, minúscula e número
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-2">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            )}

            {error && (
              <div className="text-white text-sm bg-red-500/30 backdrop-blur-sm p-3 rounded-xl border border-red-400/50">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full shadow-glow"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner-small mr-2"></div>
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {isLogin ? (
              <Link href="/auth/register" className="text-white/90 hover:text-white text-sm font-semibold transition-colors">
                Não tem uma conta? Criar conta
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true)
                  setError(null)
                  setConfirmPassword('')
                  setFirstName('')
                  setLastName('')
                }}
                className="text-white/90 hover:text-white text-sm font-semibold transition-colors"
              >
                Já tem uma conta? Fazer login
              </button>
            )}
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-white/70 hover:text-white/90 transition-colors">
                ← Voltar para home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[url('/img-1.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-white">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
