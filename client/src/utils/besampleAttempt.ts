const BESAMPLE_ATTEMPT_STORAGE_KEY = "besampleAttempt";

// All the survey app's browser-local state that belongs to a single
// participant's run: their session identity, consent, the "already
// completed" flags that make Layout.tsx skip CRT/RME/demographics on a
// resumed visit, and -- separately -- `@watts-lab/surveys`' own autosave/
// resume storage for each of those three aux surveys (the `storageName` prop
// Layout.tsx passes to <CRT>/<RmeTen>/<DemographicsLongInternational>: see
// Layout.tsx's `storageName="crt"`/`"rmeten"`/`"demographics"`). That
// library saves `{ currentPageNo, data, timeSpent }` under its own
// `storageName` key on every answer and restores from it on mount -- it's
// unrelated to (and a different key from) the "CRT"/"rmeTen"/
// "demographicsLongInternational" completion flags above, so leaving it
// alone would make a *second* participant's CRT/RME/demographics resume
// from wherever the *first* participant last left off (including landing
// straight on the final page, mid-survey, if the first participant finished
// it), rather than starting fresh.
const PARTICIPANT_SCOPED_STORAGE_KEYS = [
  "sessionId",
  "consent",
  "CRT",
  "rmeTen",
  "demographicsLongInternational",
  "statementsData",
  "urlParams",
  "crt",
  "rmeten",
  "demographics",
];

// Besample appends a unique `battempt` (its "assignment_id") to every
// recruitment link, and a unique `bnum` ("response_id") alongside it --
// `battempt` is the primary identifier, `bnum` a fallback for links that
// carry only that.
export function getBesampleAttemptId(
  search: string = window.location.search,
): string | null {
  const params = new URLSearchParams(search);
  return params.get("battempt") || params.get("bnum");
}

// All of this app's participant-scoped state lives in localStorage keyed
// only by name (e.g. "sessionId", "CRT"), with nothing tying it to a
// specific Besample assignment -- so if the same browser is reused for a
// second, genuinely different assignment (a shared/kiosk device, or someone
// replaying the link to double-claim payment), the app silently treats it as
// the *same* participant resuming: it reuses the old sessionId and skips
// CRT/RME/demographics entirely, because those localStorage flags are still
// set from the first assignment.
//
// Call this once, as early as possible (before anything reads sessionId/
// consent/etc. from localStorage), so a URL carrying a *new* Besample
// attempt id always starts the whole flow over: fresh consent, a fresh
// sessionId from the server, and every auxiliary survey re-shown.
//
// This only handles the *client-side* bookkeeping (localStorage). The
// sessionId itself is ultimately sourced from the server's httpOnly session
// cookie (see SessionContext.tsx's initializeSession, and the matching
// `/api` handler in server.ts), which this function cannot clear -- the
// server-side half of this fix (regenerating that session on a new attempt
// id) is what actually guarantees a fresh sessionId, this just makes sure
// the client doesn't keep showing stale consent/CRT/RME/demographics state
// once it gets one.
//
// Only wipes on an actual *change* -- i.e. this browser previously recorded
// some other battempt/bnum and now sees a different one. The very first
// Besample attempt this browser ever sees (no `besampleAttempt` recorded
// yet) just records it and returns without touching anything else: there's
// no prior *Besample* participant's state to protect against here, and
// leaving any pre-existing state alone in that case keeps this a no-op for
// an ordinary first-time visitor.
export function resetStorageForNewBesampleAttempt(
  search: string = window.location.search,
): void {
  const attemptId = getBesampleAttemptId(search);
  if (!attemptId) return;

  const storedAttemptId = localStorage.getItem(BESAMPLE_ATTEMPT_STORAGE_KEY);
  if (storedAttemptId === null || storedAttemptId === attemptId) {
    localStorage.setItem(BESAMPLE_ATTEMPT_STORAGE_KEY, attemptId);
    return;
  }

  PARTICIPANT_SCOPED_STORAGE_KEYS.forEach((key) =>
    localStorage.removeItem(key),
  );
  localStorage.setItem(BESAMPLE_ATTEMPT_STORAGE_KEY, attemptId);
}
