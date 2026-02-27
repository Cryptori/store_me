'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProdukForm from '@/components/produk/ProductForm'
import type { Product } from '@/types/database'

export default function EditProdukPage() {
  // Fix: useParams() return string | string[] | undefined di Next.js 15
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!id) return
    async function fetchProduct() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id as string)
        .single()
      setProduct(data)
    }
    fetchProduct()
  }, [id])

  if (!product) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
    </div>
  )

  return <ProdukForm product={product} />
}