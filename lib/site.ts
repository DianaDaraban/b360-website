export const site = {
    name: "B360",
    tagline: "Producție publicitară",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.b360.ro",
    phone: "0745 094 195",
    phoneHref: "tel:+40745094195",
    email: "office@b360.ro",
    address: { street: "Strada Ogorului 2", locality: "Corbeanca", region: "Ilfov", country: "RO" },
    founded: 2012,
    get mapsUrl() {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`B360, ${this.address.street}, ${this.address.locality}, ${this.address.region}`)}`
    },
}

export const nav = [
    { href: "/", label: "Acasă", icon: "home" },
    { href: "/despre-noi", label: "Despre noi", icon: "info" },
    { href: "/servicii", label: "Servicii", icon: "car" },
    { href: "/portofoliu", label: "Portofoliu", icon: "gallery" },
    { href: "/contact", label: "Contact", icon: "at" },
] as const

export type IconName = (typeof nav)[number]["icon"] | "phone" | "calculator" | "check" | "arrow" | "store" | "printer" | "mail"
