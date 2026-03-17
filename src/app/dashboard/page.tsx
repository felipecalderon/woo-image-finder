import { getCachedImages } from '@/actions/get-images'
import { getProducts } from '@/actions/products'
import TableProducts from '@/components/table-products'
import { cleanText } from '@/lib/clean-text'

type Params = {
    searchParams: Promise<{ page: string; pageSize: string; search: string }>
}

export default async function Home({ searchParams }: Params) {
    const { page = '1', pageSize = '20', search = '' } = await searchParams
    const { data: products, meta } = await getProducts(page, pageSize, search)

    const titles = products.map((product) => ({
        q: cleanText(product.name),
        location: 'Chile',
        hl: 'es-419',
        num: 5,
    }))

    // versión cacheada de getImages
    const resultSearchs = await getCachedImages(titles)
    const [res] = resultSearchs
    if (res && res.error) {
        return (
            <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
                <h1 className="text-center text-3xl font-bold pb-1 pt-3">
                    Error: Mensaje de la API de Google: {res.error.message}
                </h1>
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Productos sin imagen</h1>
            <h3 className="text-center text-xl italic pb-3">Conectado a la API externa</h3>
            <div className="px-6 mx-auto">
                <TableProducts
                    key={Date.now()}
                    resultImages={resultSearchs}
                    products={products}
                    search={search}
                    meta={meta}
                />
            </div>
        </div>
    )
}
