"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SlUser, SlBriefcase, SlHome } from "react-icons/sl";

export default function RegisterPage() {
  const userTypes = [
    {
      type: 'client',
      title: 'Sou Cliente',
      description: 'Procuro imóveis para comprar ou alugar',
      icon: <SlUser className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      features: ['Buscar imóveis', 'Salvar favoritos', 'Receber recomendações']
    },
    {
      type: 'broker',
      title: 'Sou Corretor',
      description: 'Trabalho com vendas de imóveis',
      icon: <SlBriefcase className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      features: ['Cadastrar imóveis', 'Gerenciar anúncios', 'Atender clientes']
    },
    {
      type: 'company',
      title: 'Sou Imobiliária',
      description: 'Represento uma empresa de construção',
      icon: <SlHome className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      features: ['Cadastrar empreendimentos', 'Equipe de vendas', 'Dashboard completo']
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/img-1.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      
      <main className="relative z-10 w-full max-w-6xl px-6 py-20">
        <div className="mb-8 flex items-center justify-center gap-3 bg-white/6 backdrop-blur-md rounded-full px-4 py-2 w-fit mx-auto">
          <Image src="/icons8-home.svg" alt="EasyHome" width={36} height={36} />
          <span className="font-bold text-white text-xl">EasyHome</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-4 gradient-text">
            Criar Conta
          </h1>
          <p className="text-white/80 text-lg font-medium drop-shadow">
            Escolha o tipo de conta que deseja criar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userTypes.map((userType) => (
            <Link
              key={userType.type}
              href={`/auth/register/${userType.type}`}
              className="group"
            >
              <div className="card-glass p-8 hover:bg-white/20 transition-all duration-300 h-full flex flex-col">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${userType.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-xl`}>
                  <span className="text-white text-4xl">{userType.icon}</span>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-3">
                  {userType.title}
                </h2>

                <p className="text-white/70 text-center mb-6 flex-grow">
                  {userType.description}
                </p>

                <div className="space-y-2 mb-6">
                  {userType.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-3 rounded-xl bg-gradient-to-r ${userType.color} text-white font-bold shadow-lg hover:shadow-xl transition-all group-hover:scale-105`}>
                  Começar
                </button>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <p className="text-white/70">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-white font-bold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
