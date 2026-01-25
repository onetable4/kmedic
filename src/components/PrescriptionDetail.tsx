import React from 'react';
import type { Prescription } from '../types/prescription';
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
                    <h2 className="detail-title">{prescription.name}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {prescription.source && (
                    <div className="detail-source">
                        <span className="label">출전:</span> {prescription.source}
                    </div>
                )}

                <div className="detail-section">
                    <h3>구성 약재 {showGrams && <span className="unit-indicator">(g 변환 표시중)</span>}</h3>
                    <table className="herbs-table">
                        <thead>
                            <tr>
                                <th>약재명</th>
                                <th>용량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescription.herbs.map((herb, index) => (
                                <tr key={index}>
                                    <td>{herb.name}</td>
                                    <td>{formatDosage(herb.amount, herb.unit, showGrams, donRate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {prescription.effect && (
                    <div className="detail-section">
                        <h3>효능</h3>
                        <p>{prescription.effect}</p>
                    </div>
                )}

                {prescription.indication && (
                    <div className="detail-section">
                        <h3>주치</h3>
                        <p>{prescription.indication}</p>
                    </div>
                )}

                {prescription.modification && (
                    <div className="detail-section">
                        <h3>가감법</h3>
                        <p>{prescription.modification}</p>
                    </div>
                )}

                {prescription.notes && (
                    <div className="detail-section">
                        <h3>메모</h3>
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
