"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterClientPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Nome e sobrenome são obrigatórios');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não conferem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
      setLoading(false);
      return;
    }

    try {
      await apiClient.register(
        formData.email,
        formData.password,
        'USER',
        formData.firstName,
        formData.lastName,
        formData.phone || undefined
      );
      
      // Auto-login após cadastro bem-sucedido
      await login(formData.email, formData.password);
      router.push('/recommendations');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/img-1.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      
      <main className="relative z-10 w-full max-w-md px-6 py-20">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3 bg-white/6 backdrop-blur-md rounded-full px-4 py-2 w-fit mx-auto">
          <Image src="/icons8-home.svg" alt="EasyHome" width={36} height={36} />
          <span className="font-bold text-white text-xl">EasyHome</span>
        </div>

        {/* Card */}
        <div className="card-glass p-8 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white gradient-text mb-2">
              Criar Conta de Cliente
            </h1>
            <p className="text-white/80 font-medium">
              Preencha seus dados para começar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-white/90 mb-2">
                  Nome *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  placeholder="João"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-white/90 mb-2">
                  Sobrenome *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  placeholder="Silva"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-white/90 mb-2">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="(62) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs text-white/60">
                Mínimo 8 caracteres, com letra maiúscula, minúscula e número
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-2">
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            {error && (
              <div className="text-white text-sm bg-red-500/30 backdrop-blur-sm p-3 rounded-xl border border-red-400/50">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/register" className="text-white/80 hover:text-white text-sm font-semibold transition-colors">
              ← Voltar para seleção de tipo
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-white font-bold hover:underline">
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
