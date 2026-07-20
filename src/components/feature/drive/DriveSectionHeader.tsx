import React from 'react';

type Props = {
  id?: string;
  title: string;
  description?: string;
  count?: number;
  actions?: React.ReactNode;
};

export default function DriveSectionHeader({
  id,
  title,
  description,
  count,
  actions,
}: Props) {
  return (
    <div className="mt-2 flex items-end justify-between gap-4 max-[560px]:flex-col max-[560px]:items-start">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2
            id={id}
            className="m-0 text-[0.82rem] font-normal uppercase tracking-[0.12em] text-white/78"
            aria-level={2}
          >
            {title}
          </h2>
          {typeof count === 'number' ? (
            <span className="rounded-full border border-white/10 bg-white/[0.025] px-2 py-0.5 text-[0.65rem] text-white/45">
              {count}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="m-0 mt-1 text-[0.76rem] leading-[1.45] text-white/45">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0 max-[560px]:w-full">{actions}</div> : null}
    </div>
  );
}
