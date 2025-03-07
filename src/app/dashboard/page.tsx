import { getImages } from '@/actions/get-images'
import { getProducts } from '@/actions/wocoomerce'
import TableProducts from '@/components/table-products'
import { cleanText } from '@/lib/clean-text'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

type Params = {
    searchParams: Promise<{ page: string; pageSize: string }>
}

// Función cacheada con unstable_cache
const getCachedImages = unstable_cache(
    async (titles: Array<{ q: string; location: string; hl: string; num: number }>) => {
        return await getImages(titles)
    },
    // Clave de caché, que puede incluir identificadores estáticos
    ['getCachedImages']
)

export default async function Home({ searchParams }: Params) {
    const { page = '1', pageSize = '50' } = await searchParams
    const { data: products, meta } = await getProducts(page, pageSize)

    const titles = products.map((product) => ({
        q: cleanText(product.name),
        location: 'Chile',
        hl: 'es-419',
        num: 5,
    }))

    // versión cacheada de getImages
    const resultSearchs = await getCachedImages(titles)
    const [{ error }] = resultSearchs
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
                <h1 className="text-center text-3xl font-bold pb-1 pt-3">
                    Mensaje de la API de Google: {error.message}
                </h1>
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Productos sin imagen</h1>
            <h3 className="text-center text-xl italic pb-3">De la ferretería Geoconstructor</h3>
            <div className="px-6 mx-auto">
                <TableProducts key={Date.now()} resultImages={resultSearchs} products={products} meta={meta} />
                <div className="flex justify-center gap-4 py-6">
                    {/* Botón Anterior */}
                    <Link href={`/dashboard/?page=${meta.page - 1}`} passHref>
                        <button
                            className={`px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-md
                        ${meta.page > 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
                    `}
                            disabled={meta.page <= 1}
                        >
                            ⬅ Anterior
                        </button>
                    </Link>

                    {/* Botón Siguiente */}
                    <Link href={`/dashboard/?page=${meta.page + 1}`} passHref>
                        <button
                            className={`px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-md bg-blue-600 hover:bg-blue-700`}
                        >
                            Siguiente ➡
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
