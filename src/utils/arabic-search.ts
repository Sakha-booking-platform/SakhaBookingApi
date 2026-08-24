export function normalizeArabicSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06EDـ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeArabicSearch(value?: string): string[] {
  if (!value?.trim()) return [];
  return normalizeArabicSearch(value).split(' ').filter(Boolean);
}

export const HOME_SEARCH_FILLER_WORDS = new Set([
  'اريد', 'ابي', 'ابغى', 'عايز', 'احتاج', 'محتاج',
  'عياده', 'عيادة', 'مركز', 'مستشفى', 'طبيب', 'دكتور', 'دكتوره', 'دكتورة',
  'من', 'في', 'الى', 'الي', 'على', 'عن', 'لي', 'لدي',
  'قريب', 'قريبه', 'قريبة', 'الاقرب', 'اقرب', 'موقعي', 'موقعي الحالي',
  'اعلى', 'افضل', 'تقييم', 'تقييما', 'تقييماً', 'حسب', 'الريتنج', 'ريتنج',
]);

export function meaningfulSearchTokens(value?: string): string[] {
  return tokenizeArabicSearch(value).filter((token) => !HOME_SEARCH_FILLER_WORDS.has(token));
}

export function hasNearbyIntent(value?: string): boolean {
  const normalized = normalizeArabicSearch(value ?? '');
  return ['قريب', 'قريبه', 'الاقرب', 'اقرب', 'موقعي'].some((word) => normalized.includes(word));
}

export function hasRatingIntent(value?: string): boolean {
  const normalized = normalizeArabicSearch(value ?? '');
  return ['اعلى تقييم', 'افضل', 'تقييم', 'ريتنج'].some((word) => normalized.includes(word));
}
