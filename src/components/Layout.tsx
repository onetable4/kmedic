import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { exportToJSON, importFromJSON } from '../data/storage';

interface LayoutProps {
    children: ReactNode;
    onRefresh?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onRefresh }) => {
    const [importing, setImporting] = useState(false);

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

    return (
        <div className="layout">
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">
                        <span className="logo-icon">📜</span>
                        한의학 처방 사전
                    </h1>
                    <nav className="nav">
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
