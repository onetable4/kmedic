import type { Prescription, PrescriptionInput } from '../types/prescription';

const STORAGE_KEY = 'k-medicine-prescriptions';

// 고유 ID 생성
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 전체 처방 조회
export const getAllPrescriptions = (): Prescription[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        console.error('Failed to load prescriptions from storage');
        return [];
    }
};

// 단일 처방 조회
export const getPrescription = (id: string): Prescription | undefined => {
    const prescriptions = getAllPrescriptions();
    return prescriptions.find(p => p.id === id);
};

// 처방 저장 (새로 추가)
export const addPrescription = (input: PrescriptionInput): Prescription => {
    const prescriptions = getAllPrescriptions();
    const now = new Date().toISOString();

    const newPrescription: Prescription = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
    };

    prescriptions.push(newPrescription);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));

    return newPrescription;
};

// 처방 수정
export const updatePrescription = (id: string, input: PrescriptionInput): Prescription | undefined => {
    const prescriptions = getAllPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);

    if (index === -1) return undefined;

    const updated: Prescription = {
        ...prescriptions[index],
        ...input,
        id, // ID는 변경 불가
        createdAt: prescriptions[index].createdAt, // 생성일은 유지
        updatedAt: new Date().toISOString(),
    };

    prescriptions[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));

    return updated;
};

// 처방 삭제
export const deletePrescription = (id: string): boolean => {
    const prescriptions = getAllPrescriptions();
    const filtered = prescriptions.filter(p => p.id !== id);

    if (filtered.length === prescriptions.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
};

// 전체 처방 초기화 (새 문서)
export const clearAllPrescriptions = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

// JSON 파일로 내보내기
export const exportToJSON = (): void => {
    const prescriptions = getAllPrescriptions();
    const dataStr = JSON.stringify(prescriptions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `prescriptions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
};

// JSON 파일에서 가져오기
export const importFromJSON = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const imported: Prescription[] = JSON.parse(content);

                // 유효성 검사
                if (!Array.isArray(imported)) {
                    throw new Error('Invalid format: expected an array');
                }

                // 기존 데이터와 병합 (중복 ID 체크)
                const existing = getAllPrescriptions();
                const existingIds = new Set(existing.map(p => p.id));

                const newPrescriptions = imported.filter(p => !existingIds.has(p.id));
                const merged = [...existing, ...newPrescriptions];

                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                resolve(newPrescriptions.length);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

// 검색 기능
export const searchPrescriptions = (
    query: string,
    includeHerbs?: string[],
    excludeHerbs?: string[]
): Prescription[] => {
    let prescriptions = getAllPrescriptions();

    // 처방명 검색
    if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        prescriptions = prescriptions.filter(p =>
            p.name.toLowerCase().includes(lowerQuery)
        );
    }

    // 포함해야 할 약재 필터
    if (includeHerbs && includeHerbs.length > 0) {
        prescriptions = prescriptions.filter(p =>
            includeHerbs.every(herb =>
                p.herbs.some(h => h.name.includes(herb))
            )
        );
    }

    // 제외해야 할 약재 필터
    if (excludeHerbs && excludeHerbs.length > 0) {
        prescriptions = prescriptions.filter(p =>
            !excludeHerbs.some(herb =>
                p.herbs.some(h => h.name.includes(herb))
            )
        );
    }

    return prescriptions;
};
