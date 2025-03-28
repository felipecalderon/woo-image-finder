'use client'
import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Image } from '@/interfaces/image.interface'
import { InteractiveHoverButton } from './interactive-hover-button'

type Card = {
    id: number
    content: Image
    className: string
    thumbnail: string
}

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
    const [selected, setSelected] = useState<Card | null>(null)
    const [lastSelected, setLastSelected] = useState<Card | null>(null)

    const handleClick = (card: Card) => {
        setLastSelected(selected)
        setSelected(card)
    }

    const handleOutsideClick = () => {
        setLastSelected(selected)
        setSelected(null)
    }

    return (
        <div className="w-full h-full p-10 grid grid-cols-3 md:grid-cols-5 max-w-7xl mx-auto gap-4 relative hover:cursor-pointer">
            {cards.map((card, i) => (
                <div key={i} className={cn(card.className, '')}>
                    <motion.div
                        onClick={() => handleClick(card)}
                        className={cn(
                            card.className,
                            'relative overflow-hidden border-2 border-slate-400',
                            selected?.id === card.id
                                ? 'rounded-lg cursor-pointer absolute inset-0 h-[98%] w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col'
                                : lastSelected?.id === card.id
                                ? 'z-40 bg-white rounded-xl h-full w-full'
                                : 'bg-white rounded-xl h-full w-full'
                        )}
                        layoutId={`card-${card.id}`}
                    >
                        {selected?.id === card.id && <SelectedCard selected={selected} />}
                        <ImageComponent card={card} />
                    </motion.div>
                </div>
            ))}
            <motion.div
                onClick={handleOutsideClick}
                className={cn(
                    'absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10',
                    selected?.id ? 'pointer-events-auto' : 'pointer-events-none'
                )}
                animate={{ opacity: selected?.id ? 0.3 : 0 }}
            />
        </div>
    )
}

const ImageComponent = ({ card }: { card: Card }) => {
    return (
        <motion.img
            layoutId={`image-${card.id}-image`}
            src={card.thumbnail}
            height="500"
            width="500"
            className={cn('object-contain object-top absolute inset-0 h-full w-full transition duration-200 bg-white')}
            alt="thumbnail"
        />
    )
}

const SelectedCard = ({ selected }: { selected: Card | null }) => {
    const handleConfirm = async (image: Image) => {
        console.log({ image })
    }
    return (
        <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
            <motion.div
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 0.6,
                }}
                className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
            />
            <motion.div
                layoutId={`content-${selected?.id}`}
                initial={{
                    opacity: 0,
                    y: 100,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                exit={{
                    opacity: 0,
                    y: 100,
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
                className="relative px-8 pb-4 z-[70]"
            >
                {selected?.content && (
                    <div>
                        <p className="font-bold text-xl md:text-2xl text-white pb-3">{selected?.content.title}</p>
                        <div className="flex flex-row gap-2 justify-between">
                            <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
                                Origen: {selected?.content.source}
                            </p>
                            <InteractiveHoverButton onClick={() => handleConfirm(selected?.content)}>
                                Confirmar imagen
                            </InteractiveHoverButton>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
