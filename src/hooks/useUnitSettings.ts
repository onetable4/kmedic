import { useState, useEffect, useCallback } from 'react';
import type { UnitSettings, DonConversionRate } from '../utils/unitConversion';
import { getUnitSettings, saveUnitSettings } from '../utils/unitConversion';

export const useUnitSettings = () => {
    const [settings, setSettings] = useState<UnitSettings>(getUnitSettings);

    // 설정 변경 시 저장
    useEffect(() => {
        saveUnitSettings(settings);
    }, [settings]);

    // g 표시 토글
    const toggleShowGrams = useCallback(() => {
        setSettings(prev => ({
            ...prev,
            showGrams: !prev.showGrams,
        }));
    }, []);

    // 변환율 변경
    const setDonRate = useCallback((rate: DonConversionRate) => {
        setSettings(prev => ({
            ...prev,
            donConversionRate: rate,
        }));
    }, []);

    return {
        showGrams: settings.showGrams,
        donRate: settings.donConversionRate,
        toggleShowGrams,
        setDonRate,
    };
};
