import { ImageGallery } from '@/components/table-products/image-gallery'
import { SelectedImagePreview } from '@/components/table-products/selected-image-preview'
import { Button } from '@/components/ui/button'
import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { CheckCircle2, Image as ImageIcon, LoaderCircle } from 'lucide-react'

type Props = {
    index: number
    product: Product & { selectedImage?: Image; loading?: boolean }
    currentImageUrl: string
    images: Image[]
    isSearching: boolean
    loadingAutomate: boolean
    loading: boolean
    onFetchImages: (index: number) => void
    onSelectImage: (index: number, image: Image) => void
}

export function ProductMobileCard({
    index,
    product,
    currentImageUrl,
    images,
    isSearching,
    loadingAutomate,
    loading,
    onFetchImages,
    onSelectImage,
}: Props) {
    const imageCountLabel = images.length === 1 ? '1 opción' : `${images.length} opciones`

    return (
        <article className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-[0_12px_35px_-20px_rgba(15,23,42,0.55)] ring-1 ring-black/5 md:hidden">
            <div className="bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                        <span className="absolute -left-2 top-[-0.5rem] z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-white/60">
                            {product.category?.name ?? 'Sin categoría'}
                        </span>
                        {currentImageUrl ? (
                            <img
                                src={currentImageUrl}
                                className="h-24 w-24 rounded-[1.15rem] border border-white bg-white object-cover shadow-md shadow-slate-900/10 ring-1 ring-slate-100"
                                alt={product.name}
                            />
                        ) : (
                            <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-[1.15rem] border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                                <ImageIcon size={18} />
                                <span>Sin imagen</span>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5">
                                {product.code}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-950 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                                {product.selectedImage ? 'Seleccionada' : 'Pendiente'}
                            </span>
                        </div>
                        <h3 className="line-clamp-3 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-slate-900" title={product.name}>
                            {product.name}
                        </h3>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2 text-[11px] text-slate-500 shadow-sm backdrop-blur">
                    <span>{imageCountLabel}</span>
                    <span>{product.selectedImage ? 'Lista para subir' : 'Requiere selección'}</span>
                </div>
            </div>

            <div className="border-t border-slate-100/80 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Imágenes del producto</span>
                    <span className="text-slate-400">Galería</span>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onFetchImages(index)}
                    disabled={isSearching || loadingAutomate || loading}
                    className="h-11 w-full justify-center rounded-2xl border-slate-200 bg-white/90 shadow-sm shadow-slate-900/5 transition hover:bg-slate-50"
                >
                    {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    <span>{images.length > 0 ? 'Recargar imágenes' : 'Traer imágenes'}</span>
                </Button>

                {product.selectedImage ? (
                    <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-3 shadow-sm shadow-emerald-900/5">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-full bg-emerald-500 p-0.5 text-white shadow-sm">
                                <CheckCircle2 size={12} />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                                Nueva seleccionada
                            </span>
                        </div>
                        <SelectedImagePreview
                            imageUrl={product.selectedImage.imageUrl}
                            alt={product.name}
                            loading={product.loading}
                            onClick={() => window.open(product.selectedImage?.imageUrl, '_blank')}
                        />
                    </div>
                ) : (
                    product.loading && (
                        <div className="mt-4 flex items-center justify-center gap-2 rounded-[1.25rem] border border-blue-200 bg-blue-50/80 p-3">
                            <LoaderCircle className="animate-spin text-blue-700" size={16} />
                            <span className="text-xs font-medium text-blue-700">Subiendo imagen...</span>
                        </div>
                    )
                )}

                <div className="mt-4 rounded-[1.25rem] border border-slate-200/70 bg-slate-50/70 p-3 shadow-inner shadow-white/80">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Opciones encontradas</span>
                        <span className="text-[11px] text-slate-400">{imageCountLabel}</span>
                    </div>
                    {images.length > 0 ? (
                        <ImageGallery
                            images={images}
                            selectedThumbnailUrl={product.selectedImage?.thumbnailUrl}
                            onSelect={(image) => onSelectImage(index, image)}
                            variant="scroll"
                        />
                    ) : (
                        <div className="flex min-h-[96px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                            {isSearching ? 'Buscando imágenes...' : 'Carga imágenes para este producto.'}
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}
