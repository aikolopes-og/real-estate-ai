"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    } else {
      setLoading(false);
    }
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'USER':
        return 'Cliente';
      case 'BROKER':
        return 'Corretor';

      case 'ADMIN':
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'USER':
        return '👤';
      case 'BROKER':
        return '🏢';

      case 'ADMIN':
        return '⚙️';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3"
            >
              <Image src="/icons8-home.svg" alt="EasyHome" width={32} height={32} />
              <span className="font-bold text-white text-xl">EasyHome</span>
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 font-semibold hover:bg-red-500/30 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card-glass p-8 mb-8 animate-fade-in-up">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-5xl flex-shrink-0">
                {getRoleIcon(user?.role)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-white gradient-text mb-2">
                  {user?.name || 'Usuário'}
                </h1>
                <p className="text-white/70 text-lg mb-4">{user?.email}</p>
                <div className="inline-block px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-white font-semibold">{getRoleLabel(user?.role)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="card-glass p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-white mb-6">Informações do Perfil</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-white/60 text-sm font-medium block mb-1">ID do Usuário</label>
                <p className="text-white font-semibold">{user?.id || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-white/60 text-sm font-medium block mb-1">Email</label>
                <p className="text-white font-semibold">{user?.email || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-white/60 text-sm font-medium block mb-1">Nome</label>
                <p className="text-white font-semibold">{user?.name || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-white/60 text-sm font-medium block mb-1">Tipo de Conta</label>
                <p className="text-white font-semibold">
                  {getRoleLabel(user?.role)}
                  {user?.role === 'BROKER' && user?.brokerRole && (
                    <span className="ml-2 text-sm text-white/70">
                      ({user.brokerRole === 'DIRECTOR' ? 'Diretor' : 'Corretor'})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => router.push('/imoveis')}
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Ver Imóveis
            </button>
            <button
              onClick={() => router.push('/recommendations')}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
            >
              Recomendações
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
