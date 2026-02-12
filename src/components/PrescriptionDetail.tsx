import React, { useState } from 'react';
import type { Prescription, ModificationEntry } from '../types/prescription';
import type { DonConversionRate } from '../utils/unitConversion';
import { formatDosage } from '../utils/unitConversion';

interface PrescriptionDetailProps {
    prescription: Prescription;
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
    showGrams: boolean;
    donRate: DonConversionRate;
}

// 액션별 뱃지 컬러
const ACTION_COLORS: Record<string, string> = {
    '加': '#2e7d32',
    '去': '#c62828',
    '倍': '#1565c0',
    '增量': '#6a1b9a',
    '合方': '#ef6c00',
    '기타': '#616161',
};

const ModificationItem: React.FC<{ mod: ModificationEntry; index: number }> = ({ mod, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mod-item">
            <div className="mod-item-header" onClick={() => setExpanded(!expanded)}>
                <span className="mod-number">{'⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'[index + 1] || `${index + 1}`}</span>
                <span className="mod-condition">
                    {mod.condition || '(무조건)'}
                </span>
                <span className="mod-changes-summary">
                    {mod.changes.map(c => (
                        <span key={c.herb} className="action-badge" style={{ backgroundColor: ACTION_COLORS[c.action] || '#616161' }}>
                            {c.herbKo} {c.action}
                        </span>
                    ))}
                </span>
                <span className="mod-expand">{expanded ? '▲' : '▼'}</span>
            </div>
            {expanded && (
                <div className="mod-item-detail">
                    <p className="mod-original">{mod.original}</p>
                    {mod.changes.length > 0 && (
                        <table className="mod-changes-table">
                            <thead>
                                <tr>
                                    <th>약재</th>
                                    <th>한자</th>
                                    <th>액션</th>
                                    <th>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mod.changes.map((change, ci) => (
                                    <tr key={ci}>
                                        <td>{change.herbKo}</td>
                                        <td className="hanja-text">{change.herb}</td>
                                        <td>
                                            <span className="action-badge-sm" style={{ backgroundColor: ACTION_COLORS[change.action] || '#616161' }}>
                                                {change.action}
                                            </span>
                                        </td>
                                        <td>{change.detail || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export const PrescriptionDetail: React.FC<PrescriptionDetailProps> = ({
    prescription,
    onEdit,
    onDelete,
    onClose,
    showGrams,
    donRate,
}) => {
    const handleDelete = () => {
        if (window.confirm(`"${prescription.name}" 처방을 삭제하시겠습니까?`)) {
            onDelete();
        }
    };

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="detail-header">
                    <div>
                        <h2 className="detail-title">{prescription.name}</h2>
                        {prescription.hanja && (
                            <span className="detail-hanja">{prescription.hanja}</span>
                        )}
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {prescription.source && (
                    <div className="detail-source">
                        <span className="label">출전:</span> {prescription.source}
                    </div>
                )}

                {/* 구성 약재 */}
                <div className="detail-section">
                    <h3>🌿 구성 약재 {showGrams && <span className="unit-indicator">(g 변환 표시중)</span>}</h3>
                    <table className="herbs-table">
                        <thead>
                            <tr>
                                <th>약재명</th>
                                <th>한자</th>
                                <th>용량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescription.herbs.map((herb, index) => (
                                <tr key={index}>
                                    <td>{herb.name}</td>
                                    <td className="hanja-text">{herb.hanja || '-'}</td>
                                    <td>{formatDosage(herb.amount, herb.unit, showGrams, donRate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 효능 */}
                {prescription.effect && (
                    <div className="detail-section">
                        <h3>✨ 효능</h3>
                        <p>{prescription.effect}</p>
                    </div>
                )}

                {/* 주치 */}
                {prescription.indication && (
                    <div className="detail-section">
                        <h3>🎯 주치</h3>
                        <p className="indication-text">{prescription.indication}</p>
                    </div>
                )}

                {/* 구조화된 가감법 */}
                {prescription.modifications && prescription.modifications.length > 0 && (
                    <div className="detail-section">
                        <h3>⚖️ 가감법 <span className="section-count">{prescription.modifications.length}항목</span></h3>
                        <div className="mod-list">
                            {prescription.modifications.map((mod, index) => (
                                <ModificationItem key={index} mod={mod} index={index} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 가감법 원문 (구조화 데이터 없을 때 fallback) */}
                {!prescription.modifications && prescription.modification && (
                    <div className="detail-section">
                        <h3>⚖️ 가감법</h3>
                        <p className="modification-text">{prescription.modification}</p>
                    </div>
                )}

                {/* 복용법 */}
                {prescription.dosageMethod && (
                    <div className="detail-section">
                        <h3>💊 복용법</h3>
                        <p className="dosage-text">{prescription.dosageMethod}</p>
                    </div>
                )}

                {/* 적응증 */}
                {prescription.indications && prescription.indications.length > 0 && (
                    <div className="detail-section">
                        <h3>📋 적응증</h3>
                        <ul className="indications-list">
                            {prescription.indications.map((ind, i) => (
                                <li key={i}>{ind}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 메모 */}
                {prescription.notes && (
                    <div className="detail-section">
                        <h3>📝 메모</h3>
                        <p>{prescription.notes}</p>
                    </div>
                )}

                <div className="detail-meta">
                    <span>생성: {new Date(prescription.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span>수정: {new Date(prescription.updatedAt).toLocaleDateString('ko-KR')}</span>
                </div>

                <div className="detail-actions">
                    <button className="edit-btn" onClick={onEdit}>✏️ 수정</button>
                    <button className="delete-btn" onClick={handleDelete}>🗑️ 삭제</button>
                </div>
            </div>
        </div>
    );
};
