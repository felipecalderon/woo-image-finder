import { getCategories } from '@/actions/categories'
import { getProducts } from '@/actions/products'
import TableProducts from '@/components/table-products'

type Params = {
    searchParams: Promise<{
        page: string
        pageSize: string
        search: string
        category_id: string
    }>
}

export default async function Home({ searchParams }: Params) {
    const { page = '1', pageSize = '20', search = '', category_id = '' } = await searchParams
    const [productsResult, categoriesResult] = await Promise.all([
        getProducts(page, pageSize, search, category_id),
        getCategories('1'),
    ])

    const { data: products, meta } = productsResult
    const { data: categoriesRaw = [], meta: categoriesMeta } = categoriesResult
    const categories = [...categoriesRaw].sort((a, b) => a.name.localeCompare(b.name, 'es'))
    const categoriesLoading = categoriesRaw.length === 0

    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Productos sin imagen</h1>
            <h3 className="text-center text-xl italic pb-3">Carga manual con caché por producto</h3>
            <div className="px-6 mx-auto">
                <TableProducts
                    key={`${meta.page}-${search}-${category_id}`}
                    products={products}
                    search={search}
                    categoryId={category_id}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    categoriesMeta={categoriesMeta}
                    meta={meta}
                />
            </div>
        </div>
    )
}
