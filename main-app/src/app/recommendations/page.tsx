"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { SlLocationPin, SlSizeFullscreen, SlHome, SlDrop } from "react-icons/sl";

interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type?: string;
}

function PropertyCard({ property, index }: { property: Property, index: number }) {
  // Array de imagens de recomendação
  const recommendationImages = [
    '/img-recomendacao/006748d5fa557a1e11e293800a4e809e.jpeg',
    '/img-recomendacao/maxresdefault.jpg',
    '/img-recomendacao/OIP (1).webp',
    '/img-recomendacao/OIP (2).webp',
    '/img-recomendacao/OIP (3).webp',
    '/img-recomendacao/OIP (4).webp',
    '/img-recomendacao/OIP (5).webp',
    '/img-recomendacao/OIP.webp'
  ];
  
  // Converter URL relativa para URL completa do backend
  const getImageUrl = (url: string) => {
    if (!url) return recommendationImages[index % recommendationImages.length];
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8001${url}`;
    }
    return url;
  };
  
  const imageUrl = property.images && property.images.length > 0 
    ? getImageUrl(property.images[0]) 
    : recommendationImages[index % recommendationImages.length];
  
  return (
    <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 group">
      <div className="aspect-[4/3] bg-gray-300/20 rounded-xl mb-4 relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-md rounded-full">
          <span className="text-white text-xs font-bold">Recomendado</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
          {property.title}
        </h3>
        
        <p className="text-white/80 text-sm font-medium drop-shadow flex items-center gap-1">
          <SlLocationPin className="w-4 h-4" />
          {property.city}
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-white font-extrabold text-xl drop-shadow-lg">
            R$ {property.price.toLocaleString('pt-BR')}
          </p>
        </div>
        
        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="flex items-center gap-4 text-white/70 text-xs">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <SlHome className="w-3 h-3" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <SlDrop className="w-3 h-3" /> {property.bathrooms}
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1">
                <SlSizeFullscreen className="w-3 h-3" /> {property.area}m²
              </span>
            )}
          </div>
        )}
        
        <Link 
          href={`/listings/${property.id}`}
          className="block w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      setError(null);
      
      try {
        // Por enquanto, vamos buscar todos os imóveis disponíveis
        // No futuro, pode implementar lógica de recomendação baseada em ML
        const response = await fetch('/api/imoveis', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data && Array.isArray(data.data.properties)) {
          const apiProperties = data.data.properties;

          const transformedProperties: Property[] = apiProperties.map((prop: any) => ({
            id: prop.id,
            title: prop.title || 'Imóvel sem título',
            city: prop.city || prop.address || 'Localização não informada',
            price: prop.price || 0,
            images: prop.images || [],
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            type: prop.type || 'Imóvel'
          }));

          // Shuffle para parecer recomendações diferentes
          const shuffled = transformedProperties.sort(() => 0.5 - Math.random());
          setProperties(shuffled.slice(0, 8)); // Mostra até 8 recomendações
        } else {
          setError('Formato de resposta inválido da API');
        }

      } catch (err) {
        console.error('Erro ao carregar recomendações:', err);
        setError('Falha ao carregar recomendações');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  return (
    <div className="professional-bg min-h-screen">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-4">
              {user ? `Recomendações para ${user.name || user.email}` : 'Imóveis Recomendados'}
            </h1>
            <p className="text-white/80 text-lg font-medium drop-shadow">
              Selecionamos os melhores imóveis para você
            </p>
          </div>

          {/* Estados de carregamento, erro e conteúdo */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-2xl p-8 shadow-xl">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-white text-center font-medium">Carregando recomendações...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-16">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-2xl p-8 shadow-xl text-center max-w-md">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Erro ao carregar</h3>
                <p className="text-white/70">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && properties.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-2xl p-8 shadow-xl text-center max-w-md">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Nenhuma recomendação no momento</h3>
                <p className="text-white/70 mb-4">Volte mais tarde para ver novas opções</p>
                <Link 
                  href="/imoveis"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Ver Todos os Imóveis
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div>
              {/* Contador de resultados */}
              <div className="mb-6">
                <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-xl p-4 shadow-lg inline-block">
                  <p className="text-white font-medium">
                    <span className="font-bold text-cyan-300">{properties.length}</span> 
                    {properties.length === 1 ? ' imóvel recomendado' : ' imóveis recomendados'}
                  </p>
                </div>
              </div>

              {/* Grid de imóveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
