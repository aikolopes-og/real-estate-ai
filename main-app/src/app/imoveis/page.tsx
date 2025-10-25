"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

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

function PropertyCard({ property }: { property: Property }) {
  // Convert relative URL to full backend URL
  const getImageUrl = (url: string) => {
    if (!url) return '/img-2.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8001${url}`;
    }
    return url;
  };
  
  const imageUrl = property.images && property.images.length > 0 
    ? getImageUrl(property.images[0]) 
    : '/img-2.jpg';
  
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
        <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full">
          <span className="text-white text-xs font-bold">{property.type || 'Imóvel'}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
          {property.title}
        </h3>
        
        <p className="text-white/80 text-sm font-medium drop-shadow">
          📍 {property.city}
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
                🛏️ {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                🚿 {property.bathrooms}
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1">
                📐 {property.area}m²
              </span>
            )}
          </div>
        )}
        
        <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}

export default function ImoveisPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'Casa' | 'Apartamento' | 'Todos'>('Todos');

  // Get filter parameters from URL
  const filterType = searchParams.get('type') || '';
  const filterPriceMax = Number(searchParams.get('priceMax') || '0') || 0;

  // Filtrar propriedades por tipo selecionado localmente
  const displayedProperties = useMemo(() => {
    if (selectedType === 'Todos') return properties;
    
    return properties.filter(prop => {
      const propType = prop.type?.toLowerCase() || '';
      const selectedTypeLower = selectedType.toLowerCase();
      
      if (selectedTypeLower === 'casa') {
        return propType.includes('house') || propType.includes('casa');
      } else if (selectedTypeLower === 'apartamento') {
        return propType.includes('apartment') || propType.includes('apartamento');
      }
      return true;
    });
  }, [properties, selectedType]);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Carregando imóveis da API...');
        console.log('Filtros da URL:', { filterType, filterPriceMax });
        
        // Construir query params para a busca
        const params = new URLSearchParams();
        
        if (filterType) {
          params.append('type', filterType);
        }
        
        if (filterPriceMax > 0) {
          params.append('priceMax', filterPriceMax.toString());
        }
        
        const queryString = params.toString();
        const url = `/api/imoveis${queryString ? `?${queryString}` : ''}`;
        
        console.log('Chamando API:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data);

        if (data.success && data.data) {
          // Novo formato: data.data contém properties, pagination, filters, executionTime
          const apiProperties = data.data.properties || [];

          console.log(`API retornou ${apiProperties.length} imóveis em ${data.data.executionTime}ms`);
          console.log('Filtros aplicados:', data.data.filters);
          console.log('Paginação:', data.data.pagination);

          // Transformar dados da API para o formato Property
          const transformedProperties: Property[] = apiProperties.map((prop: any) => ({
            id: prop.id,
            title: prop.title || 'Imóvel sem título',
            city: prop.city || prop.address || 'Localização não informada',
            price: prop.price || 0,
            images: prop.images || [],
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            type: prop.propertyType || 'Imóvel'
          }));

          console.log('Imóveis transformados:', transformedProperties.length);
          setProperties(transformedProperties);
        } else {
          console.error('Estrutura de resposta inválida:', data);
          setError('Formato de resposta inválido da API');
        }

      } catch (err) {
        console.error('Erro ao carregar imóveis:', err);
        setError('Falha ao carregar imóveis');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [filterType, filterPriceMax]); // Dependências corretas

  return (
    <div className="professional-bg min-h-screen">
      <Header />
      
      {/* Espaçamento para o header fixo */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Título da página */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-4">
              Imóveis Disponíveis
            </h1>
            <p className="text-white/80 text-lg font-medium drop-shadow">
              Encontre o imóvel perfeito para você
            </p>
          </div>

          {/* Filtros de tipo (Casa/Apartamento) */}
          {!loading && !error && properties.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="bg-white/12 backdrop-blur-3xl border border-white/30 rounded-full p-2 shadow-xl inline-flex gap-2">
                {(['Todos', 'Casa', 'Apartamento'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setSelectedType(tipo)}
                    className={`px-6 py-2.5 rounded-full transition-all duration-300 font-medium ${
                      selectedType === tipo
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tipo === 'Todos' ? '🏘️ Todos' : tipo === 'Casa' ? '🏠 Casas' : '🏢 Apartamentos'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estados de carregamento, erro e conteúdo */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-2xl p-8 shadow-xl">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-white text-center font-medium">Carregando imóveis...</p>
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
                <h3 className="text-lg font-bold text-white mb-2">Nenhum imóvel encontrado</h3>
                <p className="text-white/70">Volte mais tarde para ver novas opções</p>
              </div>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div>
              {/* Contador de resultados */}
              <div className="mb-6">
                <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-xl p-4 shadow-lg inline-block">
                  <p className="text-white font-medium">
                    <span className="font-bold text-cyan-300">{displayedProperties.length}</span> 
                    {displayedProperties.length === 1 ? ' imóvel encontrado' : ' imóveis encontrados'}
                    {selectedType !== 'Todos' && (
                      <span className="text-white/70"> • Filtrando por {selectedType}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Grid de imóveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}