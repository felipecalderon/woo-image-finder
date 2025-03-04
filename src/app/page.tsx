import { getImages } from '@/actions/get-images'
import { getProducts, updateProducts, uploadImage } from '@/actions/wocoomerce'
import { ModalImage } from '@/components/modal-image'
import TableProducts from '@/components/table-products'
import { tempResults } from '@/constants/temp-results'
import Link from 'next/link'

type Params = {
    searchParams: Promise<{ page: string; pageSize: string }>
}

export default async function Home({ searchParams }: Params) {
    const { page = '1', pageSize = '50' } = await searchParams
    const { data: products, meta } = await getProducts(page, pageSize)
    // const titles = products.map((product) => ({ q: product.name, location: 'Chile', hl: 'es-419', num: 5 }))
    // siempre se dará que resultSearchs.length === products.length
    // const resultSearchs = await getImages(titles)
    // console.log({ resultSearchs })
    // console.log(products[0])
    // await updateProducts()
    // const img = await uploadImage(
    //     'https://www.ferreteriasanfrancisco.cl/tienda/wp-content/uploads/2024/08/07605-1-600x594.jpg',
    //     '6327'
    // )
    // console.log(img)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Productos sin imagen en la GEO</h1>
            <h3 className="text-center text-xl italic pb-3">Seleccionar las imagenes que mejor se adapten</h3>
            <div className="px-6 mx-auto">
                <TableProducts resultImages={tempResults} products={products.slice(0, 38)} meta={meta} />
                <div className="flex justify-center gap-2 py-4">
                    <Link href={`/?page=${meta.page - 1}`}>
                        <button>Anterior</button>
                    </Link>
                    <Link href={`/?page=${meta.page + 1}`}>
                        <button>Siguiente</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
