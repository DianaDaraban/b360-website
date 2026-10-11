// Services: card texts from the Figma "Servicii" screen; the detail page follows the Figma
// "Colantări auto integrale și parțiale" screen (types, car comparison, benefits, fleet, FAQ).
// FAQ answers and the PPF details were written to the same pattern and still need B360's
// confirmation (see README, "De completat").
export type Serviciu = {
    slug: string
    title: string            // page H1
    short: string            // menu and card label
    teaser: string           // one line under the label in the dropdown
    image: string            // card photo
    hero: string             // photo behind the page heading
    intro: string            // card text (Figma Servicii screen)
    lead: { title: string; text: string }
    typesTitle: string
    typesText: string
    types: { title: string; items: string[] }[]
    comparison?: boolean     // the integral / partial car slider
    benefits: string[]
    benefitsPhoto: string
    extra?: { title: string; question: string; text: string }
    faq: { q: string; a: string }[]
    portfolio: { label: string; category: string }
    // a screen with the service's projects from the gallery: those of its portfolio category, or the
    // projects named here (a single project shows its photos one by one)
    showcase?: { kicker: string; projects?: string[] }
    metaDescription: string
}

export const servicii: Serviciu[] = [
    {
        slug: "colantare-auto",
        title: "Colantări Auto Integrale și Parțiale",
        short: "Colantări auto",
        teaser: "Integrale sau parțiale, pentru branding sau schimbare de culoare",
        image: "/img/wrap-hands.webp",
        hero: "/lucrari/autoturisme/masina-de-curse-1.webp",
        intro: "Transformăm mașinile în instrumente de marketing vizibil: colantări integrale pentru branding complet sau schimbare de culoare și colantări parțiale pentru campanii flexibile.",
        lead: {
            title: "Colantări auto care transformă mașinile în instrumente de marketing",
            text: "Din 2012, la **B360** realizăm colantări auto profesionale pentru companii, branduri și persoane fizice. Fie că vrei un branding complet sau doar un design parțial, colantarea oferă vizibilitate și protecție vopselei originale.",
        },
        typesTitle: "Tipuri de colantări auto",
        typesText: "Acoperirea completă a caroseriei, ideală pentru branding complet sau schimbare de culoare.",
        types: [
            { title: "Colantări integrale", items: ["Acoperirea completă a caroseriei", "Ideală pentru branding complet sau schimbarea culorii", "Protejează vopseaua de zgârieturi și uzură", "Durabilitate ridicată, aspect premium"] },
            { title: "Colantări parțiale", items: ["Stickere, elemente grafice sau zone selectate", "Soluție flexibilă și mai accesibilă ca buget", "Recomandată pentru promoții sau campanii temporare", "Montaj rapid și personalizare completă"] },
        ],
        comparison: true,
        benefits: ["Promovare mobilă 24/7 – brandul tău e vizibil oriunde circulă mașina", "Protecție suplimentară pentru caroserie", "Design unic, personalizat pentru afacerea ta", "Soluție mai ieftină decât vopsirea clasică"],
        benefitsPhoto: "/img/wrap-green.webp",
        extra: { title: "Colantări flotă auto pentru companii", question: "Ai mai multe mașini în companie?", text: "Realizăm **branding unitar pentru flote auto** – de la autoturisme la autoutilitare și camioane." },
        faq: [
            { q: "Cât durează o colantare auto integrală?", a: "În medie, între 2 și 4 zile, în funcție de complexitatea proiectului." },
            { q: "Colantarea afectează vopseaua originală?", a: "Nu. Folia se aplică peste vopsea și o protejează; la o demontare făcută corect, vopseaua originală rămâne neatinsă." },
            { q: "Pot colanta doar anumite părți ale mașinii?", a: "Da. Colantarea parțială acoperă doar zonele alese: capota, plafonul, oglinzile, ușile sau elemente grafice." },
            { q: "Ce trebuie să fac înainte de colantare?", a: "Mașina trebuie adusă curată. De restul, de la degresare la demontarea elementelor, ne ocupăm noi." },
            { q: "Pot colanta și o mașină cu mici zgârieturi sau defecte de vopsea?", a: "Zgârieturile fine se acoperă, dar defectele mai mari sau vopseaua care se cojește se văd prin folie. Le evaluăm înainte de montaj." },
        ],
        portfolio: { label: "Vezi portofoliu colantări auto", category: "autoturisme" },
        metaDescription: "Colantări auto integrale și parțiale: branding, schimbare de culoare și protecția vopselei. Folii premium ORAFOL, Avery Dennison și 3M, montaj profesionist din 2012.",
    },
    {
        slug: "autocolante-inscriptionari",
        title: "Inscripționări și Stickere Personalizate",
        short: "Stickere și inscripționări",
        teaser: "Pe auto, pereți, geamuri, panouri sau orice suprafață plană",
        image: "/img/racing-stripes.webp",
        hero: "/img/letters-3d.webp",
        intro: "Realizăm stickere și inscripționări personalizate pe orice suport: auto, pereți, geamuri, panouri sau alte suprafețe plane.",
        lead: {
            title: "Stickere care duc brandul tău oriunde",
            text: "Realizăm **stickere** și **inscripționări personalizate** pe orice suport: auto, pereți, geamuri, panouri sau alte suprafețe plane, de la grafică până la montaj.",
        },
        typesTitle: "Ce realizăm",
        typesText: "Stickere tăiate pe contur sau printate, pentru interior și exterior.",
        types: [
            { title: "Stickere și autocolante", items: ["Printate sau tăiate pe contur", "Pentru auto, vitrine, produse și ambalaje", "Folii pentru interior și exterior"] },
            { title: "Inscripționări", items: ["Litere și logo-uri decupate din folie", "Pe pereți, uși, geamuri și panouri", "Potrivite pentru birouri, magazine și evenimente"] },
        ],
        benefits: ["Potrivite pentru evenimente, campanii publicitare sau branding de produs", "Aplicare rapidă și impact vizual imediat", "Orice formă și dimensiune", "Se îndepărtează curat când campania se încheie"],
        benefitsPhoto: "/img/letters.webp",
        faq: [
            { q: "Ce fișier trebuie să vă trimit?", a: "Ideal un fișier vectorial (AI, EPS, PDF, SVG). Dacă nu ai unul, putem realiza noi grafica." },
            { q: "Stickerele rezistă afară?", a: "Da, pentru exterior folosim folii rezistente la apă și la soare." },
            { q: "Se pot scoate fără urme?", a: "Pentru campanii temporare alegem folii cu adeziv detașabil, care se îndepărtează curat." },
        ],
        portfolio: { label: "Vezi portofoliu stickere și inscripționări", category: "stickere" },
        metaDescription: "Stickere și inscripționări personalizate pentru auto, vitrine, pereți și panouri. Print și tăiere pe contur, folii pentru interior și exterior, montaj inclus.",
    },
    {
        slug: "colantare-vitrine",
        title: "Colantări și Inscripționări Vitrine",
        short: "Vitrine",
        teaser: "Folii sablate, colorate sau cu protecție solară",
        image: "/img/storefront-stickers.webp",
        hero: "/lucrari/vitrine/tiriac-auto-1.webp",
        intro: "O vitrină bine colantată atrage atenția clienților chiar din stradă și oferă în același timp un plus de protecție.",
        lead: {
            title: "Vitrine care atrag clienții din stradă",
            text: "O vitrină bine colantată atrage atenția clienților chiar din stradă și oferă în același timp un plus de protecție.",
        },
        typesTitle: "Oferim soluții variate",
        typesText: "Alegem folia după cât de vizibil vrei să fie interiorul și cât timp rămâne grafica.",
        types: [
            { title: "Folii sablate sau transparente", items: ["Pentru un aspect elegant și intim", "Ideale pentru birouri și spații de consultanță"] },
            { title: "Folii colorate sau printate", items: ["Ideale pentru campanii promoționale și branding vizibil", "Grafică pe toată vitrina sau doar pe zone"] },
            { title: "Folii cu protecție UV și solară", items: ["Reduc pătrunderea razelor ultraviolete și căldura excesivă", "Protejează interiorul și oferă confort clienților"] },
        ],
        benefits: ["Branding permanent sau temporar, adaptat nevoilor business-ului tău", "Vizibil din stradă, zi și noapte", "Intimitate fără să pierzi lumina", "Se schimbă ușor la fiecare campanie"],
        benefitsPhoto: "/img/storefront-stickers.webp",
        faq: [
            { q: "Trebuie să închid magazinul pentru montaj?", a: "De obicei nu. Montăm din exterior sau în afara programului, în funcție de vitrină." },
            { q: "Cât rezistă o folie pe vitrină?", a: "Depinde de folie: de la câteva luni pentru campanii până la câțiva ani pentru branding permanent." },
            { q: "Realizați și grafica pentru vitrină?", a: "Da. Echipa noastră de design pregătește grafica pornind de la identitatea brandului tău, apoi o producem și o montăm." },
            { q: "Folia se poate scoate fără urme?", a: "Da. La finalul unei campanii îndepărtăm folia, iar geamul rămâne curat, gata pentru următoarea grafică." },
        ],
        portfolio: { label: "Vezi portofoliu colantări vitrine", category: "vitrine" },
        metaDescription: "Colantări vitrine: folii sablate, colorate, printate sau cu protecție UV și solară. Branding permanent sau temporar pentru magazine, showroom-uri și birouri.",
    },
    {
        slug: "tapet-printat",
        title: "Tapet Printat Personalizat și Montaj",
        short: "Tapet printat",
        teaser: "Pereți cu imaginea aleasă de tine, printați și montați de noi",
        image: "/lucrari/proiecte/tapet-balon-cu-aer-cald/1.webp",
        hero: "/lucrari/proiecte/tapet-living-abstract/1.webp",
        intro: "Printăm tapet personalizat cu orice imagine, la dimensiunea exactă a peretelui, și îl montăm noi: pentru case, birouri, restaurante și magazine.",
        lead: {
            title: "Un perete care spune povestea ta",
            text: "Printăm **tapet personalizat** în atelierul **B360**, la dimensiunea exactă a peretelui, cu imaginea aleasă de tine sau cu o grafică făcută de noi. Ne ocupăm de tot: măsurători, pregătirea fișierului, print și **montaj**.",
        },
        typesTitle: "Ce realizăm",
        typesText: "De la o cameră de copil la recepția unei firme, tapetul printat schimbă complet un spațiu.",
        types: [
            { title: "Tapet pentru acasă", items: ["Living, dormitor, camera copiilor", "Peisaje, flori, abstract sau fotografiile tale", "Pe tot peretele sau doar pe o porțiune"] },
            { title: "Tapet pentru spații comerciale", items: ["Birouri, recepții și săli de ședință", "Restaurante, cafenele, hoteluri și magazine", "Branding pe perete, în culorile firmei"] },
        ],
        benefits: ["Orice imagine – fotografia ta, o grafică din bănci de imagini sau un design făcut de noi", "Pe măsura peretelui – printăm exact la dimensiunile camerei, fără îmbinări nepotrivite", "Print de calitate – culori vii, rezistente la lumină, pe materiale pentru interior", "Montaj inclus – echipa noastră pregătește peretele și aplică tapetul"],
        benefitsPhoto: "/lucrari/proiecte/tapet-flori-de-cires/1.webp",
        extra: { title: "Tapet pentru firma ta", question: "Ai un birou, un restaurant sau un magazin?", text: "Transformăm pereții în **branding**: logo, culorile firmei sau imagini care spun povestea afacerii tale." },
        faq: [
            { q: "Pot folosi o fotografie făcută de mine?", a: "Da, dacă are rezoluția potrivită pentru dimensiunea peretelui. O verificăm noi și îți spunem sincer cum va arăta; dacă nu ajunge, îți propunem alternative." },
            { q: "Cum aflu ce dimensiune îmi trebuie?", a: "Ne trimiți lățimea și înălțimea peretelui, iar pentru proiecte mai mari venim noi la măsurători. Printăm cu o mică rezervă pentru o potrivire exactă la montaj." },
            { q: "Pe ce pereți se poate monta tapetul?", a: "Pe pereți netezi, uscați și curați, vopsiți sau gletuiți. Dacă peretele are denivelări sau igrasie, le evaluăm înainte de montaj." },
            { q: "Cât durează de la comandă la montaj?", a: "De obicei câteva zile: aprobăm împreună grafica, printăm în atelierul nostru și programăm montajul." },
            { q: "Se poate curăța tapetul?", a: "Da, cu o lavetă ușor umedă, fără detergenți agresivi." },
        ],
        portfolio: { label: "Vezi toate lucrările cu tapet", category: "tapet" },
        showcase: { kicker: "Din atelier, pe pereți" },
        metaDescription: "Tapet printat personalizat cu orice imagine, la dimensiunea peretelui, cu montaj inclus. Pentru case, birouri, restaurante și magazine. Print în atelierul B360.",
    },
    {
        slug: "folie-ppf",
        title: "Folie PPF – Protecție Transparentă pentru Vopsea",
        short: "Folie PPF",
        teaser: "Peliculă transparentă împotriva pietricelelor și zgârieturilor",
        image: "/img/wrap-fan.webp",
        hero: "/img/wrap-fan.webp",
        intro: "Folia PPF este o peliculă transparentă care protejează vopseaua de pietricele, zgârieturi fine și razele UV, fără să schimbe aspectul mașinii.",
        lead: {
            title: "Vopseaua rămâne ca nouă, fără să se vadă folia",
            text: "Folia **PPF** (Paint Protection Film) este o peliculă transparentă care protejează vopseaua de pietricele, zgârieturi fine și razele UV, fără să schimbe aspectul mașinii.",
        },
        typesTitle: "Tipuri de protecție",
        typesText: "Protejăm toată mașina sau doar zonele cele mai expuse.",
        types: [
            { title: "Protecție integrală", items: ["Toată caroseria", "Pentru mașini noi sau proaspăt polișate"] },
            { title: "Protecție parțială", items: ["Bara față, capota, aripile și oglinzile", "Zonele cele mai lovite de pietricele"] },
        ],
        benefits: ["Protecție împotriva pietricelelor și a zgârieturilor fine", "Invizibilă: culoarea și luciul rămân neschimbate", "Păstrează valoarea mașinii la revânzare", "Se poate îndepărta fără să afecteze vopseaua"],
        benefitsPhoto: "/img/wrap-salon.webp",
        extra: { title: "PPF peste colantare?", question: "Ai colantat deja mașina?", text: "Putem combina **colantarea auto** cu **folia PPF** pe zonele expuse, ca grafica să reziste mai mult." },
        faq: [
            { q: "Se vede folia PPF pe mașină?", a: "Practic nu. Folia e transparentă și urmărește forma caroseriei." },
            { q: "Cât durează montajul?", a: "Pentru zonele expuse, de obicei o zi; pentru toată mașina, câteva zile." },
            { q: "Cât rezistă folia PPF?", a: "O folie PPF de calitate, montată corect, rezistă de regulă câțiva ani, fără să se îngălbenească." },
            { q: "Cum se întreține mașina după montaj?", a: "Se spală normal, ca orice mașină. Recomandăm doar să eviți spălătoriile cu perii în primele zile după montaj." },
        ],
        portfolio: { label: "Vezi portofoliu colantări auto", category: "autoturisme" },
        showcase: { kicker: "Folie PPF mată", projects: ["land-rover-defender"] },
        metaDescription: "Folie PPF transparentă pentru protecția vopselei: integral sau pe zonele expuse (bară, capotă, aripi, oglinzi). Montaj profesionist B360.",
    },
]

export const getServiciu = (slug: string) => servicii.find(s => s.slug === slug)
