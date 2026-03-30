import { getProducts } from '@/actions/products'
import TableProducts from '@/components/table-products'

type Params = {
    searchParams: Promise<{ page: string; pageSize: string; search: string }>
}

export default async function Home({ searchParams }: Params) {
    const { page = '1', pageSize = '20', search = '' } = await searchParams
    const { data: products, meta } = await getProducts(page, pageSize, search)
    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Productos sin imagen</h1>
            <h3 className="text-center text-xl italic pb-3">Carga manual con caché por producto</h3>
            <div className="px-6 mx-auto">
                <TableProducts key={`${meta.page}-${search}`} products={products} search={search} meta={meta} />
            </div>
        </div>
    )
}
