// 약재 (본초) 타입
export interface Herb {
  name: string;        // 약재명 (예: 인삼, 황기)
  hanja?: string;      // 한자명 (예: 人蔘)
  amount: number;      // 용량 (숫자)
  unit: string;        // 단위 (예: 돈, 냥, g, 錢)
}

// 가감법 내 개별 약재 변경
export interface HerbModification {
  herb: string;          // 약재명 (한자)
  herbKo: string;        // 약재명 (한글)
  action: '加' | '去' | '倍' | '增量' | '合方' | '기타';
  detail?: string;       // 부가 설명 (예: "조금", "5錢으로")
}

// 구조화된 가감법 항목
export interface ModificationEntry {
  condition: string | null;       // 적용 조건 (예: "虛한 사람과 노인")
  changes: HerbModification[];    // 약재 변경 목록
  original: string;               // 원문 텍스트
}

// 처방 타입
export interface Prescription {
  id: string;
  name: string;              // 처방명 (필수)
  hanja?: string;            // 한자 처방명
  herbs: Herb[];             // 구성약재 (필수)

  // 선택 필드
  source?: string;           // 출전 (예: 동의보감, 상한론)
  indication?: string;       // 주치
  effect?: string;           // 효능
  modification?: string;     // 가감법 (원문 텍스트, 호환용)
  modifications?: ModificationEntry[];  // 구조화된 가감법
  dosageMethod?: string;     // 복용법
  indications?: string[];    // 적응증 키워드
  notes?: string;            // 메모

  createdAt: string;
  updatedAt: string;
}

// 새 처방 생성 시 사용되는 입력 타입
export type PrescriptionInput = Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>;

// 검색 필터 타입
export interface SearchFilter {
  query: string;                 // 처방명 검색어
  includeHerbs?: string[];       // 포함해야 할 약재
  excludeHerbs?: string[];       // 제외해야 할 약재
  modHerb?: string;              // 가감법에서 이 약재가 언급된 처방 검색
  modAction?: '加' | '去' | '倍' | '增量' | '合方' | '';  // 가감 액션 필터
}
