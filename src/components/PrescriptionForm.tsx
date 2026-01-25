import React, { useState, useEffect } from 'react';
import type { Prescription, PrescriptionInput, Herb } from '../types/prescription';

interface PrescriptionFormProps {
    prescription?: Prescription; // undefined면 새로 추가
    onSave: (input: PrescriptionInput) => void;
    onCancel: () => void;
}

const emptyHerb: Herb = { name: '', amount: 0, unit: '돈' };

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
    prescription,
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState('');
    const [herbs, setHerbs] = useState<Herb[]>([{ ...emptyHerb }]);
    const [source, setSource] = useState('');
    const [effect, setEffect] = useState('');
    const [indication, setIndication] = useState('');
    const [modification, setModification] = useState('');
    const [notes, setNotes] = useState('');

    // 수정 모드일 때 기존 데이터 로드
    useEffect(() => {
        if (prescription) {
            setName(prescription.name);
            setHerbs(prescription.herbs.length > 0 ? prescription.herbs : [{ ...emptyHerb }]);
            setSource(prescription.source || '');
            setEffect(prescription.effect || '');
            setIndication(prescription.indication || '');
            setModification(prescription.modification || '');
            setNotes(prescription.notes || '');
        }
    }, [prescription]);

    const handleAddHerb = () => {
        setHerbs([...herbs, { ...emptyHerb }]);
    };

    const handleRemoveHerb = (index: number) => {
        if (herbs.length > 1) {
            setHerbs(herbs.filter((_, i) => i !== index));
        }
    };

    const handleHerbChange = (index: number, field: keyof Herb, value: string | number) => {
        const updated = [...herbs];
        updated[index] = { ...updated[index], [field]: value };
        setHerbs(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (!name.trim()) {
            alert('처방명을 입력해주세요.');
            return;
        }

        const validHerbs = herbs.filter(h => h.name.trim());
        if (validHerbs.length === 0) {
            alert('최소 1개 이상의 약재를 입력해주세요.');
            return;
        }

        const input: PrescriptionInput = {
            name: name.trim(),
            herbs: validHerbs,
            source: source.trim() || undefined,
            effect: effect.trim() || undefined,
            indication: indication.trim() || undefined,
            modification: modification.trim() || undefined,
            notes: notes.trim() || undefined,
        };

        onSave(input);
    };

    return (
        <div className="form-overlay" onClick={onCancel}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                    <h2>{prescription ? '처방 수정' : '새 처방 추가'}</h2>
                    <button className="close-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="required">처방명</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 사군자탕"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">구성 약재</label>
                        <div className="herbs-input">
                            {herbs.map((herb, index) => (
                                <div key={index} className="herb-row">
                                    <input
                                        type="text"
                                        className="herb-name"
                                        value={herb.name}
                                        onChange={(e) => handleHerbChange(index, 'name', e.target.value)}
                                        placeholder="약재명"
                                    />
                                    <input
                                        type="number"
                                        className="herb-amount"
                                        value={herb.amount || ''}
                                        onChange={(e) => handleHerbChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder="용량"
                                        min="0"
                                        step="0.1"
                                    />
                                    <select
                                        className="herb-unit"
                                        value={herb.unit}
                                        onChange={(e) => handleHerbChange(index, 'unit', e.target.value)}
                                    >
                                        <option value="돈">돈</option>
                                        <option value="냥">냥</option>
                                        <option value="g">g</option>
                                        <option value="錢">錢</option>
                                        <option value="兩">兩</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="remove-herb-btn"
                                        onClick={() => handleRemoveHerb(index)}
                                        disabled={herbs.length === 1}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="add-herb-btn" onClick={handleAddHerb}>
                                ➕ 약재 추가
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>출전</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="예: 태평혜민화제국방, 동의보감"
                        />
                    </div>

                    <div className="form-group">
                        <label>효능</label>
                        <textarea
                            value={effect}
                            onChange={(e) => setEffect(e.target.value)}
                            placeholder="처방의 효능을 입력하세요"
                            rows={2}
                        />
                    </div>

                    <div className="form-group">
                        <label>주치</label>
                        <textarea
                            value={indication}
                            onChange={(e) => setIndication(e.target.value)}
                            placeholder="주치 증상을 입력하세요"
                            rows={2}
                        />
                    </div>

                    <div className="form-group">
                        <label>가감법</label>
                        <textarea
                            value={modification}
                            onChange={(e) => setModification(e.target.value)}
                            placeholder="가감법을 입력하세요"
                            rows={2}
                        />
                    </div>

                    <div className="form-group">
                        <label>메모</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="개인 메모"
                            rows={2}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            취소
                        </button>
                        <button type="submit" className="save-btn">
                            {prescription ? '수정 완료' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
