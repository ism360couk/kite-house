export interface IcalBookingBlock {
  uid: string;
  startDate: string; // YYYY-MM-DD inclusive
  endDate: string;   // YYYY-MM-DD exclusive (checkout morning)
  summary: string;
  kind: 'reserved' | 'blocked';
}

export type NightStatus = 'reserved' | 'blocked';

export interface RangeValidationResult {
  valid: boolean;
  nights: number;
  reason?: string;
}

export interface BookingEnquiryInput {
  recipientEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  extraGuestsRequested: boolean;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
}

export interface FormattedBookingEnquiry {
  recipientEmail: string;
  subject: string;
  body: string;
  mailtoHref: string;
}

export const AIRBNB_LISTING_URL = 'https://www.airbnb.co.uk/rooms/47932092';
export const AIRBNB_ICAL_URL =
  'https://www.airbnb.co.uk/calendar/ical/47932092.ics?s=757cdc5b22f78dba4544db7dc22c922d';
export const DEFAULT_BOOKING_EMAIL = 'bookings@kite-house.co.uk';
export const MIN_STAY_NIGHTS = 2;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Unfold RFC 5545 folded lines (CRLF/LF followed by single space or tab).
 */
export function unfoldIcalLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const unfolded = normalized.replace(/\n[ \t]/g, '');
  return unfolded
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Parse an iCal date or date-time value (e.g., "20261204" or "20261204T150000Z")
 * into a canonical YYYY-MM-DD UTC calendar string.
 */
export function parseIcalDateValue(value: string): string | null {
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const iso = `${year}-${month}-${day}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

/**
 * Parse VEVENT blocks from an iCalendar (.ics) string.
 */
export function parseIcalEvents(raw: string): IcalBookingBlock[] {
  const lines = unfoldIcalLines(raw);
  const events: IcalBookingBlock[] = [];
  let inEvent = false;
  let current: Partial<IcalBookingBlock> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      if (
        inEvent &&
        current.startDate &&
        current.endDate &&
        current.endDate > current.startDate
      ) {
        const summary = current.summary ?? 'Unavailable';
        const kind: 'reserved' | 'blocked' = /reserved/i.test(summary)
          ? 'reserved'
          : 'blocked';
        events.push({
          uid: current.uid ?? `${current.startDate}-${current.endDate}`,
          startDate: current.startDate,
          endDate: current.endDate,
          summary,
          kind,
        });
      }
      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const rawKey = line.slice(0, colonIdx).toUpperCase();
    const key = rawKey.split(';')[0];
    const value = line.slice(colonIdx + 1).trim();

    if (key === 'DTSTART') {
      const parsed = parseIcalDateValue(value);
      if (parsed) current.startDate = parsed;
    } else if (key === 'DTEND') {
      const parsed = parseIcalDateValue(value);
      if (parsed) current.endDate = parsed;
    } else if (key === 'SUMMARY') {
      current.summary = value;
    } else if (key === 'UID') {
      current.uid = value;
    }
  }

  return events.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * Add `days` to a YYYY-MM-DD UTC date string.
 */
export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/**
 * Calculate the whole number of nights between two YYYY-MM-DD dates.
 */
export function diffNightsIso(checkIn: string, checkOut: string): number {
  if (!ISO_DATE_RE.test(checkIn) || !ISO_DATE_RE.test(checkOut)) return 0;
  const startMs = Date.parse(`${checkIn}T00:00:00Z`);
  const endMs = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;
  return Math.round((endMs - startMs) / 86_400_000);
}

/**
 * Build a map of occupied nights (`YYYY-MM-DD` -> 'reserved' | 'blocked').
 * Per RFC 5545, DTSTART is inclusive and DTEND (checkout morning) is exclusive.
 */
export function getBlockedDateMap(events: IcalBookingBlock[]): Map<string, NightStatus> {
  const map = new Map<string, NightStatus>();
  for (const ev of events) {
    let cursor = ev.startDate;
    let guard = 0;
    while (cursor < ev.endDate && guard < 1200) {
      const existing = map.get(cursor);
      if (existing !== 'reserved') {
        map.set(cursor, ev.kind);
      }
      cursor = addDaysIso(cursor, 1);
      guard += 1;
    }
  }
  return map;
}

/**
 * Validate whether [checkIn, checkOut) is a bookable stay window.
 * Note: `checkOut` itself may appear in `blockedMap` (same-day turnover).
 */
export function isRangeAvailable(
  checkIn: string,
  checkOut: string,
  blockedMap: Map<string, NightStatus>,
  minNights = MIN_STAY_NIGHTS,
  todayIso?: string
): RangeValidationResult {
  if (!ISO_DATE_RE.test(checkIn) || !ISO_DATE_RE.test(checkOut)) {
    return { valid: false, nights: 0, reason: 'Select both check-in and check-out dates.' };
  }

  if (todayIso && checkIn < todayIso) {
    return { valid: false, nights: 0, reason: 'Check-in date cannot be in the past.' };
  }

  const nights = diffNightsIso(checkIn, checkOut);
  if (nights <= 0) {
    return { valid: false, nights: 0, reason: 'Check-out must be after check-in.' };
  }

  if (nights < minNights) {
    return {
      valid: false,
      nights,
      reason: `Minimum stay at Kite House is ${minNights} nights.`,
    };
  }

  let cursor = checkIn;
  for (let i = 0; i < nights; i += 1) {
    if (blockedMap.has(cursor)) {
      return {
        valid: false,
        nights,
        reason: `Night of ${formatShortDate(cursor)} is already booked or unavailable.`,
      };
    }
    cursor = addDaysIso(cursor, 1);
  }

  return { valid: true, nights };
}

/**
 * Find the next available contiguous stay of at least `minNights` starting on or after `startFromIso`.
 */
export function findNextAvailableWindow(
  blockedMap: Map<string, NightStatus>,
  startFromIso: string,
  minNights = MIN_STAY_NIGHTS,
  maxSearchDays = 365
): { checkIn: string; checkOut: string } | null {
  for (let offset = 0; offset <= maxSearchDays; offset += 1) {
    const candidateStart = addDaysIso(startFromIso, offset);
    const candidateEnd = addDaysIso(candidateStart, minNights);
    const res = isRangeAvailable(candidateStart, candidateEnd, blockedMap, minNights, startFromIso);
    if (res.valid) {
      return { checkIn: candidateStart, checkOut: candidateEnd };
    }
  }
  return null;
}

/**
 * Format YYYY-MM-DD as "Fri 5 Jun 2027".
 */
export function formatDisplayDate(iso: string): string {
  if (!ISO_DATE_RE.test(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Format YYYY-MM-DD as "5 Jun 2027".
 */
export function formatShortDate(iso: string): string {
  if (!ISO_DATE_RE.test(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Build a calendar month matrix (Monday-first, 7 columns) for year + 0-indexed month.
 */
export function getMonthCalendarDays(
  year: number,
  monthZeroIndexed: number
): Array<{ iso: string; dayNumber: number; inMonth: boolean }> {
  const firstDay = new Date(Date.UTC(year, monthZeroIndexed, 1));
  const daysInMonth = new Date(Date.UTC(year, monthZeroIndexed + 1, 0)).getUTCDate();
  // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startWeekday = (firstDay.getUTCDay() + 6) % 7;

  const cells: Array<{ iso: string; dayNumber: number; inMonth: boolean }> = [];
  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const prevDate = new Date(Date.UTC(year, monthZeroIndexed, -i));
    cells.push({
      iso: prevDate.toISOString().slice(0, 10),
      dayNumber: prevDate.getUTCDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dt = new Date(Date.UTC(year, monthZeroIndexed, day));
    cells.push({
      iso: dt.toISOString().slice(0, 10),
      dayNumber: day,
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const nextIso = addDaysIso(last.iso, 1);
    const dayNumber = Number(nextIso.slice(8, 10));
    cells.push({
      iso: nextIso,
      dayNumber,
      inMonth: false,
    });
  }

  return cells;
}

export function getMonthLabel(year: number, monthZeroIndexed: number): string {
  const dt = new Date(Date.UTC(year, monthZeroIndexed, 1));
  return dt.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Build formatted booking enquiry subject, plain text body, and mailto href.
 */
export function buildBookingEnquiry(
  input: BookingEnquiryInput
): FormattedBookingEnquiry {
  const recipient = input.recipientEmail.trim() || DEFAULT_BOOKING_EMAIL;
  const checkInFmt = formatDisplayDate(input.checkIn);
  const checkOutFmt = formatDisplayDate(input.checkOut);
  const guestLabel = input.extraGuestsRequested
    ? `${input.guests} guests (plus up to 2 extra guests requested)`
    : `${input.guests} ${input.guests === 1 ? 'guest' : 'guests'}`;

  const subject = `Kite House Booking Enquiry: ${formatShortDate(input.checkIn)} – ${formatShortDate(input.checkOut)} (${input.nights} nights)`;

  const lines = [
    'Hello Kite House,',
    '',
    'I would like to enquire about booking Kite House (Officer\'s Field, Portland) directly:',
    '',
    `Check-in:   ${checkInFmt} (from 15:00)`,
    `Check-out:  ${checkOutFmt} (by 10:00)`,
    `Duration:   ${input.nights} ${input.nights === 1 ? 'night' : 'nights'}`,
    `Party size: ${guestLabel}`,
    '',
    `Name:       ${input.guestName.trim()}`,
    `Email:      ${input.guestEmail.trim()}`,
    input.guestPhone.trim() ? `Phone:      ${input.guestPhone.trim()}` : null,
    '',
    input.notes.trim() ? `Notes:\n${input.notes.trim()}` : null,
    '',
    'Sent via www.kite-house.co.uk',
  ].filter((item): item is string => item !== null);

  const body = lines.join('\n');
  const mailtoHref = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    recipientEmail: recipient,
    subject,
    body,
    mailtoHref,
  };
}
