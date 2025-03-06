'use client'
import { ResponseAPI } from '@/interfaces/common.interface'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Product } from '@/interfaces/product.interface'
import React, { useMemo, useState } from 'react'
import { ImageThumbnail } from './ui/thumbnail'
import { useImageSelection } from '@/hooks/img-selection'
import { Image } from '@/interfaces/image.interface'
import { LoaderCircle } from 'lucide-react'

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
                const esGeo = resultImages[index].images[0].imageUrl.includes('geoconstructor')
                if (product.image) continue
                const tempImage: Image = {
                    domain: '',
                    imageUrl: esGeo ? resultImages[index].images[1].imageUrl : resultImages[index].images[0].imageUrl,
                    imageWidth: 0,
                    imageHeight: 0,
                    link: '',
                    position: 0,
                    thumbnailHeight: 0,
                    thumbnailUrl: '',
                    thumbnailWidth: 0,
                    title: '',
                    googleUrl: '',
                    source: '',
                }
                await handleImageClick(index, tempImage)
            }
        } catch (error) {
            console.log('falló al automatizar..')
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
                                {p.image?.imageUrl && '✅'} {p.sku} - {p.name}:
                            </p>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                            {resultImages[i].images.map((image) => {
                                const isSelected = p.image?.thumbnailUrl === image.thumbnailUrl
                                console.log(isSelected)
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
                className={`flex justify-center items-center gap-2 fixed bottom-4 right-4 bg-green-700 text-white font-bold py-2 px-4 rounded-md ${
                    loadingAutomate ? 'opacity-70' : ''
                }`}
                onClick={automatizar}
                disabled={loadingAutomate}
            >
                {loadingAutomate && (
                    <span className="text-sm font-semibold animate-spin">
                        <LoaderCircle />
                    </span>
                )}
                {loadingAutomate ? 'Automatizando...' : 'Automatizar selección'}
            </button>
            {productsAdded.length > 0 && (
                <button
                    className={`flex justify-center items-center gap-2 fixed bottom-4 right-56 bg-red-600 text-white font-bold py-2 px-4 rounded-md ${
                        loading || loadingAutomate ? 'opacity-70' : ''
                    }`}
                    onClick={handleSubmit}
                    disabled={loading || loadingAutomate}
                >
                    {loading && (
                        <span className="text-sm font-semibold animate-spin">
                            <LoaderCircle />
                        </span>
                    )}
                    {loading
                        ? 'Actualizando...'
                        : `Actualizar ${productsAdded.length > 1 ? ` ${productsAdded.length} productos` : 'producto'}`}
                </button>
            )}
        </>
    )
}
