export function isDeviceTaken(existingFingerprint: string | null, newFingerprint: string): boolean {
  return existingFingerprint === newFingerprint && newFingerprint.length > 0;
}
