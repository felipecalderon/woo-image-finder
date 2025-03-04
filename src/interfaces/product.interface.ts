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
    permalink: string
    date_created: string
    date_created_gmt: string
    date_modified: string
    date_modified_gmt: string
    type: string
    status: 'draft' | 'pending' | 'private' | 'publish'
    featured: false
    catalog_visibility: string
    description: string
    short_description: string
    sku: string
    price: string
    regular_price: string
    sale_price: string
    date_on_sale_from: null
    date_on_sale_from_gmt: null
    date_on_sale_to: null
    date_on_sale_to_gmt: null
    on_sale: false
    purchasable: true
    total_sales: number
    virtual: false
    downloadable: false
    manage_stock: true
    stock_quantity: 2
    low_stock_amount: 2
    sold_individually: false
    weight: string
    dimensions: { length: string; width: string; height: string }
    shipping_required: true
    shipping_taxable: false
    shipping_class: string
    shipping_class_id: number
    reviews_allowed: false
    average_rating: string
    rating_count: number
    parent_id: number
    purchase_note: string
    categories: CategoryProduct[]
    images: ImageProduct[]
    menu_order: number
    related_ids: number[]
    stock_status: 'instock' | 'outofstock' | 'onbackorder'
}
