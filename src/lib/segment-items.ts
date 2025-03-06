export function splitArray<T>(arr: T[], size = 10): T[][] {
    return arr.reduce((acc, _, i) => {
        if (i % size === 0) acc.push(arr.slice(i, i + size))
        return acc
    }, [] as T[][])
}
