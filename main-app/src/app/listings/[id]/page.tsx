// Image removed (unused in this server component)
import { apiClient, Imovel } from '@/lib/api'
import ListingCTAWrapper from '@/components/ListingCTAWrapper'
import GalleryClient from '@/components/GalleryClient'

// Use a permissive props type to satisfy Next's generated PageProps checks
// (the app router sometimes wraps params in Promise types during type generation).
export default async function ListingDetail({ params }: { params?: Promise<{ id?: string }> }) {
  // Next's app router may provide params as a Promise-wrapped object in generated types.
  // Awaiting works for both Promise and non-Promise values at runtime.
  const resolvedParams = params ? await params : undefined
  const id = resolvedParams?.id
  // fetch all imoveis and find matching id (backend doesn't expose single-get)
  let imovel: Imovel | null = null
  try {
    const arr = await apiClient.listImoveis()
    imovel = arr.find((it) => String(it.id ?? it._id) === String(id)) || null
  } catch {
    imovel = null
  }

  if (!imovel) {
    return <div className="p-8">Imóvel não encontrado</div>
  }

  const images = [imovel.image, ...(imovel.images || [])].filter(Boolean) as string[]

  return (
    <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2">
        <div>
          <GalleryClient images={images.length ? images : ['/img-2.jpg']} priorityFirst />
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold">{imovel.tipo ?? imovel.title ?? imovel.name}</h1>
          <div className="text-sm text-gray-600 mt-2">{imovel.localidade ?? (typeof imovel.location === 'string' ? imovel.location : '')}</div>

          <div className="mt-6 prose max-w-none text-gray-800">
            <p>Descrição do imóvel: esta é uma descrição exemplo. Substitua pelo texto vindo do backend.</p>
          </div>
        </div>
      </section>

      <aside className="lg:col-span-1">
        <div className="p-4 rounded-lg shadow card-surface">
          <div className="text-sm text-gray-600">Preço</div>
          <div className="text-2xl font-bold mt-2">R$ {Number(imovel.preco ?? imovel.price ?? 0).toLocaleString('pt-BR')}</div>
          <div className="mt-4">
            <ListingCTAWrapper />
          </div>
          <div className="mt-4 text-sm text-gray-500">Ou agendar visita com o corretor</div>
        </div>
      </aside>
    </main>
  )
}
