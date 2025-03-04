'use client'
import { ResponseAPI } from '@/interfaces/common.interface'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { motion } from 'framer-motion'
import { Product } from '@/interfaces/product.interface'
import { useState } from 'react'
import { Image } from '@/interfaces/image.interface'

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

interface TemporalList extends Product {
    image?: Image
}

export default function TableProducts({ resultImages, meta, products }: Props) {
    console.log(resultImages.length)
    const [temporalList, setTemporalList] = useState<TemporalList[]>(
        products.map((product) => ({ ...product, image: undefined }))
    )
    const handleImageClick = (index: number, selectedImage: Image) => {
        console.log({ index, selectedImage })
        setTemporalList((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, image: item.image?.imageUrl === selectedImage.imageUrl ? undefined : selectedImage }
                    : item
            )
        )
    }
    return (
        <Table className="overflow-hidden">
            <TableCaption>{`Resultados: ${meta.pageSize} de ${meta.total} (Página ${meta.page}/${meta.pages})`}</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-48">Producto sin imagen</TableHead>
                    <TableHead>
                        Imagenes disponibles para cargar <i>(selecciona haciendo click)</i>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {temporalList.map((p, i) => {
                    return (
                        <TableRow key={p.id}>
                            <TableCell className={p.image ? 'text-green-600 font-bold' : 'text-red-600 font-medium'}>
                                <p>{p.name}</p>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-row flex-wrap gap-2">
                                    {resultImages[i].images.map((image) => (
                                        <motion.div
                                            key={image.imageUrl}
                                            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                                            whileHover={{
                                                scale: 2.5,
                                                zIndex: 10,
                                                border: '2px solid #bae6fd',
                                                backgroundColor: 'white',
                                            }}
                                            className="relative w-[100px] h-[100px] overflow-hidden rounded-lg hover:cursor-pointer"
                                            onClick={() => handleImageClick(i, image)}
                                        >
                                            <span className="text-xs scale-75 font-bold absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/70 rounded-s-lg">
                                                {image.imageWidth}x{image.imageHeight}
                                            </span>
                                            <motion.img
                                                src={image.imageUrl}
                                                height="100"
                                                width="100"
                                                className={`transition duration-200 bg-white max-w-[100px] max-h-[100px] object-cover ${
                                                    p.image && p.image.imageUrl === image.imageUrl
                                                        ? 'border-4 border-green-600'
                                                        : ''
                                                }`}
                                                alt="thumbnail"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
