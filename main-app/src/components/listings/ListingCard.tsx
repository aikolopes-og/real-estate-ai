"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { designTokens } from '@/config/design'

type Props = {
  id?: string | number
  imageUrl: string
  title: string
  location: string
  price: number | string
  rating?: number
}

export default function ListingCard({ id, imageUrl, title, location, price, rating }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  
  // Convert relative URL to full backend URL
  const getImageUrl = (url: string) => {
    if (!url) return '/img-2.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8001${url}`;
    }
    return url;
  };
  
  const img = getImageUrl(imageUrl);
  
  const handleClick = () => {
    if (id !== undefined && id !== null) {
      if (user) {
        router.push(`/listings/${id}`)
      } else {
        // Store the intended destination and redirect to login
        router.push(`/auth/login?returnTo=${encodeURIComponent(`/listings/${id}`)}`)
      }
    }
  }

  return (
    <article 
      className="cursor-pointer group listing-card"
      onClick={handleClick}
    >
      <div className="relative">
        <div 
          className="relative w-full aspect-square glass-card overflow-hidden"
        >
          <Image 
            src={img} 
            alt={title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-200" 
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
          />
          
          {/* Favorite heart */}
          <button 
            className="absolute top-3 right-3 w-7 h-7 rounded-full glass-button flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              // Handle favorite logic here
            }}
            aria-label="Adicionar aos favoritos"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <div className="glass-overlay mt-3 p-3 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{location}</h3>
              <p className="text-sm text-white/70 truncate">{title}</p>
            </div>
            {typeof rating === 'number' && (
              <div className="flex items-center ml-2 flex-shrink-0">
                <svg className="w-3 h-3 fill-current text-yellow-300 mr-1" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.5 11.18 1 7.09l6.061-.88L10 1l2.939 5.21L19 7.09l-4.5 4.09 1.378 6.91z"/>
                </svg>
                <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-1">
            <span className="text-sm font-semibold text-white">
              {Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-sm text-white/70"> total</span>
          </div>
        </div>
      </div>
    </article>
  )
}
