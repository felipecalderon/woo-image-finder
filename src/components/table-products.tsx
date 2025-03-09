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
        try {
            console.log('automatizando...')
            setLoadingAutomate(true)
            for (const product of temporalList) {
                const index = temporalList.findIndex((p) => p.id === product.id)
                if (!resultImages[index].images[0].imageUrl) continue
                const esGeo = resultImages[index].images[0].imageUrl.includes('geoconstructor')
                const imgs = resultImages[index].images
                if (imgs.length === 0) continue
                const [primeraImg, segundaImg] = imgs
                const selectedTempImage: Image = esGeo ? { ...segundaImg } : { ...primeraImg }
                if (product.image) continue
                if (esGeo && !segundaImg) continue
                if (!selectedTempImage.imageUrl) continue
                const tempImage: Image = {
                    ...selectedTempImage,
                    imageUrl: esGeo ? resultImages[index].images[1].imageUrl : resultImages[index].images[0].imageUrl,
                }
                try {
                    await handleImageClick(index, tempImage)
                } catch (error) {
                    console.log('No se pudo subir la imagen desde:', resultImages[index].images[0].imageUrl)
                }
            }
        } catch (error) {
            console.log('falló al automatizar..', error)
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
                    {`Resultados: ${meta.pageSize} de ${meta.total} (Página ${meta.page}/${meta.pages})`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead colSpan={2} className="text-center">
                            Selecciona la imagen que mejor se adapte al producto <i>(puedes automatizar el proceso)</i>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{tableRows}</TableBody>
            </Table>
            <button
                className={`flex justify-center items-center gap-2 fixed top-4 right-4 bg-green-700 text-sm text-white font-bold py-2 px-2 rounded-md ${
                    loadingAutomate ? 'opacity-70' : ''
                }`}
                onClick={automatizar}
                disabled={loadingAutomate}
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
            {productsAdded.length > 0 && (
                <button
                    className={`flex justify-center items-center gap-2 fixed bottom-4 right-4 bg-sky-700 text-sm text-white font-bold py-2 px-2 rounded-md ${
                        loading || loadingAutomate ? 'opacity-70' : ''
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
