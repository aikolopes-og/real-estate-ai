"use client"
import React from 'react'
import Gallery from '@/components/Gallery'

type Props = { images: string[], priorityFirst?: boolean }

export default function GalleryClient({ images, priorityFirst }: Props){
  return <Gallery images={images} priorityFirst={priorityFirst} />
}
