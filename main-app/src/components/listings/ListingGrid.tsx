import React from 'react'
import ListingCard from './ListingCard'

export type Listing = {
  id?: string | number
  imageUrl: string
  title: string
  location: string
  price: number | string
  rating?: number
}

type Props = { listings: Listing[] }

export default function ListingGrid({ listings }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
      {listings.map((l, i) => (
        <div key={l.id ?? i}>
          <ListingCard id={l.id} imageUrl={l.imageUrl} title={l.title} location={l.location} price={l.price} rating={l.rating} />
        </div>
      ))}
    </div>
  )
}
