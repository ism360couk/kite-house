import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '#spaces', label: 'Spaces' },
  { href: '#heritage', label: '2012 Heritage' },
  { href: '#portland', label: 'Portland' },
  { href: '#availability', label: 'Availability' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-slate-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#top"
          className="font-editorial text-xl font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          Kite House
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action (+ mobile menu button on small viewports) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#availability"
            className="hidden sm:inline-flex items-center justify-center rounded-md bg-[#0E1C2F] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Check Dates
          </a>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 md:hidden hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 text-base font-medium text-slate-700 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#availability"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-md bg-[#0E1C2F] px-4 py-2.5 text-sm font-medium text-white"
            >
              Check Dates
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
