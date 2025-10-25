"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLoading } from '@/context/LoadingContext'

export default function ListingCTA(){
  const { user } = useAuth()
  const { show, hide } = useLoading()
  const router = useRouter()

  async function handleClick(){
    show()
    // small delay to show animation
    await new Promise((r)=> setTimeout(r, 300))
    if (user) {
      // user logged in -> go to recommendations
      router.push('/recommendations')
    } else {
      // not logged in -> go to login (prefill handled elsewhere)
      router.push('/auth/login')
    }
    hide()
  }

  return (
    <button onClick={handleClick} className="w-full py-3 rounded-lg bg-gradient-to-r from-cta-start to-cta-end text-white">Contact seller</button>
  )
}
