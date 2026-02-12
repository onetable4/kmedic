import React, { useState, useMemo } from 'react';
import type { Prescription, ModificationEntry } from '../types/prescription';
import { getAllPrescriptions } from '../data/storage';

interface HerbModLookupProps {
    onClose: () => void;
    onNavigate: (prescription: Prescription) => void;
}

interface ModResult {
    prescription: Prescription;
    modification: ModificationEntry;
    action: string;
    detail: string;
}

// 액션별 컬러
const ACTION_COLORS: Record<string, string> = {
    '加': '#2e7d32',
    '去': '#c62828',
    '倍': '#1565c0',
    '增量': '#6a1b9a',
    '合方': '#ef6c00',
    '기타': '#616161',
};

const ACTION_LABELS: Record<string, string> = {
    '加': '더한다',
    '去': '뺀다',
    '倍': '배로 한다',
    '增量': '증량한다',
    '합方': '합방한다',
};

export const HerbModLookup: React.FC<HerbModLookupProps> = ({ onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [selectedAction, setSelectedAction] = useState('');

    const results = useMemo<ModResult[]>(() => {
        const q = query.trim();
        if (!q) return [];

        const all = getAllPrescriptions();
        const matches: ModResult[] = [];

        for (const p of all) {
            if (!p.modifications) continue;
            for (const mod of p.modifications) {
                for (const change of mod.changes) {
                    const herbMatch = change.herb.includes(q) || change.herbKo.includes(q);
                    if (!herbMatch) continue;
                    if (selectedAction && change.action !== selectedAction) continue;

                    matches.push({
                        prescription: p,
                        modification: mod,
                        action: change.action,
                        detail: change.detail || '',
                    });
                }
            }
        }

        // 액션별 → 처방명별 정렬
        matches.sort((a, b) => {
            const actionOrder = ['加', '去', '倍', '增量', '合方', '기타'];
            const ai = actionOrder.indexOf(a.action);
            const bi = actionOrder.indexOf(b.action);
            if (ai !== bi) return ai - bi;
            return a.prescription.name.localeCompare(b.prescription.name);
        });

        return matches;
    }, [query, selectedAction]);

    // 액션별 그룹
    const grouped = useMemo(() => {
        const groups: Record<string, ModResult[]> = {};
        for (const r of results) {
            const key = r.action;
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
        }
        return groups;
    }, [results]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // trigger search already handled by useMemo
        }
    };

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="herb-lookup-modal" onClick={(e) => e.stopPropagation()}>
                <div className="detail-header">
                    <h2 className="detail-title">🔍 본초 가감법 검색</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="lookup-search">
                    <input
                        className="lookup-input"
                        type="text"
                        placeholder="본초명 입력 (예: 숙지황, 人蔘, 부자...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <select
                        className="lookup-action-select"
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                    >
                        <option value="">전체 액션</option>
                        <option value="加">加 (더하기)</option>
                        <option value="去">去 (빼기)</option>
                        <option value="倍">倍 (배가)</option>
                        <option value="增量">增量</option>
                        <option value="合方">合方</option>
                    </select>
                </div>

                <div className="lookup-results">
                    {query.trim() && results.length === 0 && (
                        <div className="lookup-empty">
                            <span className="empty-icon">🌿</span>
                            <p>'{query}' 가감법을 찾을 수 없습니다</p>
                        </div>
                    )}

                    {!query.trim() && (
                        <div className="lookup-empty">
                            <span className="empty-icon">⚖️</span>
                            <p>본초명을 입력하면 가감법에서<br />해당 약재가 사용되는 맥락을 보여줍니다</p>
                        </div>
                    )}

                    {query.trim() && results.length > 0 && (
                        <div className="lookup-summary">
                            <strong>{query}</strong> — {results.length}건의 가감법
                        </div>
                    )}

                    {Object.entries(grouped).map(([action, items]) => (
                        <div key={action} className="lookup-group">
                            <div className="lookup-group-header">
                                <span
                                    className="action-badge"
                                    style={{ backgroundColor: ACTION_COLORS[action] || '#616161' }}
                                >
                                    {action}
                                </span>
                                <span className="lookup-group-label">
                                    {ACTION_LABELS[action] || action}
                                </span>
                                <span className="lookup-group-count">{items.length}건</span>
                            </div>
                            <div className="lookup-group-items">
                                {items.map((item, idx) => (
                                    <div
                                        key={`${item.prescription.id}-${idx}`}
                                        className="lookup-item"
                                        onClick={() => onNavigate(item.prescription)}
                                    >
                                        <div className="lookup-item-main">
                                            <span className="lookup-rx-name">
                                                {item.prescription.name}
                                            </span>
                                            {item.prescription.hanja && (
                                                <span className="lookup-rx-hanja">
                                                    {item.prescription.hanja}
                                                </span>
                                            )}
                                        </div>
                                        <div className="lookup-item-context">
                                            {item.modification.condition ? (
                                                <span className="lookup-condition">
                                                    "{item.modification.condition}"
                                                </span>
                                            ) : (
                                                <span className="lookup-condition muted">
                                                    (무조건)
                                                </span>
                                            )}
                                            {item.detail && (
                                                <span className="lookup-detail">· {item.detail}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
