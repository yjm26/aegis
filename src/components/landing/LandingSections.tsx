import { Link } from 'react-router-dom';
import ChapterSection, { landingPanelWidth } from './ChapterSection';
import SectionSeparator from './SectionSeparator';

const labelClass = 'block text-[0.65rem] font-normal uppercase tracking-[0.12em] tabular-nums text-[var(--text-3)]';
const bodyClass = 'm-0 leading-[1.65] text-[var(--text-2)] max-[640px]:text-[0.9rem]';
const cardBase = 'flex min-h-56 flex-col justify-between gap-8 border-r border-b border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--text)_3%,transparent),transparent)] p-[clamp(1rem,2.4vw,1.7rem)] max-[900px]:col-span-12 max-[900px]:min-h-0 max-[900px]:border-r-0';
const cardTitle = 'm-0 text-[clamp(1.25rem,2vw,1.75rem)] font-light leading-[1.05] tracking-[-0.04em] text-current';
const cardText = `${bodyClass} mt-3 max-w-[36ch] text-[0.95rem]`;

const proofCells = [
  ['Before network', 'AES-256-GCM'],
  ['Storage layer', 'Shelby blobs'],
  ['Access model', 'Fragment keys'],
];

const principles = [
  {
    label: '01 / Client',
    title: 'Encrypt first',
    text: 'The browser generates the file key and encrypts bytes before upload. Shelby receives ciphertext only.',
    className: 'col-span-6 min-h-[17rem] bg-[radial-gradient(circle_at_12%_0%,oklch(0.32_0.035_250_/_0.38),transparent_18rem),linear-gradient(135deg,oklch(0.12_0.018_250),oklch(0.075_0_0))]',
  },
  {
    label: '02 / Vault',
    title: 'Wrap keys',
    text: 'Library metadata can sync while raw DEKs stay wrapped by the wallet-derived vault key.',
    className: 'col-span-3 bg-[radial-gradient(circle_at_100%_0%,oklch(0.34_0.05_190_/_0.42),transparent_15rem),linear-gradient(135deg,oklch(0.18_0.04_190),oklch(0.095_0.012_190))] text-[oklch(0.96_0.03_190)] [&_p]:text-[color-mix(in_oklch,currentColor_72%,transparent)]',
  },
  {
    label: '03 / Share',
    title: 'Live capability folders',
    text: 'Folder links use a folder key in the URL fragment. New files appear without regenerating the link.',
    className: 'col-span-3 min-h-[30rem] bg-[radial-gradient(circle_at_80%_14%,oklch(0.28_0.05_285_/_0.34),transparent_16rem),linear-gradient(135deg,oklch(0.12_0.02_285),oklch(0.07_0_0))]',
  },
  {
    label: '04 / Recover',
    title: 'Readable states',
    text: 'Errors, empty folders, and revoked shares explain what happened without exposing secrets.',
    className: 'col-span-3 min-h-64 bg-[radial-gradient(circle_at_0%_100%,oklch(0.28_0.045_90_/_0.28),transparent_14rem),linear-gradient(135deg,oklch(0.13_0.022_85),oklch(0.075_0_0))]',
  },
];

const flowSteps = [
  {
    number: '01',
    title: 'Drop',
    text: 'Generate a random file key, encrypt locally, and prepare a preview without uploading plaintext.',
  },
  {
    number: '02',
    title: 'Store',
    text: 'Upload encrypted bytes to Shelby through the app gateway. Save only wrapped metadata.',
  },
  {
    number: '03',
    title: 'Share',
    text: 'Issue a capability link for a file or a live folder. Recipients decrypt in the browser.',
  },
];

const faqItems = [
  {
    question: 'Can Aegis read my files?',
    answer:
      'No. Stored files are encrypted before upload. Public live folder APIs return encrypted key wraps, not raw keys.',
    open: true,
  },
  {
    question: 'What makes folder shares live?',
    answer:
      'A folder key wraps every file key in that folder. The link stays stable while the public index changes.',
  },
  {
    question: 'What happens if I revoke a link?',
    answer:
      'The public share row returns gone, so the link can no longer resolve the current folder index.',
  },
];

export default function LandingSections() {
  return (
    <main className="relative mx-auto w-full bg-[linear-gradient(90deg,transparent_calc(var(--gutter)-1px),var(--border)_var(--gutter),transparent_calc(var(--gutter)+1px)),linear-gradient(90deg,transparent_calc(100%-var(--gutter)-1px),var(--border)_calc(100%-var(--gutter)),transparent_calc(100%-var(--gutter)+1px)),linear-gradient(180deg,var(--border),transparent_1px)] pb-[clamp(5rem,10vw,7rem)] max-[640px]:bg-[linear-gradient(90deg,transparent_0,transparent_calc(var(--gutter)-1px),var(--border)_var(--gutter),transparent_calc(var(--gutter)+1px)),linear-gradient(180deg,var(--border),transparent_1px)] max-[640px]:pb-16">
      <ChapterSection
        index="01"
        label="Why it exists"
        title="Private storage should feel like a product, not a warning label."
        description="Aegis encrypts in the browser first, stores ciphertext on Shelby, and keeps sharing as a capability. The interface explains the model without turning privacy into homework."
      >
        <div className="grid grid-cols-3 border-t border-[var(--border)] max-[820px]:grid-cols-1">
          {proofCells.map(([label, value], index) => (
            <div className="border-r border-[var(--border)] p-[clamp(1rem,2.4vw,1.25rem)] last:border-r-0 max-[820px]:border-r-0 max-[820px]:border-b max-[820px]:last:border-b-0" key={label}>
              <span className={`${labelClass} mb-2.5`}>{label}</span>
              <strong className="block text-[clamp(1.05rem,2.2vw,1.4rem)] font-light tracking-[-0.04em] text-[var(--text)]">
                {value}
              </strong>
            </div>
          ))}
        </div>
      </ChapterSection>

      <SectionSeparator label="Cipher ledger" meta="Client / Vault / Share" />

      <ChapterSection
        index="02"
        label="Principles"
        id="principles"
        title="Every object has a boundary."
        description="Files, metadata, folders, and shares are treated as separate surfaces. Each card maps to a real security boundary."
      >
        <div className="grid grid-cols-12">
          {principles.map((principle) => (
            <article className={`${cardBase} ${principle.className}`} key={principle.label}>
              <span className={labelClass}>{principle.label}</span>
              <div>
                <h3 className={cardTitle}>{principle.title}</h3>
                <p className={cardText}>{principle.text}</p>
              </div>
            </article>
          ))}
          <article className={`${cardBase} col-span-9 min-h-64 bg-[linear-gradient(90deg,oklch(0.10_0.014_250),oklch(0.11_0.012_210),oklch(0.10_0.018_285))] max-[900px]:col-span-12`} aria-label="Security boundary map">
            <span className={labelClass}>Boundary map</span>
            <div className="flex items-center gap-[clamp(0.75rem,2vw,1.25rem)] text-[clamp(1.1rem,2.3vw,1.65rem)] font-light tracking-[-0.04em] text-[var(--text)] max-[640px]:flex-col max-[640px]:items-stretch">
              <span className="border border-[color-mix(in_oklch,var(--text)_18%,transparent)] bg-[color-mix(in_oklch,var(--text)_6%,transparent)] px-3 py-2.5">Client</span>
              <i className="relative block h-px min-w-8 flex-1 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--text)_18%,transparent),color-mix(in_oklch,var(--text)_58%,transparent))] after:absolute after:right-0 after:top-1/2 after:h-[0.42rem] after:w-[0.42rem] after:-translate-y-1/2 after:rotate-45 after:border-r after:border-t after:border-[color-mix(in_oklch,var(--text)_58%,transparent)] after:content-[''] max-[640px]:ml-4 max-[640px]:h-7 max-[640px]:min-w-0 max-[640px]:flex-none max-[640px]:bg-[linear-gradient(180deg,color-mix(in_oklch,var(--text)_12%,transparent),color-mix(in_oklch,var(--text)_42%,transparent))] max-[640px]:after:bottom-0 max-[640px]:after:left-1/2 max-[640px]:after:right-auto max-[640px]:after:top-auto max-[640px]:after:-translate-x-1/2 max-[640px]:after:translate-y-0 max-[640px]:after:rotate-[135deg]" />
              <span className="border border-[color-mix(in_oklch,var(--text)_18%,transparent)] bg-[color-mix(in_oklch,var(--text)_6%,transparent)] px-3 py-2.5">Vault</span>
              <i className="relative block h-px min-w-8 flex-1 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--text)_18%,transparent),color-mix(in_oklch,var(--text)_58%,transparent))] after:absolute after:right-0 after:top-1/2 after:h-[0.42rem] after:w-[0.42rem] after:-translate-y-1/2 after:rotate-45 after:border-r after:border-t after:border-[color-mix(in_oklch,var(--text)_58%,transparent)] after:content-[''] max-[640px]:ml-4 max-[640px]:h-7 max-[640px]:min-w-0 max-[640px]:flex-none max-[640px]:bg-[linear-gradient(180deg,color-mix(in_oklch,var(--text)_12%,transparent),color-mix(in_oklch,var(--text)_42%,transparent))] max-[640px]:after:bottom-0 max-[640px]:after:left-1/2 max-[640px]:after:right-auto max-[640px]:after:top-auto max-[640px]:after:-translate-x-1/2 max-[640px]:after:translate-y-0 max-[640px]:after:rotate-[135deg]" />
              <span className="border border-[color-mix(in_oklch,var(--text)_18%,transparent)] bg-[color-mix(in_oklch,var(--text)_6%,transparent)] px-3 py-2.5">Share</span>
            </div>
            <p className={cardText}>Plain files become encrypted objects, then wrapped capabilities.</p>
          </article>
          <article className={`${cardBase} col-span-12 min-h-48 border-r-0 bg-[radial-gradient(circle_at_88%_50%,oklch(0.24_0.055_28_/_0.22),transparent_18rem),linear-gradient(135deg,oklch(0.095_0.012_28),oklch(0.065_0_0))]`}>
            <span className={labelClass}>System rule</span>
            <div>
              <h3 className="m-0 max-w-[48rem] text-[clamp(1.55rem,3.2vw,3rem)] font-light leading-[1.05] tracking-[-0.04em] text-current">
                No plaintext crosses the API for storage.
              </h3>
              <p className={`${bodyClass} mt-3 max-w-[42rem]`}>
                Public share APIs return only storage coordinates and encrypted key wraps. The browser owns decrypt.
              </p>
            </div>
          </article>
        </div>
      </ChapterSection>

      <SectionSeparator label="Storage path" meta="Drop / Store / Share" />

      <ChapterSection index="03" label="Flow" id="flow" title="Drop, store, share. Each step is visible.">
        <div className="grid grid-cols-3 max-[820px]:grid-cols-1">
          {flowSteps.map((step) => (
            <article className="flex min-h-72 flex-col justify-between gap-8 border-r border-[var(--border)] p-[clamp(1.2rem,2.8vw,1.6rem)] last:border-r-0 max-[820px]:border-r-0 max-[820px]:border-b max-[820px]:last:border-b-0" key={step.number}>
              <span className="text-[0.7rem] tracking-[0.16em] tabular-nums text-[var(--text-3)]">{step.number}</span>
              <div>
                <h3 className="m-0 text-[clamp(1.6rem,3vw,2.6rem)] font-light leading-none tracking-[-0.04em] text-current">
                  {step.title}
                </h3>
                <p className={`${bodyClass} mt-3 max-w-[26rem]`}>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </ChapterSection>

      <SectionSeparator label="Plain terms" meta="FAQ / Revoke / Recover" />

      <section className={`${landingPanelWidth} mt-[clamp(1rem,2vw,1.25rem)] border border-[var(--border)] bg-[color-mix(in_oklch,var(--bg-elevated)_86%,transparent)]`} id="details">
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] max-[820px]:grid-cols-1">
          <aside className="flex min-h-96 flex-col justify-between gap-8 border-r border-[var(--border)] bg-[oklch(0.095_0.015_250)] p-[clamp(1.5rem,3vw,2.2rem)] max-[820px]:min-h-0 max-[820px]:border-r-0 max-[820px]:border-b">
            <div>
              <span className={labelClass}>04 / Details</span>
              <h2 className="m-0 mt-4 text-[clamp(2rem,4vw,3.6rem)] font-light leading-none tracking-[-0.06em] text-[var(--text)]">
                Privacy model, in plain terms.
              </h2>
            </div>
            <p className={`${bodyClass} max-w-[34ch]`}>
              The API can coordinate pointers and wrapped keys. It does not receive the key needed to read your files.
            </p>
          </aside>
          <div>
            {faqItems.map((item) => (
              <details className="group border-b border-[var(--border)]" open={item.open} key={item.question}>
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 px-[1.4rem] py-5 text-base font-light tracking-[-0.01em] text-[var(--text)] transition-colors duration-150 hover:text-[var(--text-2)] marker:hidden [&::-webkit-details-marker]:hidden max-[640px]:items-center max-[640px]:px-[1.1rem] max-[640px]:py-[1.15rem] max-[640px]:text-[0.95rem]">
                  <span>{item.question}</span>
                  <span className="shrink-0 text-[var(--text-3)] group-open:hidden">+</span>
                  <span className="hidden shrink-0 text-[var(--text-3)] group-open:inline">−</span>
                </summary>
                <p className={`${bodyClass} max-w-[44rem] px-[1.4rem] pb-[1.4rem] text-[0.9375rem] max-[640px]:px-[1.1rem] max-[640px]:pb-5`}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={`${landingPanelWidth} mt-[clamp(1rem,2vw,1.25rem)] grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 border border-[var(--border)] bg-[linear-gradient(135deg,oklch(0.12_0.015_240),var(--bg-elevated))] p-[clamp(2rem,6vw,5rem)] max-[820px]:grid-cols-1`}>
        <h2 className="m-0 text-[clamp(2.4rem,6vw,5rem)] font-light leading-[0.98] tracking-[-0.06em] text-[var(--text)]">
          Your files.
          <br />
          Encrypted first.
        </h2>
        <Link
          to="/gate"
          className="inline-block whitespace-nowrap bg-[var(--text)] px-[1.4rem] py-[0.9rem] text-xs font-normal uppercase tracking-[0.12em] text-[var(--bg)] no-underline transition-opacity duration-150 hover:opacity-85 motion-reduce:transition-none max-[820px]:w-fit max-[640px]:w-full max-[640px]:max-w-80 max-[640px]:text-center"
        >
          Enter the App
        </Link>
      </section>
    </main>
  );
}
