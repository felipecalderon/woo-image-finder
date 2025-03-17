export const cleanText = (texto: string) => {
    return (
        texto
            // Asegura que solo separa la "x" en dimensiones numéricas (ej: "3.80mX0.38m" -> "3.80m x 0.38m")
            .replace(
                /(\d+(?:\.\d+)?)(m|cm|mm|mt|mts|lts|grs|lbs|pzas|pcs|gr|dts)?\s*x\s*(\d+(?:\.\d+)?)(m|cm|mm|mt|mts|lts|grs|lbs|pzas|pcs|gr|dts)?/gi,
                '$1$2x$3$4'
            )
            // Elimina comillas simples y dobles
            .replace(/['"]/g, '')
            // Reemplaza "C/" o "c/" por "con "
            .replace(/\bC\//gi, 'con ')
            // Elimina espacios extra
            .trim()
    )
}
