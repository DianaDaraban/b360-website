// Renders **bold** spans in content strings (the Figma texts emphasise key phrases)
export function Rich({ text }: { text: string }) {
    return <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>
}
