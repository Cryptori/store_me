'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProdukForm from '@/components/produk/ProductForm'
import type { Product } from '@/types/database'

export default function EditProdukPage() {
    const { id } = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase.from('products').select('*').eq('id', id).single()
            setProduct(data)
        }
        fetch()
    }, [id])

    if (!product) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
        </div>
    )

    return <ProdukForm product={product} />
}