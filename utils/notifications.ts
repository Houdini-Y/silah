import { Contact } from '../types/Contact';

// expo-notifications requires a real APK build (not Expo Go).
// These are safe stubs — full implementation added at build time.
export async function requestNotifPermission(): Promise<boolean> {
  return false;
}
export async function scheduleReminder(_contact: Contact): Promise<void> {
  // will be implemented in production build
}