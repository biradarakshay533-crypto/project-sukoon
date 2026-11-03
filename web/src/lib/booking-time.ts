// Booking times are always shown and chosen in Dharwad time.
// India has no daylight saving, so the offset is always +05:30.
const TIME_ZONE = "Asia/Kolkata";
const OFFSET = "+05:30";
const MINUTE = 60_000;

// How soon a customer can book, and how far ahead.
export const EARLIEST_MINUTES = 15;
export const DAYS_AHEAD = 7;
const SLOT_MINUTES = 30;
const DEFAULT_HOURS = { open: "09:00", close: "21:00" };

const partsFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

// "2026-11-04" for the Dharwad date of a moment.
function localDate(moment: Date) {
  return partsFormat.format(moment);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function toStartsAt(date: string, time: string) {
  return `${date}T${time}:00${OFFSET}`;
}

export function bookingDays(now: Date) {
  const today = localDate(now);

  return Array.from({ length: DAYS_AHEAD }, (_, index) => {
    const noon = new Date(`${today}T12:00:00${OFFSET}`);
    noon.setUTCDate(noon.getUTCDate() + index);
    const value = localDate(noon);
    const label = index === 0 ? "Today" : index === 1 ? "Tomorrow" : dayFormat.format(noon);
    return { value, label };
  });
}

type Hours = { open?: string; close?: string } | null;

// Start times every 30 minutes that fit inside the opening hours.
export function timeSlots(date: string, hours: Hours, durationMinutes: number, now: Date) {
  const open = toMinutes(hours?.open || DEFAULT_HOURS.open);
  const close = toMinutes(hours?.close || DEFAULT_HOURS.close);
  const earliest = now.getTime() + EARLIEST_MINUTES * MINUTE;
  const slots: { value: string; label: string }[] = [];

  for (let start = open; start + durationMinutes <= close; start += SLOT_MINUTES) {
    const value = toTime(start);
    const moment = new Date(toStartsAt(date, value));
    if (moment.getTime() >= earliest) {
      slots.push({ value, label: timeFormat.format(moment) });
    }
  }

  return slots;
}

export function formatBookingTime(iso: string) {
  const moment = new Date(iso);
  return `${dayFormat.format(moment)}, ${timeFormat.format(moment)}`;
}

export function currentTime() {
  return new Date();
}
