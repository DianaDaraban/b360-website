// Floating colour blobs: "page" sits fixed behind the whole page, "photo" glows over a photo
// section, "soft" drifts behind a light section (styles in globals.css). The page background has
// seven, each on its own path and slowly turning from one colour to another.
export function Blobs({ variant }: { variant: "page" | "photo" | "soft" }) {
    const count = variant === "page" ? 7 : 4
    return (
        <div className={`blobs blobs-${variant}`} aria-hidden="true">
            {Array.from({ length: count }, (_, i) => <span key={i} />)}
        </div>
    )
}
