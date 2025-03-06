'use client'
import { ResponseAPI } from '@/interfaces/common.interface'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Product } from '@/interfaces/product.interface'
import React, { useMemo } from 'react'
import { ImageThumbnail } from './ui/thumbnail'
import { useImageSelection } from '@/hooks/img-selection'

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
    const { temporalList, handleImageClick } = useImageSelection(products)
    const tableRows = useMemo(
        () =>
            temporalList.map((p, i) => (
                <TableRow key={p.id} className="relative">
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
                                {p.name} {p.image?.imageUrl && '✅'}:
                            </p>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                            {resultImages[i].images.map((image) => (
                                <ImageThumbnail
                                    key={image.imageUrl}
                                    image={image}
                                    isSelected={p.image?.imageUrl === image.imageUrl}
                                    onClick={() => handleImageClick(i, image)}
                                />
                            ))}
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
                        <TableHead colSpan={2}>
                            Imagenes disponibles para cargar <i>(selecciona haciendo click)</i>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{tableRows}</TableBody>
            </Table>
            <button className="fixed bottom-4 right-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                {temporalList.filter((p) => p.image).length} imgs seleccionadas
            </button>
        </>
    )
}
