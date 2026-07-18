import React from 'react';

type Props = {
  /** Short line under brand */
  label?: string;
  /** Full-screen fixed overlay (connect → drive) */
  overlay?: boolean;
  /** Slightly denser for gate success */
  variant?: 'default' | 'enter';
};

/**
 * Minimal brand loader — used for lazy route chunks + session handoff.
 * Intentionally quiet: mark, thin ring, one line of copy.
 */
export default function BrandLoader({
  label = 'Loading',
  overlay = false,
  variant = 'default',
}: Props) {
  return (
    <div
      className={`brand-loader ${overlay ? 'brand-loader--overlay' : ''} ${
        variant === 'enter' ? 'brand-loader--enter' : ''
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="brand-loader-inner">
        <div className="brand-loader-mark" aria-hidden="true">
          <span className="brand-loader-ring" />
          <span className="brand-loader-core">B</span>
        </div>
        <p className="brand-loader-label">{label}</p>
      </div>
    </div>
  );
}
