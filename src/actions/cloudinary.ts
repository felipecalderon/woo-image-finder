import { config } from '@/constants/env'
import { v2 as cloudinary } from 'cloudinary'
// examplefile: https://dojiw2m9tvv09.cloudfront.net/73975/product/ele61080674.jpg

export const uploadToCDN = async (imageUrl: string, fileName: string) => {
    cloudinary.config({
        api_key: config.CLOUDINARY_APIKEY,
        api_secret: config.CLOUDINARY_APISECRET,
        cloud_name: config.CLOUDINARY_NAME,
    })

    try {
        const upload = await cloudinary.uploader.upload(imageUrl, {
            folder: 'geo-imgs',
            upload_preset: 'ml_default',
            public_id: fileName,
            unique_filename: true,
            overwrite: true,
        })

        console.log('Imagen subida con éxito:', upload)
        return upload.secure_url
    } catch (error) {
        console.error('Error al subir la imagen:', error)
    }
}
