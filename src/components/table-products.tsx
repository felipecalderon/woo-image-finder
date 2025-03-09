'use client'
import { ResponseAPI } from '@/interfaces/common.interface'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Product } from '@/interfaces/product.interface'
import React, { useMemo, useState } from 'react'
import { ImageThumbnail } from '@/components/thumbnail'
import { useImageSelection } from '@/hooks/img-selection'
import { Image } from '@/interfaces/image.interface'
import { Bot, LoaderCircle, UploadCloud } from 'lucide-react'
import Link from 'next/link'

type Props = {
    resultImages: ResponseAPI[]
    products: Product[]
    meta: {
        page: number
        pageSize: number
        total: number
        pages: number
    }
}
const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || ''
export default function TableProducts({ resultImages, meta, products }: Props) {
    const { temporalList, handleImageClick, handleSubmit, loading, setLoading, productsAdded } =
        useImageSelection(products)
    const [loadingAutomate, setLoadingAutomate] = useState(false)

    const automatizar = async () => {
        console.log('automatizando...')
        setLoadingAutomate(true)

        try {
            for (let index = 0; index < temporalList.length; index++) {
                try {
                    const product = temporalList[index]
                    const images = resultImages[index]?.images

                    // Validación en cascada con optional chaining
                    if (!images?.[0]?.imageUrl) continue

                    const [primeraImg, segundaImg] = images
                    const esGeo = primeraImg.imageUrl.includes('geoconstructor')

                    // Validar existencia de segunda imagen si es geo
                    if (esGeo && !segundaImg?.imageUrl) continue

                    // No procesar si ya tiene imagen
                    if (product.image) continue

                    // Seleccionar imagen adecuada
                    const targetImage = esGeo ? segundaImg : primeraImg
                    if (!targetImage?.imageUrl) continue

                    // Preparar objeto imagen
                    const tempImage: Image = {
                        ...targetImage,
                        imageUrl: targetImage.imageUrl,
                    }

                    await handleImageClick(index, tempImage)
                } catch (error) {
                    console.error(`Error en item ${index}:`, error)
                    continue
                }
            }
        } catch (error) {
            console.error('Error general inesperado:', error)
        } finally {
            setLoadingAutomate(false)
        }
    }

    const tableRows = useMemo(
        () =>
            temporalList.map((p, i) => (
                <TableRow key={p.id} className={'relative'}>
                    {/* Celda con overlay para indicar carga */}
                    <TableCell
                        colSpan={2}
                        className={`relative ${p.image ? 'bg-green-200 border-8 border-green-100 rounded-lg' : ''}`}
                    >
                        {p.loading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
                                <span className="text-sm font-semibold">Marcando...</span>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold pt-2 pb-1">
                                {p.image?.imageUrl && '✅'} {p.sku} - {p.name}{' '}
                                <Link href={`${wpUrl}/producto/${p.slug}`} target="_blank">
                                    <span className="text-green-800">(LINK)</span>
                                </Link>
                                :
                            </p>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                            {resultImages[i].images.map((image) => {
                                const isSelected = p.image?.thumbnailUrl === image.thumbnailUrl
                                return (
                                    <div
                                        key={image.imageUrl}
                                        className={isSelected ? 'border-8 box-border rounded-xl  border-green-800' : ''}
                                    >
                                        <ImageThumbnail image={image} onClick={() => handleImageClick(i, image)} />
                                    </div>
                                )
                            })}
                        </div>
                    </TableCell>
                </TableRow>
            )),
        [temporalList, resultImages, handleImageClick]
    )

    return (
        <>
            <Table className="overflow-hidden">
                <TableCaption>
                    {`Resultados: ${resultImages.length} de ${meta.total} (Página ${meta.page}/${meta.pages})`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead colSpan={2} className="text-center pointer-events-none">
                            {!resultImages.length
                                ? 'Todos los productos están con sus respectivas fotos, ¡Felicitaciones!'
                                : 'Selecciona la imagen que mejor se adapte al producto (puedes automatizar el proceso)'}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{tableRows}</TableBody>
            </Table>
            {/* Botón para actualizar automáticamente */}
            <button
                className={`flex justify-center items-center gap-2 fixed top-4 right-4 bg-green-700 text-sm text-white font-bold py-2 px-2 rounded-md ${
                    loadingAutomate || loading || !resultImages.length ? 'opacity-70 pointer-events-none' : ''
                }`}
                onClick={automatizar}
                disabled={loadingAutomate || loading}
            >
                {loadingAutomate ? (
                    <span className="text-sm font-semibold animate-spin">
                        <LoaderCircle />
                    </span>
                ) : (
                    <Bot />
                )}
                {loadingAutomate ? 'Automatizando...' : 'Automatizar selección'}
            </button>

            {/* Botón para subir las fotos */}
            {productsAdded.length > 0 && (
                <button
                    className={`flex justify-center items-center gap-2 fixed bottom-4 right-4 bg-sky-700 text-sm text-white font-bold py-2 px-2 rounded-md ${
                        loading || loadingAutomate ? 'opacity-70 pointer-events-none' : ''
                    }`}
                    onClick={handleSubmit}
                    disabled={loading || loadingAutomate}
                >
                    {loading ? (
                        <span className="text-sm font-semibold animate-spin">
                            <LoaderCircle />
                        </span>
                    ) : (
                        <UploadCloud />
                    )}
                    {loading
                        ? 'Actualizando...'
                        : `Subir ${productsAdded.length > 1 ? ` ${productsAdded.length} productos` : 'producto'}`}
                </button>
            )}
        </>
    )
}
