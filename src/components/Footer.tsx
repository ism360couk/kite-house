import { ExternalLink } from 'lucide-react';
import { AIRBNB_LISTING_URL } from '../utils/ical';

interface FooterProps {
  recipientEmail: string;
  onOpenHostingGuide: () => void;
}

export function Footer({ recipientEmail, onOpenHostingGuide }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-editorial text-lg font-semibold text-slate-900">Kite House</div>
          <p className="mt-1 text-xs text-slate-500">
            <span>Officer&apos;s Field, Isle of Portland, Dorset DT5</span>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span>www.kite-house.co.uk</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
          <a
            href={`mailto:${recipientEmail}`}
            className="hover:text-slate-900 hover:underline underline-offset-4"
          >
            {recipientEmail}
          </a>
          <a
            href={AIRBNB_LISTING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-slate-900 hover:underline underline-offset-4"
          >
            Airbnb Listing
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onOpenHostingGuide}
            className="text-slate-600 hover:text-slate-900 hover:underline underline-offset-4"
          >
            GitHub Pages Setup
          </button>
        </div>
      </div>
    </footer>
  );
}
