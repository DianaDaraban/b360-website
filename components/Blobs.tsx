// Floating colour blobs: "page" sits fixed behind the whole page, "photo" glows over a photo
// section (styles in globals.css)
export function Blobs({ variant }: { variant: "page" | "photo" }) {
    return (
        <div className={`blobs blobs-${variant}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
        </div>
    )
}
