export interface LegacyProgressShareSnapshot { days: number; quoteId: string }
export interface ProgressTimerShareSnapshot { startedAt: string; quoteId: string }
export type ProgressShareSnapshot = LegacyProgressShareSnapshot | ProgressTimerShareSnapshot;
export interface JourneyTimer { dayNumber: number; hours: number; minutes: number; seconds: number; totalSeconds: number }
export interface ProgressQuote { id: string; text: string }
export const SHARE_QUOTES: readonly ProgressQuote[];
export const PROGRESS_SHARE_BASE_URL: string;
export const PATCH_APP_STORE_URL: string;
export function getJourneyTimer(startedAt: string | number, now?: number): JourneyTimer;
export function formatJourneyClock(timer: Pick<JourneyTimer, 'hours' | 'minutes' | 'seconds'>): string;
export function createProgressShare(days: number, quoteId?: string): LegacyProgressShareSnapshot;
export function createProgressTimerShare(startedAt: string, quoteId?: string): ProgressTimerShareSnapshot;
export function validateProgressShare(snapshot: ProgressShareSnapshot): ProgressShareSnapshot;
export function progressShareDay(snapshot: ProgressShareSnapshot, now?: number): number;
export function buildProgressShareUrl(snapshot: ProgressShareSnapshot): string;
export function parseProgressShareUrl(input: string): ProgressShareSnapshot | null;
export function progressShareText(snapshot: ProgressShareSnapshot, now?: number): string;
