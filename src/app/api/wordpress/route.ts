import { updateProducts } from '@/actions/wocoomerce'
import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { NextRequest, NextResponse } from 'next/server'

interface TemporalList extends Product {
    image: Image
}

export const POST = async (req: NextRequest) => {
    const temProducts: TemporalList[] = await req.json()
    const toUpdate = temProducts.map((p) => ({ id: p.id, images: [{ src: p.image.imageUrl }] }))
    const updated = await updateProducts(toUpdate)
    console.log(updated)
    return NextResponse.json(updated)
}
