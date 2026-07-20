import type { ReactNode } from 'react';

interface ChapterSectionProps {
  index: string;
  label: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  id?: string;
}

export const landingPanelWidth = 'mx-2 md:mx-8 2xl:mx-auto 2xl:max-w-[92rem]';

export default function ChapterSection({
  index,
  label,
  title,
  description,
  children,
  id,
}: ChapterSectionProps) {
  return (
    <section
      className={`${landingPanelWidth} mt-[clamp(1rem,2vw,1.25rem)] border border-[var(--border)] bg-[color-mix(in_oklch,var(--bg-elevated)_86%,transparent)] first:mt-0 first:border-t-[color-mix(in_oklch,var(--text)_18%,var(--border))]`}
      id={id}
    >
      {(title || description) && (
        <header className="grid min-h-[clamp(11rem,21vw,15rem)] grid-cols-[minmax(8rem,10rem)_minmax(0,1fr)] border-b border-[var(--border)] max-[820px]:grid-cols-1">
          <div className="flex flex-col justify-between gap-8 border-r border-[var(--border)] p-[clamp(1rem,2.3vw,1.35rem)] text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-3)] max-[820px]:min-h-0 max-[820px]:border-r-0 max-[820px]:border-b max-[640px]:flex-row max-[640px]:items-center max-[640px]:px-5 max-[640px]:py-[0.9rem]">
            <strong className="font-normal tabular-nums text-[var(--text-2)]">{index}</strong>
            <span>{label}</span>
          </div>
          <div className="grid content-end gap-5 p-[clamp(1.5rem,4vw,3rem)] max-[640px]:p-5">
            {title && (
              <h2 className="m-0 max-w-[52rem] text-[clamp(2rem,5.2vw,4.8rem)] font-light leading-[0.98] tracking-[-0.06em] text-[var(--text)] max-[640px]:text-[clamp(1.85rem,8vw,2.5rem)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="m-0 max-w-[42rem] text-[clamp(1rem,1.5vw,1.18rem)] leading-[1.65] text-[var(--text-2)] max-[640px]:text-[0.9rem]">
                {description}
              </p>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
