import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetStorageForNewBesampleAttempt } from "./besampleAttempt";

const PARTICIPANT_SCOPED_KEYS = [
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

// This project's jsdom/Node combo doesn't reliably expose a working global
// `localStorage` in the test environment (Node's own experimental Web
// Storage global shadows jsdom's) -- stub a minimal in-memory
// implementation directly rather than depend on it.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const seedParticipantState = () => {
  PARTICIPANT_SCOPED_KEYS.forEach((key) => localStorage.setItem(key, "x"));
};

describe("resetStorageForNewBesampleAttempt", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  it("does nothing when the URL has no battempt/bnum", () => {
    seedParticipantState();

    resetStorageForNewBesampleAttempt("?tc=818");

    PARTICIPANT_SCOPED_KEYS.forEach((key) =>
      expect(localStorage.getItem(key)).toBe("x"),
    );
  });

  it("records the attempt id but leaves any existing state alone on a first-ever sighting", () => {
    seedParticipantState();

    resetStorageForNewBesampleAttempt("?battempt=attempt-1&tc=818");

    expect(localStorage.getItem("besampleAttempt")).toBe("attempt-1");
    PARTICIPANT_SCOPED_KEYS.forEach((key) =>
      expect(localStorage.getItem(key)).toBe("x"),
    );
  });

  it("wipes participant-scoped state when a different battempt shows up", () => {
    seedParticipantState();
    localStorage.setItem("besampleAttempt", "attempt-1");

    resetStorageForNewBesampleAttempt("?battempt=attempt-2&tc=818");

    PARTICIPANT_SCOPED_KEYS.forEach((key) =>
      expect(localStorage.getItem(key)).toBeNull(),
    );
    expect(localStorage.getItem("besampleAttempt")).toBe("attempt-2");
  });

  it("leaves participant-scoped state alone when the battempt is unchanged (same revisit)", () => {
    seedParticipantState();
    localStorage.setItem("besampleAttempt", "attempt-1");

    resetStorageForNewBesampleAttempt("?battempt=attempt-1&tc=818");

    PARTICIPANT_SCOPED_KEYS.forEach((key) =>
      expect(localStorage.getItem(key)).toBe("x"),
    );
  });

  it("falls back to bnum when battempt is absent", () => {
    seedParticipantState();
    localStorage.setItem("besampleAttempt", "resp-1");

    resetStorageForNewBesampleAttempt("?bnum=resp-2&tc=818");

    PARTICIPANT_SCOPED_KEYS.forEach((key) =>
      expect(localStorage.getItem(key)).toBeNull(),
    );
    expect(localStorage.getItem("besampleAttempt")).toBe("resp-2");
  });
});
