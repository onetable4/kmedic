import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { exportToJSON, importFromJSON, clearAllPrescriptions } from '../data/storage';
import type { DonConversionRate } from '../utils/unitConversion';

interface LayoutProps {
    children: ReactNode;
    onRefresh?: () => void;
    showGrams: boolean;
    donRate: DonConversionRate;
    onToggleGrams: () => void;
    onDonRateChange: (rate: DonConversionRate) => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    onRefresh,
    showGrams,
    donRate,
    onToggleGrams,
    onDonRateChange,
}) => {
    const [importing, setImporting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleExport = () => {
        exportToJSON();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const count = await importFromJSON(file);
            alert(`${count}개의 처방이 가져와졌습니다.`);
            onRefresh?.();
        } catch (err) {
            alert('파일 가져오기 실패: ' + (err as Error).message);
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const handleClear = () => {
        if (window.confirm('모든 처방을 삭제하고 새로 시작하시겠습니까?\n(되돌릴 수 없습니다)')) {
            clearAllPrescriptions();
            onRefresh?.();
        }
    };

    return (
        <div className="layout">
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">
                        <span className="logo-icon">📜</span>
                        한의학 처방 사전
                    </h1>
                    <nav className="nav">
                        {/* 새 문서(초기화) 버튼 */}
                        <button className="nav-btn" onClick={handleClear} title="새 문서 (전체 삭제)">
                            <span className="btn-icon">🗑️</span>
                            <span className="btn-text">초기화</span>
                        </button>

                        {/* 단위 토글 버튼 */}
                        <button
                            className={`nav-btn unit-toggle ${showGrams ? 'active' : ''}`}
                            onClick={onToggleGrams}
                            title="원전/g 표기 전환"
                        >
                            <span className="btn-icon">⚖️</span>
                            <span className="btn-text">{showGrams ? 'g 표시' : '원전 표기'}</span>
                        </button>

                        {/* 설정 버튼 */}
                        <button
                            className="nav-btn"
                            onClick={() => setShowSettings(!showSettings)}
                            title="단위 설정"
                        >
                            <span className="btn-icon">⚙️</span>
                            <span className="btn-text">설정</span>
                        </button>

                        <button className="nav-btn" onClick={handleExport} title="내보내기">
                            <span className="btn-icon">📤</span>
                            <span className="btn-text">내보내기</span>
                        </button>
                        <label className="nav-btn import-btn" title="가져오기">
                            <span className="btn-icon">📥</span>
                            <span className="btn-text">{importing ? '처리중...' : '가져오기'}</span>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={importing}
                                hidden
                            />
                        </label>
                    </nav>
                </div>

                {/* 설정 패널 */}
                {showSettings && (
                    <div className="settings-panel">
                        <div className="settings-group">
                            <label>1돈 변환 기준</label>
                            <div className="radio-group">
                                <label className={`radio-label ${donRate === 3.75 ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="donRate"
                                        checked={donRate === 3.75}
                                        onChange={() => onDonRateChange(3.75)}
                                    />
                                    3.75g
                                </label>
                                <label className={`radio-label ${donRate === 4 ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="donRate"
                                        checked={donRate === 4}
                                        onChange={() => onDonRateChange(4)}
                                    />
                                    4g
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </header>
            <main className="main-content">
                {children}
            </main>
            <footer className="footer">
                <p>개인 학습 참고용 · K-Medicine Prescription Dictionary</p>
            </footer>
        </div>
    );
};
