import React from 'react';
import type { Prescription } from '../types/prescription';
import { PrescriptionCard } from './PrescriptionCard';

interface PrescriptionListProps {
    prescriptions: Prescription[];
    onSelect: (prescription: Prescription) => void;
    onAdd: () => void;
}

export const PrescriptionList: React.FC<PrescriptionListProps> = ({
    prescriptions,
    onSelect,
    onAdd
}) => {
    return (
        <div className="prescription-list">
            <div className="list-header">
                <h2 className="list-title">
                    처방 목록
                    <span className="list-count">({prescriptions.length}개)</span>
                </h2>
                <button className="add-btn" onClick={onAdd}>
                    ➕ 새 처방 추가
                </button>
            </div>

            {prescriptions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>등록된 처방이 없습니다.</p>
                    <button className="add-btn-large" onClick={onAdd}>
                        첫 번째 처방 추가하기
                    </button>
                </div>
            ) : (
                <div className="card-grid">
                    {prescriptions.map(prescription => (
                        <PrescriptionCard
                            key={prescription.id}
                            prescription={prescription}
                            onClick={() => onSelect(prescription)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
