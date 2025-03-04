import { Image } from './image.interface'

export interface ResponseAPI {
    searchParameters: {
        q: string
        hl: string
        type: string
        location: string
        engine: string
        num: number
        gl: string
    }
    images: Image[]
    credits?: number
}
