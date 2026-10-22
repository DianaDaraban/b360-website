export const site = {
    name: "B360",
    tagline: "Producție publicitară",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.b360.ro",
    phone: "0745 094 195",
    phoneHref: "tel:+40745094195",
    email: "office@b360.ro",
    instagram: "https://www.instagram.com/b360.ro",
    address: { street: "Strada Ogorului 2", locality: "Corbeanca", region: "Ilfov", country: "RO" },
    founded: 2012,
    hours: { label: "Luni – Vineri, 9:00 – 18:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    // B360 is the brand of Red Division SRL (legal identity for the footer, privacy policy, ANPC)
    company: {
        name: "Red Division SRL",
        cui: "RO29533761",
        regCom: "J40/241/12.01.2012",
        seat: "Str. Gârleni nr. 8, bl. C83, sc. A, et. 4, ap. 27, Sector 6, București",
    },
    // the workshop address opens in Waze: the app with navigation on a phone, the Waze map in a browser
    get wazeUrl() {
        return `https://waze.com/ul?q=${encodeURIComponent(`${this.address.street}, ${this.address.locality}, ${this.address.region}`)}&navigate=yes`
    },
}

export const nav = [
    { href: "/", label: "Acasă", icon: "home" },
    { href: "/despre-noi", label: "Despre noi", icon: "info" },
    { href: "/servicii", label: "Servicii", icon: "car" },
    { href: "/portofoliu", label: "Portofoliu", icon: "gallery" },
    { href: "/contact", label: "Contact", icon: "at" },
] as const

export type IconName = (typeof nav)[number]["icon"] | "phone" | "calculator" | "check" | "arrow" | "store" | "printer" | "mail" | "instagram"
