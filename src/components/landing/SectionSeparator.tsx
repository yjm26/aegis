import { landingPanelWidth } from './ChapterSection';

interface SectionSeparatorProps {
  label: string;
  meta?: string;
}

const separatorBackground = [
  'bg-[linear-gradient(90deg,transparent_calc(var(--gutter)-1px),color-mix(in_oklch,var(--text)_13%,transparent)_var(--gutter),transparent_calc(var(--gutter)+1px)),linear-gradient(90deg,transparent_calc(100%-var(--gutter)-1px),color-mix(in_oklch,var(--text)_13%,transparent)_calc(100%-var(--gutter)),transparent_calc(100%-var(--gutter)+1px)),repeating-linear-gradient(90deg,transparent_0_4.75rem,color-mix(in_oklch,var(--text)_7%,transparent)_4.75rem_calc(4.75rem+1px)),repeating-linear-gradient(0deg,transparent_0_1.7rem,color-mix(in_oklch,var(--text)_5%,transparent)_1.7rem_calc(1.7rem+1px)),radial-gradient(circle_at_18%_50%,oklch(0.18_0.026_250_/_0.35),transparent_22rem),radial-gradient(circle_at_82%_50%,oklch(0.15_0.034_190_/_0.24),transparent_20rem),var(--bg)]',
  'max-[640px]:bg-[linear-gradient(90deg,transparent_0,transparent_calc(var(--gutter)-1px),color-mix(in_oklch,var(--text)_10%,transparent)_var(--gutter),transparent_calc(var(--gutter)+1px)),repeating-linear-gradient(90deg,transparent_0_4.5rem,color-mix(in_oklch,var(--text)_5%,transparent)_4.5rem_calc(4.5rem+1px)),repeating-linear-gradient(0deg,transparent_0_1.5rem,color-mix(in_oklch,var(--text)_4%,transparent)_1.5rem_calc(1.5rem+1px)),var(--bg)]',
].join(' ');

export default function SectionSeparator({ label, meta }: SectionSeparatorProps) {
  return (
    <div
      className={`relative my-[clamp(1rem,2.2vw,1.35rem)] h-[clamp(5.25rem,9vw,8.5rem)] w-full overflow-hidden border-y border-[var(--border)] ${separatorBackground} before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_35%_35%,color-mix(in_oklch,var(--text)_8%,transparent),transparent_22rem)] before:opacity-30 before:content-[''] max-[640px]:my-[0.65rem] max-[640px]:h-12 max-[640px]:before:opacity-10`}
      aria-hidden="true"
    >
      <div className={`${landingPanelWidth} relative z-[1] flex h-full items-center justify-between gap-4 text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)] max-[640px]:text-[0.58rem] max-[640px]:tracking-[0.11em]`}>
        <span>{label}</span>
        {meta && <strong className="font-normal text-[color-mix(in_oklch,var(--text-2)_74%,transparent)] max-[640px]:hidden">{meta}</strong>}
      </div>
    </div>
  );
}
