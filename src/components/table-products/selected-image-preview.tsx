import { LoaderCircle } from 'lucide-react'

type Props = {
    imageUrl: string
    alt: string
    loading?: boolean
    onClick?: () => void
}

export function SelectedImagePreview({ imageUrl, alt, loading, onClick }: Props) {
    return (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-green-500 bg-white shadow-md">
            <img src={imageUrl} alt={alt} className="h-full w-full cursor-pointer object-cover" onClick={onClick} />
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                    <LoaderCircle className="animate-spin text-green-700" size={24} />
                </div>
            )}
        </div>
    )
}
