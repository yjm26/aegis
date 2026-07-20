import React, { useEffect, useRef, useState } from 'react';

export type DriveAction = {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

export type DriveActionMenuProps = {
  label?: string;
  actions: DriveAction[];
  /** Use for compact card menus where text labels crowd the surface. */
  iconOnly?: boolean;
  /** Use for list rows near the bottom so the menu opens upward. */
  align?: 'down' | 'up';
};

export default function DriveActionMenu({
  label = 'More',
  actions,
  iconOnly = false,
  align = 'down',
}: DriveActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!actions.length) return null;

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        className={
          iconOnly
            ? 'grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-black/25 text-[1.15rem] leading-none text-white/58 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-md transition-[border-color,background,color] duration-150 hover:border-white/24 hover:bg-white/[0.07] hover:text-white motion-reduce:transition-none'
            : 'min-w-11 border-0 bg-transparent px-1 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-white/50 transition hover:text-white'
        }
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {iconOnly ? <span aria-hidden="true">⋯</span> : label}
      </button>
      {open ? (
        <div
          className={`absolute right-0 z-50 min-w-40 border border-white/12 bg-[#0c0c0ef5] p-1 shadow-[0_18px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl ${
            align === 'up' ? 'bottom-[calc(100%+0.45rem)]' : 'top-[calc(100%+0.45rem)]'
          }`}
          role="menu"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              className={`w-full border-0 bg-transparent px-3 py-2 text-left text-[0.75rem] transition hover:bg-white/[0.055] hover:text-white ${
                action.tone === 'danger'
                  ? 'text-red-200/78'
                  : 'text-white/76'
              }`}
              disabled={action.disabled}
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
