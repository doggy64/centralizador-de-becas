import type { Scholarship } from "@prisma/client";

type Dates = Pick<
  Scholarship,
  "startDate" | "deadlineDay" | "deadlineAt" | "timeZone" | "lastVerifiedAt"
>;
// Política del piloto: revisar datos activos al menos una vez cada treinta días.
export function isFresh(verified: Date | null, now: Date) {
  const age = verified ? now.getTime() - verified.getTime() : Infinity;
  return age >= 0 && age <= 30 * 86400000;
}
export function temporalStatus(call: Dates, now: Date) {
  const day = call.timeZone
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: call.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now)
    : null;
  if (
    (call.deadlineAt && now > call.deadlineAt) ||
    (day && call.deadlineDay && day > call.deadlineDay)
  )
    return "CLOSED";
  if (!isFresh(call.lastVerifiedAt, now)) return "TO_CONFIRM";
  if (call.startDate && day && day < call.startDate) return "UPCOMING";
  if (call.startDate && day && (call.deadlineAt || call.deadlineDay))
    return "OPEN";
  return "TO_CONFIRM";
}
