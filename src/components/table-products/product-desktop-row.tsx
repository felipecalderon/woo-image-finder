import { ImageGallery } from '@/components/table-products/image-gallery'
import { SelectedImagePreview } from '@/components/table-products/selected-image-preview'
import { Button } from '@/components/ui/button'
import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { CheckCircle2, Image as ImageIcon, LoaderCircle } from 'lucide-react'
import { TableCell, TableRow } from '../ui/table'

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

export function ProductDesktopRow({
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
    return (
        <TableRow className="group hidden border-b border-slate-200/70 bg-white/70 transition-all hover:bg-slate-50/70 md:table-row">
            <TableCell className="align-top border-r p-4 pt-6 w-[350px] min-w-[350px]">
                <div className="rounded-[1.5rem] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-emerald-50/35 p-4 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
                    <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <div className="relative shrink-0 group/img">
                            <span className="absolute -left-2 top-[-0.5rem] z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-white/60">
                                {product.category?.name ?? 'Sin categoría'}
                            </span>
                            {currentImageUrl ? (
                                <img
                                    src={currentImageUrl}
                                    className="h-32 w-32 rounded-[1.15rem] border border-white bg-white object-cover shadow-md shadow-slate-900/10 ring-1 ring-slate-100"
                                    alt={product.name}
                                />
                            ) : (
                                <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-[1.15rem] border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                                    <ImageIcon size={20} />
                                    <span>Sin imagen</span>
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="mb-1 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5">
                                {product.code}
                            </div>
                            <h3 className="line-clamp-3 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-slate-900" title={product.name}>
                                {product.name}
                            </h3>
                        </div>
                    </div>

                    {product.selectedImage ? (
                        <div className="animate-in fade-in slide-in-from-top-1 relative mt-1 overflow-hidden rounded-[1.25rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-3 shadow-sm shadow-emerald-900/5">
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
                            <div className="flex items-center justify-center gap-2 rounded-[1.25rem] border border-blue-200 bg-blue-50/80 p-3">
                                <LoaderCircle className="animate-spin text-blue-700" size={16} />
                                <span className="text-xs font-medium text-blue-700">Subiendo imagen...</span>
                            </div>
                        )
                    )}
                    </div>
                </div>
            </TableCell>

            <TableCell className="align-top p-4">
                <div className="flex h-full flex-col gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-4 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Imágenes del producto
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onFetchImages(index)}
                            disabled={isSearching || loadingAutomate || loading}
                            className="h-10 shrink-0 rounded-2xl border-slate-200 bg-white/90 shadow-sm shadow-slate-900/5 transition hover:bg-slate-50"
                        >
                            {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            <span>{images.length > 0 ? 'Recargar' : 'Traer imágenes'}</span>
                        </Button>
                    </div>

                    {images.length > 0 ? (
                        <div className="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/70 p-3 shadow-inner shadow-white/80">
                            <ImageGallery
                                images={images}
                                selectedThumbnailUrl={product.selectedImage?.thumbnailUrl}
                                onSelect={(image) => onSelectImage(index, image)}
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-[120px] items-center justify-center rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                            {isSearching ? 'Buscando imágenes...' : 'Presiona el botón para cargar solo las imágenes de este producto.'}
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}
