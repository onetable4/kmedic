import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string, includeHerbs: string[], excludeHerbs: string[], modHerb: string, modAction: string) => void;
    onClear: () => void;
}

const ACTION_OPTIONS = [
    { value: '', label: '전체' },
    { value: '加', label: '加 (가)' },
    { value: '去', label: '去 (거)' },
    { value: '倍', label: '倍 (배)' },
    { value: '增量', label: '增量' },
    { value: '合方', label: '合方' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear }) => {
    const [query, setQuery] = useState('');
    const [includeHerbs, setIncludeHerbs] = useState('');
    const [excludeHerbs, setExcludeHerbs] = useState('');
    const [modHerb, setModHerb] = useState('');
    const [modAction, setModAction] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        const includeList = includeHerbs.split(',').map(s => s.trim()).filter(Boolean);
        const excludeList = excludeHerbs.split(',').map(s => s.trim()).filter(Boolean);
        onSearch(query, includeList, excludeList, modHerb, modAction);
    };

    const handleClear = () => {
        setQuery('');
        setIncludeHerbs('');
        setExcludeHerbs('');
        setModHerb('');
        setModAction('');
        onClear();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const hasFilters = query || includeHerbs || excludeHerbs || modHerb || modAction;

    return (
        <div className="search-bar">
            <div className="search-main">
                <input
                    type="text"
                    className="search-input"
                    placeholder="처방명으로 검색..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="search-btn" onClick={handleSearch}>
                    🔍 검색
                </button>
                <button
                    className="filter-toggle-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? '▲ 필터 접기' : '▼ 상세 필터'}
                </button>
                {hasFilters && (
                    <button className="clear-btn" onClick={handleClear}>
                        ✕ 초기화
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="search-filters">
                    <div className="filter-group">
                        <label>포함할 약재 (쉼표로 구분)</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="예: 인삼, 황기"
                            value={includeHerbs}
                            onChange={(e) => setIncludeHerbs(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="filter-group">
                        <label>제외할 약재 (쉼표로 구분)</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="예: 부자, 마황"
                            value={excludeHerbs}
                            onChange={(e) => setExcludeHerbs(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-row">
                        <div className="filter-group filter-group-mod">
                            <label>가감 본초 검색</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="예: 인삼, 人蔘"
                                value={modHerb}
                                onChange={(e) => setModHerb(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="filter-group filter-group-action">
                            <label>액션</label>
                            <select
                                className="filter-select"
                                value={modAction}
                                onChange={(e) => setModAction(e.target.value)}
                            >
                                {ACTION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className="filter-hint">
                        💡 가감법에서 특정 약재가 加/去/倍 되는 처방을 검색합니다
                    </p>
                </div>
            )}
        </div>
    );
};
