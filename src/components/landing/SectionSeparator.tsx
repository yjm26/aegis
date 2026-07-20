interface SectionSeparatorProps {
  label: string;
  meta?: string;
}

export default function SectionSeparator({ label, meta }: SectionSeparatorProps) {
  return (
    <div className="landing-section-separator" aria-hidden="true">
      <div className="landing-separator-inner">
        <span>{label}</span>
        {meta && <strong>{meta}</strong>}
      </div>
    </div>
  );
}
