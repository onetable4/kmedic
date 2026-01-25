// 약재 (본초) 타입
export interface Herb {
  name: string;        // 약재명 (예: 인삼, 황기)
  amount: number;      // 용량 (숫자)
  unit: string;        // 단위 (예: 돈, 냥, g, 錢)
}

// 처방 타입
export interface Prescription {
  id: string;
  name: string;              // 처방명 (필수)
  herbs: Herb[];             // 구성약재 (필수)
  
  // 선택 필드
  source?: string;           // 출전 (예: 동의보감, 상한론)
  indication?: string;       // 주치
  effect?: string;           // 효능
  modification?: string;     // 가감법
  notes?: string;            // 메모
  
  createdAt: string;
  updatedAt: string;
}

// 새 처방 생성 시 사용되는 입력 타입
export type PrescriptionInput = Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>;

// 검색 필터 타입
export interface SearchFilter {
  query: string;           // 처방명 검색어
  includeHerbs?: string[]; // 포함해야 할 약재
  excludeHerbs?: string[]; // 제외해야 할 약재
}
