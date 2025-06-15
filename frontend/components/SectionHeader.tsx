interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
    return <h2 className="text-lg font-bold mt-6 mb-3">{title}</h2>;
}
