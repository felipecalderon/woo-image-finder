'use client'
export const convertToJpg = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous' // Para evitar problemas de CORS en imágenes externas
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject(new Error('No se pudo obtener el contexto del canvas'))
            ctx.drawImage(img, 0, 0)

            canvas.toBlob(
                (jpgBlob) => {
                    if (jpgBlob) resolve(jpgBlob)
                    else reject(new Error('Error al convertir la imagen a JPG'))
                },
                'image/jpeg',
                0.9
            ) // Calidad 90%
        }
        img.onerror = (err) => reject(err)
        img.src = URL.createObjectURL(blob)
    })
}
