import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  AIRBNB_ICAL_URL,
  AIRBNB_LISTING_URL,
  DEFAULT_BOOKING_EMAIL,
  MIN_STAY_NIGHTS,
  NightStatus,
  addDaysIso,
  buildBookingEnquiry,
  findNextAvailableWindow,
  formatDisplayDate,
  formatShortDate,
  getBlockedDateMap,
  getMonthCalendarDays,
  getMonthLabel,
  isRangeAvailable,
  parseIcalEvents,
} from '../utils/ical';

interface AvailabilityBookingSectionProps {
  recipientEmail: string;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayUtcIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(year: number, monthZeroIndexed: number, delta: number) {
  const dt = new Date(Date.UTC(year, monthZeroIndexed + delta, 1));
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth(),
  };
}

export function AvailabilityBookingSection({
  recipientEmail,
}: AvailabilityBookingSectionProps) {
  const todayIso = useMemo(() => getTodayUtcIso(), []);
  const initialYear = Number(todayIso.slice(0, 4));
  const initialMonth = Number(todayIso.slice(5, 7)) - 1;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  const [blockedMap, setBlockedMap] = useState<Map<string, NightStatus>>(() => new Map());
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [refreshingLive, setRefreshingLive] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Loading Airbnb calendar availability...');
  const [syncError, setSyncError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectionHint, setSelectionHint] = useState<string | null>(null);

  const [guests, setGuests] = useState(4);
  const [extraGuestsRequested, setExtraGuestsRequested] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<ReturnType<
    typeof buildBookingEnquiry
  > | null>(null);
  const [copied, setCopied] = useState(false);

  // Load bundled sanitized Airbnb iCal snapshot cleanly on mount
  useEffect(() => {
    let active = true;
    async function loadBundledCalendar() {
      try {
        const res = await fetch('./availability.ics');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const raw = await res.text();
        const events = parseIcalEvents(raw);
        const map = getBlockedDateMap(events);
        if (!active) return;
        setBlockedMap(map);
        setSyncMessage(`Synced from Airbnb iCal (${events.length} calendar blocks loaded)`);
        setSyncError(null);
      } catch {
        if (!active) return;
        setSyncError('Could not load local availability snapshot. Please verify dates by email.');
        setSyncMessage('Calendar unavailable');
      } finally {
        if (active) setCalendarLoading(false);
      }
    }
    void loadBundledCalendar();
    return () => {
      active = false;
    };
  }, []);

  async function handleRefreshLiveFeed() {
    setRefreshingLive(true);
    setSyncError(null);
    try {
      const relayUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(AIRBNB_ICAL_URL)}`;
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 5000);
      const res = await fetch(relayUrl, { signal: controller.signal });
      window.clearTimeout(timer);
      if (!res.ok) {
        throw new Error('Live feed unreachable');
      }
      const raw = await res.text();
      if (!raw.includes('BEGIN:VCALENDAR')) {
        throw new Error('Invalid iCalendar response');
      }
      const events = parseIcalEvents(raw);
      setBlockedMap(getBlockedDateMap(events));
      setSyncMessage(`Live Airbnb feed refreshed (${events.length} calendar blocks)`);
    } catch {
      setSyncMessage('Showing latest synced Airbnb schedule (live relay offline in this network)');
    } finally {
      setRefreshingLive(false);
    }
  }

  const rangeValidation = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return isRangeAvailable(checkIn, checkOut, blockedMap, MIN_STAY_NIGHTS, todayIso);
  }, [checkIn, checkOut, blockedMap, todayIso]);

  function handleDayClick(iso: string) {
    setSelectionHint(null);
    setSubmittedEnquiry(null);
    const isPast = iso < todayIso;
    if (isPast) return;

    const isNightBlocked = blockedMap.has(iso);

    // Starting a new selection
    if (!checkIn || (checkIn && checkOut)) {
      if (isNightBlocked) {
        setSelectionHint(
          `${formatShortDate(iso)} is unavailable for check-in. Choose an open date.`
        );
        return;
      }
      setCheckIn(iso);
      setCheckOut('');
      return;
    }

    // Clicking earlier or same date restarts check-in
    if (iso <= checkIn) {
      if (isNightBlocked) {
        setSelectionHint(`${formatShortDate(iso)} is unavailable for check-in.`);
        return;
      }
      setCheckIn(iso);
      setCheckOut('');
      return;
    }

    // Validating candidate check-out (allows same-day turnover even if iso is blocked!)
    const check = isRangeAvailable(checkIn, iso, blockedMap, MIN_STAY_NIGHTS, todayIso);
    if (!check.valid) {
      setSelectionHint(check.reason ?? 'Selected range is not available.');
      return;
    }

    setCheckOut(iso);
  }

  function handleJumpToNextAvailable() {
    setSelectionHint(null);
    setSubmittedEnquiry(null);
    const win = findNextAvailableWindow(blockedMap, todayIso, MIN_STAY_NIGHTS, 420);
    if (!win) {
      setSelectionHint('No open 2-night windows found in the next 12 months.');
      return;
    }
    const y = Number(win.checkIn.slice(0, 4));
    const m = Number(win.checkIn.slice(5, 7)) - 1;
    setViewYear(y);
    setViewMonth(m);
    setCheckIn(win.checkIn);
    setCheckOut(win.checkOut);
  }

  function handleJumpToSummer() {
    setSelectionHint(null);
    setViewYear(2027);
    setViewMonth(5); // June 2027 (0-indexed)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];

    const range = isRangeAvailable(checkIn, checkOut, blockedMap, MIN_STAY_NIGHTS, todayIso);
    if (!range.valid) {
      errors.push(range.reason ?? 'Please choose an available check-in and check-out date.');
    }

    if (guestName.trim().length < 2) {
      errors.push('Please enter your full name.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.push('Please enter a valid email address so we can reply.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    const formatted = buildBookingEnquiry({
      recipientEmail: recipientEmail || DEFAULT_BOOKING_EMAIL,
      checkIn,
      checkOut,
      nights: range.nights,
      guests,
      extraGuestsRequested,
      guestName,
      guestEmail,
      guestPhone,
      notes,
    });
    setSubmittedEnquiry(formatted);
    setCopied(false);
  }

  async function handleCopyEnquiry() {
    if (!submittedEnquiry) return;
    const text = `To: ${submittedEnquiry.recipientEmail}\nSubject: ${submittedEnquiry.subject}\n\n${submittedEnquiry.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  }

  const secondMonth = addMonths(viewYear, viewMonth, 1);
  const monthsToRender = [
    { year: viewYear, month: viewMonth },
    { year: secondMonth.year, month: secondMonth.month },
  ];

  const canGoPrev =
    viewYear > initialYear || (viewYear === initialYear && viewMonth > initialMonth);

  return (
    <section id="availability" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="font-mono text-xs font-medium text-amber-800">
              03. Availability &amp; Direct Booking
            </p>
            <h2 className="mt-2 font-editorial text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl text-balance">
              Live Airbnb calendar and direct email enquiry
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={handleJumpToNextAvailable}
              className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-700 hover:text-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Next Available Dates
            </button>
            <button
              type="button"
              onClick={handleJumpToSummer}
              className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-700 hover:text-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Summer 2027
            </button>
            <button
              type="button"
              onClick={handleRefreshLiveFeed}
              disabled={refreshingLive}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshingLive ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {refreshingLive ? 'Refreshing...' : 'Refresh Live Feed'}
            </button>
          </div>
        </div>

        {/* Sync status bar (accessible icon + text, never hue-only or pulsing dot) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
            <span>{syncError ?? syncMessage}</span>
          </div>
          <span className="font-mono text-slate-500">
            Minimum stay: {MIN_STAY_NIGHTS} nights · Check-in 15:00 · Check-out 10:00
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          {/* Left: Two-month interactive iCal calendar */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoPrev}
                onClick={() => {
                  const prev = addMonths(viewYear, viewMonth, -1);
                  setViewYear(prev.year);
                  setViewMonth(prev.month);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-sm font-semibold text-slate-900">
                {getMonthLabel(viewYear, viewMonth)} —{' '}
                {getMonthLabel(secondMonth.year, secondMonth.month)}
              </div>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => {
                  const next = addMonths(viewYear, viewMonth, 1);
                  setViewYear(next.year);
                  setViewMonth(next.month);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {calendarLoading ? (
              <div className="py-20 text-center text-sm text-slate-500">
                Loading Airbnb availability calendar...
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2">
                {monthsToRender.map(({ year, month }) => {
                  const days = getMonthCalendarDays(year, month);
                  const monthTitle = getMonthLabel(year, month);
                  return (
                    <div key={`${year}-${month}`}>
                      <h3 className="mb-3 text-center text-sm font-semibold text-slate-900">
                        {monthTitle}
                      </h3>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500">
                        {WEEKDAY_LABELS.map((wd) => (
                          <div key={wd} className="py-1">
                            {wd}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 grid grid-cols-7 gap-1">
                        {days.map((cell) => {
                          if (!cell.inMonth) {
                            return <div key={cell.iso} className="h-10" aria-hidden="true" />;
                          }

                          const isPast = cell.iso < todayIso;
                          const nightStatus = blockedMap.get(cell.iso);
                          const isSelectedStart = cell.iso === checkIn;
                          const isSelectedEnd = cell.iso === checkOut;
                          const isInRange =
                            Boolean(checkIn && checkOut) &&
                            cell.iso > checkIn &&
                            cell.iso < checkOut;

                          // Allow selecting a blocked date ONLY as checkout morning if user already picked check-in
                          const canActAsCheckout =
                            Boolean(checkIn && !checkOut && cell.iso > checkIn) &&
                            isRangeAvailable(
                              checkIn,
                              cell.iso,
                              blockedMap,
                              MIN_STAY_NIGHTS,
                              todayIso
                            ).valid;

                          const isDisabled = isPast || (Boolean(nightStatus) && !canActAsCheckout);

                          const stateWord = isSelectedStart
                            ? 'Selected check-in'
                            : isSelectedEnd
                              ? 'Selected check-out'
                              : isInRange
                                ? 'Selected stay'
                                : isPast
                                  ? 'Past date'
                                  : nightStatus === 'reserved'
                                    ? 'Reserved'
                                    : nightStatus === 'blocked'
                                      ? 'Unavailable'
                                      : 'Available';

                          let cellClasses =
                            'bg-white text-slate-900 border border-slate-200 hover:border-blue-700 hover:text-blue-700';

                          if (isSelectedStart || isSelectedEnd) {
                            cellClasses =
                              'bg-blue-700 text-white border border-blue-700 font-semibold';
                          } else if (isInRange) {
                            cellClasses =
                              'bg-blue-50 text-blue-900 border border-blue-200 font-medium';
                          } else if (isPast) {
                            cellClasses =
                              'bg-transparent text-slate-300 border border-transparent cursor-not-allowed';
                          } else if (nightStatus && !canActAsCheckout) {
                            cellClasses =
                              'bg-slate-200/75 text-slate-500 border border-slate-200 line-through cursor-not-allowed';
                          } else if (nightStatus && canActAsCheckout) {
                            cellClasses =
                              'bg-white text-slate-800 border border-dashed border-blue-500 hover:bg-blue-50';
                          }

                          return (
                            <button
                              key={cell.iso}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => handleDayClick(cell.iso)}
                              aria-label={`${formatDisplayDate(cell.iso)}, ${stateWord}`}
                              aria-pressed={isSelectedStart || isSelectedEnd}
                              className={`flex h-10 w-full items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 ${cellClasses}`}
                            >
                              {cell.dayNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline calendar feedback */}
            {selectionHint && (
              <p
                role="status"
                className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900"
              >
                {selectionHint}
              </p>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" />
                  Available
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-blue-700" />
                  Selected stay
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded border border-slate-200 bg-slate-200" />
                  Booked / Unavailable
                </span>
              </div>
              {(checkIn || checkOut) && (
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn('');
                    setCheckOut('');
                    setSelectionHint(null);
                    setSubmittedEnquiry(null);
                  }}
                  className="text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          {/* Right: Direct Email Booking Enquiry Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 lg:col-span-5">
            {submittedEnquiry ? (
              <div className="space-y-5" data-testid="enquiry-confirmation">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-editorial text-xl font-medium text-slate-900">
                      Your booking enquiry is ready to send
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Open your email app below or copy the message into webmail to send directly to
                      the owners.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div className="font-medium text-slate-500">To</div>
                  <div className="mt-0.5 font-mono text-slate-900">
                    {submittedEnquiry.recipientEmail}
                  </div>
                  <div className="mt-3 font-medium text-slate-500">Subject</div>
                  <div className="mt-0.5 font-medium text-slate-900">
                    {submittedEnquiry.subject}
                  </div>
                  <div className="mt-3 font-medium text-slate-500">Message</div>
                  <pre className="mt-1 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700">
                    {submittedEnquiry.body}
                  </pre>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={submittedEnquiry.mailtoHref}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Open in Email App
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEnquiry}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {copied ? 'Copied to clipboard' : 'Copy Enquiry Text'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedEnquiry(null)}
                  className="text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900"
                >
                  Edit dates or guest details
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <h3 className="font-editorial text-2xl font-medium text-slate-900">
                    Enquire to book direct
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    No platform booking fees. Select dates on the calendar or enter them below.
                  </p>
                </div>

                {/* Selected Date Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="enquiry-checkin"
                      className="block text-xs font-medium text-slate-700"
                    >
                      Check-in
                    </label>
                    <input
                      id="enquiry-checkin"
                      type="date"
                      min={todayIso}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        setSelectionHint(null);
                      }}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="enquiry-checkout"
                      className="block text-xs font-medium text-slate-700"
                    >
                      Check-out
                    </label>
                    <input
                      id="enquiry-checkout"
                      type="date"
                      min={checkIn ? addDaysIso(checkIn, 1) : addDaysIso(todayIso, 1)}
                      value={checkOut}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        setSelectionHint(null);
                      }}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                    />
                  </div>
                </div>

                {rangeValidation && (
                  <div
                    role="status"
                    className={`rounded-md border px-3 py-2 text-xs ${
                      rangeValidation.valid
                        ? 'border-blue-200 bg-blue-50 text-blue-900'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {rangeValidation.valid
                      ? `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)} · ${rangeValidation.nights} nights available`
                      : rangeValidation.reason}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="enquiry-guests"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Guests
                  </label>
                  <select
                    id="enquiry-guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={extraGuestsRequested}
                      onChange={(e) => setExtraGuestsRequested(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                    />
                    <span>Request up to 2 additional guests (9 total on prior approval)</span>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="enquiry-name"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="enquiry-name"
                    type="text"
                    required
                    placeholder="e.g. Claire Bennett"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-xs font-medium text-slate-700"
                    >
                      Your email
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      required
                      placeholder="you@example.co.uk"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-xs font-medium text-slate-700"
                    >
                      Phone (optional)
                    </label>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      placeholder="+44 7700 900000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="enquiry-notes"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Questions or trip notes (optional)
                  </label>
                  <textarea
                    id="enquiry-notes"
                    rows={3}
                    placeholder="Bringing sailing kit, bikes, or requesting late arrival..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  />
                </div>

                {formErrors.length > 0 && (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
                  >
                    <ul className="list-disc space-y-1 pl-4">
                      {formErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0E1C2F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Prepare Email Enquiry
                </button>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>Direct to {recipientEmail}</span>
                  <a
                    href={AIRBNB_LISTING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-blue-700"
                  >
                    View on Airbnb
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
