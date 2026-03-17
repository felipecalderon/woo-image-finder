import { updateProductImage } from '@/actions/products'
import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { NextRequest, NextResponse } from 'next/server'

interface TemporalList extends Product {
    selectedImage?: Image
}

export const POST = async (req: NextRequest) => {
    try {
        const temProducts: TemporalList[] = await req.json()
        const results = []

        for (const product of temProducts) {
            if (!product.selectedImage?.imageUrl) continue

            const payload = {
                name: product.name,
                category_id: product.category?.id ?? null,
                product_type: product.product_type === 'product' ? 1 : 0,
                is_tax: product.is_tax ?? true,
                currency: 1, // 1: Peso chileno, 2: UF
                code: product.code,
                price: product.price,
                image: product.selectedImage.imageUrl,
            }
            console.log(payload)
            const updated = await updateProductImage(product.id, payload)
            results.push({ id: product.id, updated })
        }

        return NextResponse.json({ ok: true, results })
    } catch (error) {
        console.error('Error updating products:', error)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
