import { useState, useEffect, useCallback } from 'react';
import type { Prescription, PrescriptionInput } from '../types/prescription';
import {
    getAllPrescriptions,
    addPrescription,
    updatePrescription,
    deletePrescription,
    searchPrescriptions,
} from '../data/storage';

export const usePrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    // 초기 로드
    useEffect(() => {
        setPrescriptions(getAllPrescriptions());
        setLoading(false);
    }, []);

    // 처방 추가
    const add = useCallback((input: PrescriptionInput): Prescription => {
        const newPrescription = addPrescription(input);
        setPrescriptions(prev => [...prev, newPrescription]);
        return newPrescription;
    }, []);

    // 처방 수정
    const update = useCallback((id: string, input: PrescriptionInput): boolean => {
        const updated = updatePrescription(id, input);
        if (updated) {
            setPrescriptions(prev =>
                prev.map(p => p.id === id ? updated : p)
            );
            return true;
        }
        return false;
    }, []);

    // 처방 삭제
    const remove = useCallback((id: string): boolean => {
        const success = deletePrescription(id);
        if (success) {
            setPrescriptions(prev => prev.filter(p => p.id !== id));
        }
        return success;
    }, []);

    // 검색
    const search = useCallback((
        query: string,
        includeHerbs?: string[],
        excludeHerbs?: string[],
        modHerb?: string,
        modAction?: string,
    ): Prescription[] => {
        return searchPrescriptions(query, includeHerbs, excludeHerbs, modHerb, modAction);
    }, []);

    // 데이터 새로고침
    const refresh = useCallback(() => {
        setPrescriptions(getAllPrescriptions());
    }, []);

    return {
        prescriptions,
        loading,
        add,
        update,
        remove,
        search,
        refresh,
    };
};
