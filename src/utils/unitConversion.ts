// 단위 변환 유틸리티
// 1돈 기준 변환율 설정 (3.75g 또는 4g)

export type DonConversionRate = 3.75 | 4;

// 기본 변환 테이블 (1돈 = 3.75g 기준)
const getConversionTable = (donRate: DonConversionRate): Record<string, number> => ({
    // 현대 한국 단위
    "돈": donRate,
    "냥": donRate * 10,      // 1냥 = 10돈
    "푼": donRate / 10,      // 1푼 = 0.1돈

    // 한자 단위
    "錢": donRate,           // 전 = 돈
    "兩": donRate * 10,      // 양 = 냥
    "分": donRate / 10,      // 분 = 푼
    "斤": donRate * 160,     // 1근 = 16냥

    // 현대 단위
    "g": 1,
    "mg": 0.001,
    "kg": 1000,
});

// g으로 변환
export const convertToGrams = (
    amount: number,
    unit: string,
    donRate: DonConversionRate = 3.75
): number | null => {
    const table = getConversionTable(donRate);
    const factor = table[unit];

    if (factor === undefined) {
        return null; // 알 수 없는 단위
    }

    return Math.round(amount * factor * 100) / 100; // 소수점 2자리
};

// 변환 가능한 단위인지 확인
export const isConvertibleUnit = (unit: string): boolean => {
    const table = getConversionTable(3.75);
    return unit in table;
};

// 포맷팅된 용량 문자열 반환
export const formatDosage = (
    amount: number,
    unit: string,
    showGrams: boolean,
    donRate: DonConversionRate = 3.75
): string => {
    const original = `${amount}${unit}`;

    if (!showGrams || unit === 'g') {
        return original;
    }

    const grams = convertToGrams(amount, unit, donRate);

    if (grams === null) {
        return original;
    }

    return `${original} (${grams}g)`;
};

// LocalStorage 키
const SETTINGS_KEY = 'k-medicine-settings';

export interface UnitSettings {
    showGrams: boolean;
    donConversionRate: DonConversionRate;
}

const defaultSettings: UnitSettings = {
    showGrams: false,
    donConversionRate: 3.75,
};

// 설정 저장/로드
export const getUnitSettings = (): UnitSettings => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
        return defaultSettings;
    }
};

export const saveUnitSettings = (settings: UnitSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
