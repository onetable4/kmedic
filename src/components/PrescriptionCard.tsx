import React from 'react';
import type { Prescription } from '../types/prescription';
import type { DonConversionRate } from '../utils/unitConversion';
import { formatDosage } from '../utils/unitConversion';

interface PrescriptionCardProps {
    prescription: Prescription;
    onClick: () => void;
    showGrams: boolean;
    donRate: DonConversionRate;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
    prescription,
    onClick,
    showGrams,
    donRate,
}) => {
    // 주요 약재 표시 (최대 5개)
    const mainHerbs = prescription.herbs.slice(0, 5);
    const remainingCount = prescription.herbs.length - 5;

    return (
        <div className="prescription-card" onClick={onClick}>
            <div className="card-header">
                <h3 className="card-title">{prescription.name}</h3>
                {prescription.source && (
                    <span className="card-source">{prescription.source}</span>
                )}
            </div>

            <div className="card-herbs">
                {mainHerbs.map((herb, index) => (
                    <span key={index} className="herb-tag">
                        {herb.name} {formatDosage(herb.amount, herb.unit, showGrams, donRate)}
                    </span>
                ))}
                {remainingCount > 0 && (
                    <span className="herb-more">+{remainingCount}개</span>
                )}
            </div>

            {prescription.effect && (
                <p className="card-effect">{prescription.effect}</p>
            )}

            <div className="card-badges">
                {prescription.modifications && prescription.modifications.length > 0 && (
                    <span className="card-mod-badge">⚖️ 가감 {prescription.modifications.length}</span>
                )}
                {prescription.dosageMethod && (
                    <span className="card-dosage-badge">💊 복용법</span>
                )}
            </div>
        </div>
    );
};
