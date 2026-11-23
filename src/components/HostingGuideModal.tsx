import { Globe, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_BOOKING_EMAIL } from '../utils/ical';

interface HostingGuideModalProps {
  open: boolean;
  onClose: () => void;
  recipientEmail: string;
  onUpdateRecipientEmail: (email: string) => void;
}

export function HostingGuideModal({
  open,
  onClose,
  recipientEmail,
  onUpdateRecipientEmail,
}: HostingGuideModalProps) {
  const [emailInput, setEmailInput] = useState(recipientEmail);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setEmailInput(recipientEmail);
  }, [recipientEmail]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim() || DEFAULT_BOOKING_EMAIL;
    onUpdateRecipientEmail(trimmed);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hosting-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h2
              id="hosting-guide-title"
              className="font-editorial text-xl font-medium text-slate-900"
            >
              GitHub Pages &amp; Custom Domain Setup
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close setup guide"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-900">1. Deploy free on GitHub Pages</h3>
            <p className="mt-1">
              Push this project to a repository on your GitHub account, then open{' '}
              <span className="font-medium text-slate-800">
                Settings → Pages → Build and deployment
              </span>{' '}
              and choose <span className="font-medium text-slate-800">GitHub Actions</span>. The
              included workflow refreshes your Airbnb iCal calendar automatically every 2 hours and
              publishes the static site.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              2. Connect <span className="font-mono text-xs">www.kite-house.co.uk</span>
            </h3>
            <p className="mt-1">
              A <span className="font-mono text-xs text-slate-800">public/CNAME</span> file for{' '}
              <span className="font-mono text-xs text-slate-800">www.kite-house.co.uk</span> is
              already included. At your UK domain registrar, set a{' '}
              <span className="font-mono text-xs text-slate-800">CNAME</span> record for{' '}
              <span className="font-mono text-xs text-slate-800">www</span> pointing to{' '}
              <span className="font-mono text-xs text-slate-800">
                &lt;your-github-username&gt;.github.io
              </span>
              , and enable <span className="font-medium text-slate-800">Enforce HTTPS</span> in
              GitHub Pages settings.
            </p>
          </div>

          <form
            onSubmit={handleSaveEmail}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <label
              htmlFor="owner-email-override"
              className="block text-xs font-semibold text-slate-800"
            >
              Booking Enquiry Recipient Email (Browser Preview)
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Default is <span className="font-mono">{DEFAULT_BOOKING_EMAIL}</span>. Update this
              anytime in <span className="font-mono">src/utils/ical.ts</span> before pushing to
              GitHub.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                id="owner-email-override"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
              />
              <button
                type="submit"
                className="rounded-md bg-[#0E1C2F] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Save Preview Email
              </button>
            </div>
            {savedNotice && (
              <p className="mt-2 text-xs font-medium text-blue-700">
                Recipient email updated for this session.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
