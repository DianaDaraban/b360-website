// Runs before the app starts in the browser. The build targets older browsers too (browserslist in
// package.json: Safari 14 / iOS 14, Chrome 87), which handles the syntax; Next.js's own code also
// calls Array.prototype.at (Safari 15.4+, Chrome 92+), added here for the phones that lack it.
for (const proto of [Array.prototype, String.prototype] as { at?: unknown }[]) {
    if (!proto.at) {
        Object.defineProperty(proto, "at", {
            configurable: true,
            writable: true,
            value(this: ArrayLike<unknown>, i: number) {
                const n = Math.trunc(i) || 0
                return this[n < 0 ? this.length + n : n]
            },
        })
    }
}
