import { updateProductImage } from '@/actions/products'
import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { NextRequest, NextResponse } from 'next/server'

interface TemporalList extends Product {
    selectedImage?: Image
}

const normalizeProductType = (productType?: string) => {
    if (!productType) return 1
    const normalized = productType.toLowerCase()

    if (normalized === 'service' || normalized === 'servicio' || normalized === '2') {
        return 2
    }

    return 1
}

const normalizeCurrency = (currency?: string) => {
    if (!currency) return 1
    const parsed = Number(currency)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export const POST = async (req: NextRequest) => {
    try {
        const temProducts: TemporalList[] = await req.json()
        const results = []

        for (const product of temProducts) {
            if (!product.selectedImage?.imageUrl) continue

            const categoryId = product.category?.id ?? product.category_id
            const price = product.price

            if (categoryId == null || price == null) {
                throw new Error(`El producto ${product.id} no tiene category_id o price para actualizar la imagen`)
            }

            const payload = {
                name: product.name,
                enabled: product.enabled ?? true,
                category_id: categoryId,
                product_type: normalizeProductType(product.product_type),
                is_tax: product.is_tax ?? true,
                currency: normalizeCurrency(product.currency),
                code: product.code,
                description: product.description,
                is_variant: product.is_variant,
                is_profit: product.is_profit,
                unit_cost: product.unit_cost,
                price,
                is_weight_barcode: product.is_weight_barcode,
                barcode: product.barcode,
                type_code: product.type_code,
                unit_item: product.unit_item,
                sii_tax_id: product.sii_tax_id,
                image: product.selectedImage.imageUrl,
            }
            const updated = await updateProductImage(product.id, payload)
            results.push({ id: product.id, updated })
        }

        return NextResponse.json({ ok: true, results })
    } catch (error) {
        console.error('Error updating products:', error)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
