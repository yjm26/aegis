import { Link } from 'react-router-dom';
import LandingSections from './components/landing/LandingSections';
import AegisLogo from './components/shared/AegisLogo';
import PaperShader from './components/shared/PaperShader';

export default function Landing() {
  return (
    <div className="w-full overflow-x-hidden bg-[radial-gradient(circle_at_84%_37%,oklch(0.115_0_0_/_0.55),transparent_34rem),var(--bg)]">
      <nav className="fixed inset-x-0 top-0 z-[200] border-0 bg-transparent shadow-none backdrop-blur-none">
        <div className="flex w-full items-center justify-between px-6 py-5 md:px-10 lg:px-14 max-[640px]:px-5 max-[640px]:py-[0.95rem] max-[380px]:px-4 max-[380px]:py-[0.85rem]">
          <Link to="/" className="inline-flex items-center leading-none text-[var(--text)] no-underline" aria-label="Aegis home">
            <AegisLogo variant="horizontal" className="!w-[clamp(7.25rem,10vw,9.5rem)] max-[640px]:!w-[5.35rem]" />
          </Link>
          <Link
            to="/gate"
            className="text-[clamp(0.9rem,1.15vw,1.05rem)] font-normal uppercase tracking-[0.13em] text-[var(--text)] no-underline opacity-90 transition-opacity duration-150 hover:opacity-50 active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 max-[640px]:text-xs max-[640px]:tracking-[0.14em]"
          >
            GO TO APP
          </Link>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center overflow-hidden bg-[var(--bg)] px-6 pb-16 pt-24 md:px-10 lg:px-14 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[2] after:h-[clamp(7rem,18vh,12rem)] after:bg-[linear-gradient(180deg,transparent,var(--bg)_88%)] after:content-[''] max-[640px]:min-h-[88svh] max-[640px]:items-end max-[640px]:px-5 max-[640px]:pb-10 max-[640px]:pt-[5.25rem] max-[380px]:px-4">
        <div className="pointer-events-none absolute inset-0 z-0">
          <PaperShader />
        </div>
        <div className="relative z-10 max-w-[42rem] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.75)] max-[640px]:max-w-full max-[640px]:pb-2">
          <h1 className="mb-6 text-[clamp(2.75rem,8vw,5.75rem)] font-light leading-[0.98] tracking-[-0.035em] max-[640px]:mb-[1.1rem] max-[640px]:text-[clamp(2.35rem,11.5vw,3.25rem)] max-[640px]:tracking-[-0.03em] max-[380px]:text-[2.15rem]">
            <span className="block">Your files.</span>
            <span className="block text-[oklch(0.55_0_0)]">Encrypted first.</span>
            <span className="block">On Shelby.</span>
          </h1>
          <p className="mb-9 max-w-md text-[1.05rem] font-light leading-[1.55] text-[oklch(0.78_0_0)] max-[640px]:mb-7 max-[640px]:max-w-full max-[640px]:text-[0.95rem]">
            Client-side AES drive on Shelby Protocol. Ciphertext on the network;
            keys wrapped by your wallet.
          </p>
          <div className="flex flex-wrap items-center gap-7 max-[640px]:w-full max-[640px]:max-w-80 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3">
            <Link
              to="/gate"
              className="inline-block bg-[var(--text)] px-6 py-[0.85rem] text-xs font-normal uppercase tracking-[0.12em] text-[var(--bg)] no-underline transition-opacity duration-150 hover:opacity-85 active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 max-[640px]:w-full max-[640px]:px-5 max-[640px]:py-[0.95rem] max-[640px]:text-center"
            >
              Enter the App
            </Link>
            <a
              href="#principles"
              className="border-b border-[var(--border)] pb-0.5 text-xs font-normal uppercase tracking-[0.12em] text-[var(--text-2)] no-underline transition-colors duration-150 hover:border-[var(--text-2)] hover:text-[var(--text)] motion-reduce:transition-none max-[640px]:border-b-0 max-[640px]:py-2 max-[640px]:text-center max-[640px]:opacity-80"
            >
              Read more
            </a>
          </div>
        </div>
      </section>

      <LandingSections />

      <footer className="mx-2 border-t border-[var(--border)] px-6 pb-10 pt-8 text-[0.6875rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)] md:mx-8 md:px-10 lg:px-14 2xl:mx-auto 2xl:max-w-[92rem] max-[640px]:px-5 max-[640px]:pb-8 max-[640px]:pt-6 max-[640px]:text-[0.625rem]">
        <span>Built on Shelby Protocol · not a security audit</span>
      </footer>
    </div>
  );
}
