'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { InteractiveHoverButton } from './ui/interactive-hover-button'
import { Image } from '@/interfaces/image.interface'
// import { BentoGrid, BentoGridItem } from './ui/bento-grid'
import { LayoutGrid } from './ui/layout-grid'

export function ModalImage({ images, title }: { images: Image[]; title: string }) {
    if (!images.length) return null

    const cards = images.map((image, i) => ({
        id: i,
        content: image,
        className: 'col-span-1',
        thumbnail: image.imageUrl,
    }))

    return (
        <Dialog>
            <DialogTrigger asChild>
                <InteractiveHoverButton>{title}</InteractiveHoverButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-6xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buscando imagen para {title}</DialogTitle>
                    <DialogDescription>Selecciona la imagen que mejor se adapte al producto</DialogDescription>
                </DialogHeader>
                <div className="relative min-h-[500px]">
                    <LayoutGrid cards={cards} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

/* <BentoGrid className="mx-auto overflow-y-auto">
    {images.map((item, i) => (
        <BentoGridItem
            key={i}
            title={item.title}
            description={item.source}
            header={<img src={item.imageUrl} alt={item.title} />}
            className={i === 3 || i === 6 ? 'md:col-span-2' : ''}
        />
    ))}
</BentoGrid> */

const SkeletonOne = () => {
    return (
        <div>
            <p className="font-bold md:text-4xl text-xl text-white">House in the woods</p>
            <p className="font-normal text-base text-white"></p>
            <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
                A serene and tranquil retreat, this house in the woods offers a peaceful escape from the hustle and
                bustle of city life.
            </p>
        </div>
    )
}

const SkeletonTwo = () => {
    return (
        <div>
            <p className="font-bold md:text-4xl text-xl text-white">House above the clouds</p>
            <p className="font-normal text-base text-white"></p>
            <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
                Perched high above the world, this house offers breathtaking views and a unique living experience.
                It&apos;s a place where the sky meets home, and tranquility is a way of life.
            </p>
        </div>
    )
}
const SkeletonThree = () => {
    return (
        <div>
            <p className="font-bold md:text-4xl text-xl text-white">Greens all over</p>
            <p className="font-normal text-base text-white"></p>
            <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
                A house surrounded by greenery and nature&apos;s beauty. It&apos;s the perfect place to relax, unwind,
                and enjoy life.
            </p>
        </div>
    )
}
const SkeletonFour = () => {
    return (
        <div>
            <p className="font-bold md:text-4xl text-xl text-white">Rivers are serene</p>
            <p className="font-normal text-base text-white"></p>
            <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
                A house by the river is a place of peace and tranquility. It&apos;s the perfect place to relax, unwind,
                and enjoy life.
            </p>
        </div>
    )
}
