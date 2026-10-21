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
    extra?: { title: string; question: string; text: string; link?: { href: string; label: string } }   // link: the banner button (else the gallery)
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
        extra: { title: "Colantări flotă auto pentru companii", question: "Ai mai multe mașini în companie?", text: "Realizăm **branding unitar pentru flote auto** – de la autoturisme la autoutilitare și camioane.", link: { href: "/servicii/colantare-autoutilitare", label: "Branding flote auto" } },
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

// Pages for one kind of vehicle: the old site had one each and they brought most of the unpaid
// visits from Google (moto, trucks, coaches, vans, boats). They are not in the menu or on the home
// page; /servicii, the car wrap page and each other links to them, and they are in the sitemap.
export const vehicule: Serviciu[] = [
    {
        slug: "colantare-moto",
        title: "Colantare Moto și Stickere pentru Motociclete",
        short: "Colantare moto",
        teaser: "Carenaje, rezervor, jante, căști și kituri grafice",
        image: "/lucrari/speciale/1.webp",
        hero: "/lucrari/speciale/4.webp",
        intro: "Colantăm motociclete întregi sau doar carenajele, rezervorul și jantele, refacem grafica originală și facem kituri personalizate.",
        lead: {
            title: "Motocicleta ta, cu grafica pe care o vrei",
            text: "La **B360** colantăm **motociclete** de toate tipurile: sport, naked, enduro sau scutere. Schimbăm culoarea carenajelor, refacem **grafica originală** după model sau desenăm un **kit grafic** nou, de la idee până la montaj.",
        },
        typesTitle: "Ce colantăm pe motociclete",
        typesText: "Fiecare motocicletă are zeci de piese mici și curbe strânse, așa că fiecare lucrare e făcută la comandă.",
        types: [
            { title: "Colantare carenaje", items: ["Schimbarea culorii pe toată motocicleta sau doar pe carenaje", "Finisaje lucioase, mate, satinate sau carbon", "Protejează vopseaua originală"] },
            { title: "Kituri grafice și replici", items: ["Grafica originală refăcută după model", "Kituri personalizate, numere de concurs", "Dungi pe rezervor și pe jante"] },
            { title: "Căști și accesorii", items: ["Colantare căști", "Stickere pentru cutii, genți și accesorii", "Logo-uri de echipă sau de sponsor"] },
        ],
        benefits: ["Aspect nou fără vopsire – carenajele se schimbă complet, iar vopseaua rămâne protejată dedesubt", "Replici fidele – refacem grafica originală deteriorată sau decolorată", "Design unic – kitul tău nu-l mai are nimeni", "Reversibil – folia se poate scoate când vrei să revii la original"],
        benefitsPhoto: "/lucrari/speciale/1.webp",
        faq: [
            { q: "Cât costă colantarea unei motociclete?", a: "Depinde de model și de cât acoperim: un kit de dungi costă mult mai puțin decât schimbarea culorii pe toată motocicleta. Trimite-ne câteva poze cu motocicleta și ce ai vrea să facem, iar noi îți spunem prețul." },
            { q: "Puteți reface stickerele originale ale motocicletei?", a: "Da. Refacem grafica originală după model sau după piesele vechi, cu folii rezistente la soare și la benzină." },
            { q: "Colantați și căști?", a: "Da, colantăm căști și accesorii, cu grafica aleasă de tine sau potrivită cu motocicleta." },
            { q: "Se poate colanta o motocicletă cu carenaje zgâriate?", a: "Zgârieturile fine se acoperă. Fisurile sau vopseaua care se cojește se văd prin folie, așa că le evaluăm înainte de montaj." },
        ],
        portfolio: { label: "Vezi lucrări moto, bărci și avioane", category: "speciale" },
        showcase: { kicker: "Din atelier", projects: ["/lucrari/speciale/1.webp", "/lucrari/speciale/4.webp", "/lucrari/speciale/2.webp", "/lucrari/speciale/3.webp"] },
        metaDescription: "Colantare moto: schimbarea culorii carenajelor, kituri grafice, replici ale stickerelor originale, dungi pe jante și colantare căști. Atelier B360, Corbeanca, Ilfov.",
    },
    {
        slug: "colantare-camioane",
        title: "Colantare Camioane, TIR-uri și Semiremorci",
        short: "Camioane și TIR-uri",
        teaser: "Cabine, semiremorci, prelate și cisterne",
        image: "/lucrari/camioane/rkm-logistics-1.webp",
        hero: "/lucrari/camioane/polach-1.webp",
        intro: "Transformăm camioanele și semiremorcile în panouri publicitare care circulă prin toată țara și prin Europa.",
        lead: {
            title: "Cel mai mare panou publicitar al firmei tale are roți",
            text: "La **B360** inscripționăm și colantăm **camioane**, **cabine de TIR**, **semiremorci** și **cisterne** pentru firme de transport, logistică și construcții. O semiremorcă are zeci de metri pătrați de reclamă care se văd pe autostradă în fiecare zi.",
        },
        typesTitle: "Ce colantăm",
        typesText: "De la logo-ul de pe ușa cabinei până la grafica pe toată lungimea semiremorcii.",
        types: [
            { title: "Cabine de camion", items: ["Logo, date de contact și număr de flotă", "Colantare parțială sau integrală a cabinei", "Folii pentru suprafețe cu nituri și ondulații"] },
            { title: "Semiremorci și prelate", items: ["Grafică pe laterale și pe spate", "Litere decupate sau print pe toată suprafața", "Pentru flote întregi, cu aceeași grafică pe fiecare vehicul"] },
            { title: "Cisterne și autospeciale", items: ["Inscripționări obligatorii și branding", "Benzi reflectorizante", "Ambulanțe, utilaje și vehicule de intervenție"] },
        ],
        benefits: ["Reclamă pe autostradă – mii de oameni văd vehiculul în fiecare zi, fără cost lunar", "Flotă unitară – aceeași grafică, la aceleași dimensiuni, pe fiecare camion", "Folii pentru drum lung – rezistă la spălări dese, soare și intemperii", "Se schimbă ușor – când vinzi vehiculul sau schimbi identitatea, folia se îndepărtează"],
        benefitsPhoto: "/lucrari/camioane/rkm-logistics-1.webp",
        extra: { title: "Branding pentru flote de transport", question: "Ai mai multe camioane?", text: "Pregătim o singură grafică și o adaptăm pe fiecare tip de vehicul din flotă, ca toată flota să arate la fel." },
        faq: [
            { q: "Cât stă camionul în atelier?", a: "Depinde de cât acoperim. Programăm montajul ca vehiculul să stea cât mai puțin, iar la flotele mari lucrăm pe etape, câte un vehicul pe rând." },
            { q: "Se poate colanta o prelată?", a: "Da. Pentru prelate folosim materiale potrivite pentru suprafețe flexibile, care nu se desprind la mișcarea prelatei." },
            { q: "Realizați și grafica?", a: "Da. Pornim de la logo-ul și culorile firmei și pregătim grafica pe dimensiunile exacte ale fiecărui vehicul." },
            { q: "Lucrați pentru firme din alte orașe?", a: "Da. Lucrăm cu firme de transport din toată țara. Spune-ne câte vehicule sunt și unde se află, ca să stabilim împreună montajul." },
        ],
        portfolio: { label: "Vezi portofoliu camioane și cisterne", category: "camioane" },
        showcase: { kicker: "Flote pe care le-am colantat" },
        metaDescription: "Colantare camioane, cabine de TIR, semiremorci, prelate și cisterne. Branding pentru flote de transport, logistică și construcții, din 2012. Atelier B360, Ilfov.",
    },
    {
        slug: "colantare-autocare",
        title: "Colantare Autocare și Microbuze",
        short: "Autocare și microbuze",
        teaser: "Pentru operatori de transport, cluburi sportive și școli",
        image: "/lucrari/proiecte/hello-holidays/1.webp",
        hero: "/lucrari/proiecte/flixbus/1.webp",
        intro: "Colantăm autocare și microbuze pentru operatori de transport, agenții de turism, cluburi sportive și școli: integral sau doar cu identitatea firmei.",
        lead: {
            title: "Autocare care se recunosc de departe",
            text: "La **B360** am colantat **autocare** pentru **FlixBus**, **Hello Holidays**, cluburi sportive precum **Rapid**, **Astra** sau **Handbal Club Buzău**, și flote de transport școlar. Un autocar are suprafețe mari și curbe lungi, iar grafica trebuie să se potrivească perfect pe fiecare panou.",
        },
        typesTitle: "Ce realizăm",
        typesText: "De la culoarea firmei pe tot autocarul la o simplă inscripționare cu traseul și datele de contact.",
        types: [
            { title: "Colantare integrală", items: ["Toată caroseria în culorile firmei sau ale echipei", "Grafică printată pe toată lungimea autocarului", "Schimbarea culorii fără vopsire"] },
            { title: "Inscripționări parțiale", items: ["Logo, trasee, date de contact", "Numere de flotă și inscripții obligatorii", "Pentru operatori cu multe vehicule"] },
            { title: "Cluburi sportive și școli", items: ["Autocarul echipei, cu sigla și culorile clubului", "Microbuze școlare", "Branding pentru evenimente și turnee"] },
        ],
        benefits: ["Identitate pe drum – autocarul arată firma sau echipa în fiecare oraș prin care trece", "Flotă unitară – aceeași grafică pe autocare de modele diferite", "Protecție pentru vopsea – folia preia zgârieturile fine și razele UV", "Reversibil – la revânzare, autocarul revine la culoarea inițială"],
        benefitsPhoto: "/lucrari/proiecte/hello-holidays/2.webp",
        extra: { title: "Colantări pentru flote de autocare", question: "Ai o flotă de autocare?", text: "Am lucrat pentru operatori cu zeci de vehicule. Pregătim grafica o singură dată și o adaptăm pe fiecare model din flotă." },
        faq: [
            { q: "Cât durează colantarea unui autocar?", a: "O colantare integrală durează de obicei câteva zile, iar o inscripționare parțială mult mai puțin. Îți spunem termenul exact odată cu oferta." },
            { q: "Ce folii folosiți pentru autocare?", a: "Folii cast premium, care urmăresc curbele caroseriei și rezistă la spălările dese din transportul de persoane." },
            { q: "Puteți colanta și geamurile?", a: "Da. Pentru geamuri folosim folie microperforată: din afară se vede grafica, iar pasagerii văd normal afară." },
            { q: "Lucrați și pentru cluburi sportive?", a: "Da, am colantat autocarele mai multor echipe. Pornim de la sigla și culorile clubului." },
        ],
        portfolio: { label: "Vezi portofoliu autocare", category: "autocare" },
        showcase: { kicker: "Autocare colantate de noi" },
        metaDescription: "Colantare autocare și microbuze: integral, parțial sau cu identitatea firmei. Am lucrat pentru FlixBus, Hello Holidays, cluburi sportive și școli. Atelier B360, Ilfov.",
    },
    {
        slug: "colantare-autoutilitare",
        title: "Colantare Autoutilitare și Branding Flote Auto",
        short: "Autoutilitare și flote",
        teaser: "Dube, autoutilitare și flote de firmă",
        image: "/lucrari/proiecte/ford-transit-custom/1.webp",
        hero: "/lucrari/proiecte/the-home/1.webp",
        intro: "Facem din dubele și autoutilitarele firmei tale reclamă care circulă zilnic prin oraș, de la un vehicul la flote întregi.",
        lead: {
            title: "Fiecare dubă a firmei tale poate fi o reclamă",
            text: "La **B360** colantăm **autoutilitare**, **dube** și **flote auto** pentru firme de curierat, catering, construcții, service-uri și evenimente. Am lucrat, printre altele, pentru **Țiriac Auto**, **Holcim**, **DHL**, **Sameday** și **The Home**.",
        },
        typesTitle: "Ce realizăm",
        typesText: "Alegem împreună cât acoperim: de la logo și telefon până la toată caroseria.",
        types: [
            { title: "Branding flote", items: ["Aceeași grafică pe toate vehiculele firmei", "Adaptată pe fiecare model, de la autoturism la dubă", "Montaj pe etape, ca flota să nu stea"] },
            { title: "Inscripționări parțiale", items: ["Logo, servicii, telefon și site", "Litere decupate sau print", "Soluția cea mai accesibilă ca buget"] },
            { title: "Colantare integrală", items: ["Toată caroseria cu grafica firmei", "Vizibilitate maximă în trafic", "Protejează vopseaua pentru revânzare"] },
        ],
        benefits: ["Reclamă fără chirie – plătești o singură dată, iar duba face reclamă ani la rând", "Încredere – un vehicul inscripționat arată o firmă serioasă când ajunge la client", "Flotă recognoscibilă – toate mașinile firmei arată la fel", "Păstrează valoarea – folia protejează vopseaua și se scoate la vânzarea vehiculului"],
        benefitsPhoto: "/lucrari/proiecte/holcim/1.webp",
        extra: { title: "Află prețul pe loc", question: "Vrei o estimare rapidă?", text: "În **calculatorul nostru** alegi autoutilitara, piesele pe care le colantăm și tipul de folie, iar prețul estimativ apare imediat.", link: { href: "/calculator", label: "Deschide calculatorul" } },
        faq: [
            { q: "Cât costă inscripționarea unei autoutilitare?", a: "Depinde de cât acoperim și de folie. Pentru o estimare rapidă, folosește calculatorul de pe site; pentru flote îți facem o ofertă pe vehicul." },
            { q: "Cât durează?", a: "O inscripționare parțială se face de obicei într-o zi, iar o colantare integrală în câteva zile." },
            { q: "Colantați flote mari?", a: "Da. Pregătim grafica o dată, o adaptăm pe fiecare model și montăm pe etape, ca firma să aibă mereu vehicule pe drum." },
            { q: "Folia afectează vopseaua?", a: "Nu. O protejează, iar la îndepărtarea făcută corect vopseaua rămâne neatinsă." },
        ],
        portfolio: { label: "Vezi portofoliu autoutilitare", category: "autoutilitare" },
        showcase: { kicker: "Flote colantate de noi" },
        metaDescription: "Colantare autoutilitare și dube, branding pentru flote auto de firmă: inscripționări parțiale sau colantare integrală. Lucrări pentru Țiriac Auto, Holcim, DHL, Sameday.",
    },
    {
        slug: "colantare-barci-avioane",
        title: "Colantare Bărci, Iahturi și Avioane",
        short: "Bărci și avioane",
        teaser: "Nume, înmatriculări și branding de sponsori",
        image: "/lucrari/speciale/drapper-1.webp",
        hero: "/lucrari/speciale/drapper-1.webp",
        intro: "Inscripționăm și colantăm bărci, iahturi și avioane ușoare: nume, înmatriculări, grafică și sigle de sponsori.",
        lead: {
            title: "Grafică pentru apă și aer",
            text: "La **B360** am realizat inscripționări pentru **iahtul Allegro**, avioane de acrobație cu siglele sponsorilor **Draper** și **Evelor**, și bărci de agrement. Pentru apă și aer folosim folii făcute să reziste la soare, apă sărată și viteză.",
        },
        typesTitle: "Ce realizăm",
        typesText: "De la numele bărcii până la branding complet pentru o echipă sau un sponsor.",
        types: [
            { title: "Bărci și iahturi", items: ["Numele ambarcațiunii și numărul de înmatriculare", "Dungi și grafică pe corp", "Siglele sponsorilor pentru regate"] },
            { title: "Avioane ușoare", items: ["Înmatriculări și inscripții", "Branding de sponsori pentru show-uri aeriene", "Grafică pe fuzelaj și aripi"] },
        ],
        benefits: ["Folii pentru condiții grele – rezistă la soare, apă și vânt", "Fără vopsire – grafica se schimbă de la un sezon la altul", "Sponsori vizibili – siglele se văd de la distanță, la regate și la show-uri", "Grafică la comandă – pregătim fișierul pe dimensiunile exacte"],
        benefitsPhoto: "/lucrari/speciale/allegro.webp",
        faq: [
            { q: "Rezistă folia pe o barcă?", a: "Da. Folosim folii pentru exterior, rezistente la apă, la soare și la apa sărată, montate pe suprafețe curate și uscate." },
            { q: "Faceți numele și înmatricularea bărcii?", a: "Da, cu litere decupate din folie, la dimensiunile cerute." },
            { q: "Lucrați în afara atelierului?", a: "Pentru bărci și avioane stabilim împreună locul montajului, în funcție de unde se află ambarcațiunea sau aeronava." },
        ],
        portfolio: { label: "Vezi lucrări moto, bărci și avioane", category: "speciale" },
        showcase: { kicker: "Pe apă și în aer", projects: ["speciale-Draper Tools", "speciale-Allegro"] },
        metaDescription: "Colantare și inscripționare bărci, iahturi și avioane ușoare: nume, înmatriculări, grafică și sigle de sponsori. Folii rezistente la apă și soare. B360, Ilfov.",
    },
]

export const toateServiciile = [...servicii, ...vehicule]
export const getServiciu = (slug: string) => toateServiciile.find(s => s.slug === slug)
