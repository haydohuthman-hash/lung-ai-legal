export interface ProgressShareSnapshot { days: number; quoteId: string }
export interface ProgressQuote { id: string; text: string }
export const SHARE_QUOTES: readonly ProgressQuote[];
export const PROGRESS_SHARE_BASE_URL: string;
export const PATCH_APP_STORE_URL: string;
export function createProgressShare(days: number, quoteId?: string): ProgressShareSnapshot;
export function buildProgressShareUrl(snapshot: ProgressShareSnapshot): string;
export function parseProgressShareUrl(input: string): ProgressShareSnapshot | null;
export function progressShareText(snapshot: ProgressShareSnapshot): string;
