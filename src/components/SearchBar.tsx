import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string, includeHerbs: string[], excludeHerbs: string[]) => void;
    onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear }) => {
    const [query, setQuery] = useState('');
    const [includeHerbs, setIncludeHerbs] = useState('');
    const [excludeHerbs, setExcludeHerbs] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        const includeList = includeHerbs.split(',').map(s => s.trim()).filter(Boolean);
        const excludeList = excludeHerbs.split(',').map(s => s.trim()).filter(Boolean);
        onSearch(query, includeList, excludeList);
    };

    const handleClear = () => {
        setQuery('');
        setIncludeHerbs('');
        setExcludeHerbs('');
        onClear();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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
                    {showFilters ? '▲ 필터 접기' : '▼ 약재 필터'}
                </button>
                {(query || includeHerbs || excludeHerbs) && (
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
                </div>
            )}
        </div>
    );
};
