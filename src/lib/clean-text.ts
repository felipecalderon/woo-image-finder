export const cleanText = (texto: string) => {
    return texto
        .replace(/\d+\s*(mm|cm|cms|mt|mts|lts|grs|lbs|pzas|pcs)\b/gi, '') // Elimina unidades (ej: 25mm -> 25)
        .replace(/\s*x\s*/gi, ' x ') // Elimina espacios en "x" (ej: 25 x 3 -> 25x3)
        .replace(/['"]/g, '') // Elimina comillas simples y dobles
        .trim() // Elimina espacios extra al inicio o final
}
