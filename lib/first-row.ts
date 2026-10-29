// The first tiles of a photo grid are on screen at once: fetched straight away (the very first one
// ahead of everything), not lazily. Spread onto a next/image: <Image … {...firstRow(i)} />
export const firstRow = (i: number) => (i < 4 ? { loading: "eager" as const, fetchPriority: i === 0 ? ("high" as const) : undefined } : {})
