import { captureTrackingId } from "./tracking";

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/engpass-check");
});

describe("captureTrackingId", () => {
  it("captures ?tid from the URL and persists it", () => {
    window.history.replaceState({}, "", "/engpass-check?tid=vid_abc-123");
    expect(captureTrackingId()).toBe("vid_abc-123");
    expect(sessionStorage.getItem("engpass-check-tid")).toBe("vid_abc-123");
  });

  it("falls back to the persisted tid when the URL has none", () => {
    sessionStorage.setItem("engpass-check-tid", "saved_tid");
    expect(captureTrackingId()).toBe("saved_tid");
  });

  it("returns null for a missing tid", () => {
    expect(captureTrackingId()).toBeNull();
  });

  it("returns null for a malformed tid", () => {
    window.history.replaceState({}, "", "/engpass-check?tid=bad%20tid");
    expect(captureTrackingId()).toBeNull();
  });
});
