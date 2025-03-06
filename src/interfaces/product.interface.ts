export interface CategoryProduct {
    id: number
    name: string
    slug: string
}

export interface ImageProduct {
    id: number
    date_created: string
    date_created_gmt: string
    date_modified: string
    date_modified_gmt: string
    src: string
    name: string
    alt: string
}
export interface Product {
    id: number
    name: string
    slug: string
    date_created: string
    date_modified: string
    status: 'draft' | 'pending' | 'private' | 'publish'
    featured: boolean
    catalog_visibility: string
    description: string
    short_description: string
    sku: string
    price: string
    regular_price: string
    sale_price: string
    date_on_sale_from: null
    date_on_sale_to: null
    total_sales: number
    downloadable: false
    manage_stock: true
    stock_quantity: number
    low_stock_amount: number
    sold_individually: false
    weight: string
    shipping_class_id: number
    reviews_allowed: boolean
    average_rating: string
    parent_id: number
    purchase_note: string
    images?: ImageProduct[]
    menu_order: number
    stock_status: 'instock' | 'outofstock' | 'onbackorder'
}
