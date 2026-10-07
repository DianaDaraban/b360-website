import type { IconName } from "@/lib/site"

// Two-tone icons from the Figma menu: dark outline with a red accent piece
const paths: Record<IconName, React.ReactNode> = {
    home: <>
        <path d="M4 11.5 12 4l8 7.5V20H4z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M4 11.5 12 4l3 2.8-8.2 7.4z" fill="var(--red)" />
    </>,
    info: <>
        <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M3.4 12A8.6 8.6 0 0 1 12 3.4V7a5 5 0 0 0-5 5z" fill="var(--red)" />
        <path d="M12 10.5v6M12 7.4v.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>,
    car: <>
        <path d="M3 17v-3.5l2.2-5.2A2 2 0 0 1 7 7h10a2 2 0 0 1 1.8 1.3L21 13.5V17z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M5.2 8.3A2 2 0 0 1 7 7h6l-8.6 8.6H3v-2.1z" fill="var(--red)" />
        <path d="M6.5 17v2M17.5 17v2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>,
    gallery: <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M3.5 13 13 3.5H6.5a3 3 0 0 0-3 3z" fill="var(--red)" />
        <path d="m7 18 4.5-6 3 3.5 2-2.5L20 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>,
    at: <>
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M15.6 9v4.4a2.6 2.6 0 0 0 5.2 0V12A8.8 8.8 0 1 0 17 19.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M3.2 12A8.8 8.8 0 0 1 12 3.2v3.4A5.4 5.4 0 0 0 6.6 12z" fill="var(--red)" />
    </>,
    phone: <path d="M6.6 3.5c.6 0 1.1.4 1.3 1l1.1 3.4c.2.6 0 1.2-.5 1.6L7 10.8a12 12 0 0 0 6.2 6.2l1.3-1.5c.4-.5 1-.7 1.6-.5l3.4 1.1c.6.2 1 .7 1 1.3v2.4c0 .8-.7 1.5-1.5 1.5C10 21.3 2.7 14 2.7 5c0-.8.7-1.5 1.5-1.5z" fill="currentColor" />,
    calculator: <>
        <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="7" y="5" width="10" height="3.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8.5 11.2v3M7 12.7h3M14 12.7h3M7.4 16.4l2.2 2.2M9.6 16.4l-2.2 2.2M14 17.5h3M15.5 16v.1M15.5 19v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>,
    // Brush-stroke tick used in the Figma lists
    check: <path d="M2.5 12.5c2 .3 3.6 1.8 5 4.3C11 9.6 15.6 5.3 21.5 3c-5 3.6-9.4 9-12.6 17.6-.6.4-1.2.4-1.6 0C6 17.4 4.5 14.6 2.5 12.5z" fill="var(--red)" />,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
}

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" focusable="false">
            {paths[name]}
        </svg>
    )
}
