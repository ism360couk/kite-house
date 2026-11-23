import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDaysIso,
  buildBookingEnquiry,
  findNextAvailableWindow,
  getBlockedDateMap,
  isRangeAvailable,
  parseIcalEvents,
  unfoldIcalLines,
} from './ical';

const SAMPLE_ICS = [
  'BEGIN:VCALENDAR',
  'PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261204',
  'DTEND;VALUE=DATE:20261206',
  'SUMMARY:Reserved',
  'DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/de',
  ' tails/HMQ2KZZXAQ',
  'UID:res-1@airbnb.com',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261207',
  'DTEND;VALUE=DATE:20261218',
  'SUMMARY:Airbnb (Not available)',
  'UID:blk-1@airbnb.com',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261220',
  'DTEND;VALUE=DATE:20270501',
  'SUMMARY:Airbnb (Not available)',
  'UID:blk-2@airbnb.com',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

test('unfoldIcalLines joins RFC 5545 folded continuation lines', () => {
  const lines = unfoldIcalLines(SAMPLE_ICS);
  const descLine = lines.find((l) => l.startsWith('DESCRIPTION:'));
  assert.ok(descLine);
  assert.ok(descLine.includes('reservations/details/HMQ2KZZXAQ'));
});

test('parseIcalEvents extracts sorted VEVENT date spans and kinds', () => {
  const events = parseIcalEvents(SAMPLE_ICS);
  assert.equal(events.length, 3);
  assert.deepEqual(events[0], {
    uid: 'res-1@airbnb.com',
    startDate: '2026-12-04',
    endDate: '2026-12-06',
    summary: 'Reserved',
    kind: 'reserved',
  });
  assert.equal(events[1].kind, 'blocked');
});

test('getBlockedDateMap treats DTSTART inclusive and DTEND exclusive', () => {
  const events = parseIcalEvents(SAMPLE_ICS);
  const blocked = getBlockedDateMap(events);

  assert.equal(blocked.get('2026-12-04'), 'reserved');
  assert.equal(blocked.get('2026-12-05'), 'reserved');
  // 2026-12-06 is checkout morning -> free night before 2026-12-07 block
  assert.equal(blocked.has('2026-12-06'), false);
  assert.equal(blocked.get('2026-12-07'), 'blocked');
  assert.equal(blocked.has('2026-12-18'), false);
  assert.equal(blocked.has('2026-12-19'), false);
  assert.equal(blocked.get('2026-12-20'), 'blocked');
});

test('isRangeAvailable validates open 2-night windows, same-day turnover, and rejects overlaps', () => {
  const blocked = getBlockedDateMap(parseIcalEvents(SAMPLE_ICS));

  // Dec 18 -> Dec 20 is 2 nights (Dec 18, Dec 19), checking out morning of Dec 20 (same-day turnover)
  const openWin = isRangeAvailable('2026-12-18', '2026-12-20', blocked, 2, '2026-11-23');
  assert.equal(openWin.valid, true);
  assert.equal(openWin.nights, 2);

  // Dec 17 -> Dec 19 includes blocked night Dec 17
  const overlapWin = isRangeAvailable('2026-12-17', '2026-12-19', blocked, 2, '2026-11-23');
  assert.equal(overlapWin.valid, false);
  assert.match(overlapWin.reason ?? '', /booked or unavailable/i);

  // 1-night stay violates minNights=2
  const tooShort = isRangeAvailable('2026-12-18', '2026-12-19', blocked, 2, '2026-11-23');
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.reason ?? '', /Minimum stay/i);
});

test('findNextAvailableWindow skips blocked dates and finds Dec 18–20', () => {
  const blocked = getBlockedDateMap(parseIcalEvents(SAMPLE_ICS));
  const nextWin = findNextAvailableWindow(blocked, '2026-12-04', 2, 60);
  assert.deepEqual(nextWin, { checkIn: '2026-12-18', checkOut: '2026-12-20' });
});

test('addDaysIso handles month and leap-year boundaries cleanly in UTC', () => {
  assert.equal(addDaysIso('2026-12-30', 3), '2027-01-02');
  assert.equal(addDaysIso('2028-02-28', 1), '2028-02-29');
});

test('buildBookingEnquiry creates formatted mailto link and summary', () => {
  const res = buildBookingEnquiry({
    recipientEmail: 'bookings@kite-house.co.uk',
    checkIn: '2027-06-05',
    checkOut: '2027-06-12',
    nights: 7,
    guests: 6,
    extraGuestsRequested: false,
    guestName: 'Hannah Mitchell',
    guestEmail: 'hannah@example.co.uk',
    guestPhone: '07700 900123',
    notes: 'Bringing two wingfoils and bikes.',
  });

  assert.equal(res.recipientEmail, 'bookings@kite-house.co.uk');
  assert.match(res.subject, /5 Jun 2027 – 12 Jun 2027 \(7 nights\)/);
  assert.match(res.body, /Hannah Mitchell/);
  assert.match(res.body, /6 guests/);
  assert.ok(res.mailtoHref.startsWith('mailto:bookings%40kite-house.co.uk?subject='));
});
