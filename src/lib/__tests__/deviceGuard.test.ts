import { isDeviceTaken } from "../deviceGuard";

test("device taken when same fingerprint", () => {
  expect(isDeviceTaken("abc", "abc")).toBe(true);
});

test("device not taken when different", () => {
  expect(isDeviceTaken("abc", "def")).toBe(false);
});

test("empty fingerprint not taken", () => {
  expect(isDeviceTaken(null, "")).toBe(false);
});
