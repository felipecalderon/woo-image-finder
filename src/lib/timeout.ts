export const wait = async (ms = 1000) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
