import { ImageThumbnail } from '@/components/thumbnail'
import { Image } from '@/interfaces/image.interface'
import { cn } from '@/lib/utils'

type Props = {
    images: Image[]
    selectedThumbnailUrl?: string
    onSelect: (image: Image) => void
    variant?: 'wrap' | 'scroll'
}

export function ImageGallery({ images, selectedThumbnailUrl, onSelect, variant = 'wrap' }: Props) {
    return (
        <div
            className={variant === 'scroll' ? 'flex gap-3 overflow-x-auto pb-2 pr-1 [scrollbar-width:none]' : 'flex flex-wrap gap-3'}
        >
            {images.map((image) => {
                const isSelected = selectedThumbnailUrl === image.thumbnailUrl

                return (
                    <div
                        key={image.imageUrl}
                        className={cn(
                            'shrink-0 rounded-xl transition-all duration-300',
                            variant === 'scroll' && 'snap-start',
                            isSelected ? 'ring-4 ring-green-500 ring-offset-2 scale-95 shadow-lg' : 'hover:scale-105 active:scale-95',
                        )}
                    >
                        <ImageThumbnail image={image} onClick={() => onSelect(image)} />
                    </div>
                )
            })}
        </div>
    )
}
