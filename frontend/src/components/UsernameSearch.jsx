import React, { useState } from 'react';
import { useUsernameCheck } from '../hooks/useUsernameCheck';
import './UsernameSearch.css';

const UsernameSearch = () => {
    const {
        username,
        setUsername,
        isLoading,
        error,
        results,
        checkUsername,
    } = useUsernameCheck();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            checkUsername(username.trim());
        }
    };

    const handleClear = () => {
        setUsername('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <section className="search-section" id="search">
            <div className="container">
                <div className="search-header">
                    <h2 className="section-title">Check Username Availability</h2>
                    <p className="section-subtitle">
                        Enter your desired username and click search to check availability across all platforms
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="search-form glass-card">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Enter username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            spellCheck="false"
                        />
                        {username && (
                            <button
                                type="button"
                                className="clear-btn"
                                onClick={handleClear}
                                aria-label="Clear input"
                            >
                                ✕
                            </button>
                        )}
                        <button
                            type="submit"
                            className="search-btn"
                            disabled={isLoading || !username.trim()}
                        >
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="search-error">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}
                </form>

                {results && <Results data={results} />}
            </div>
        </section>
    );
};

const Results = ({ data }) => {
    const availableCount = data.results.filter(r => r.available && !r.error).length;
    const totalCount = data.results.filter(r => !r.error).length;

    return (
        <div className="results-wrapper">
            <div className="results-header">
                <h3 className="results-title">
                    Results for <span className="username-highlight">@{data.username}</span>
                </h3>
                <div className="results-summary">
                    <div className={`summary-badge ${data.all_available ? 'success' : 'warning'}`}>
                        {availableCount} / {totalCount} Available
                    </div>
                </div>
            </div>

            <div className="platforms-grid">
                {data.results.map((platform) => (
                    <PlatformCard key={platform.platform} platform={platform} />
                ))}
            </div>

            {!data.all_available && data.suggestions.length > 0 && (
                <div className="suggestions-section">
                    <h4 className="suggestions-title">
                        <span className="suggestion-icon">💡</span>
                        Suggested Alternatives
                    </h4>
                    <div className="suggestions-grid">
                        {data.suggestions.map((suggestion, index) => (
                            <SuggestionChip key={index} suggestion={suggestion} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PlatformCard = ({ platform }) => {
    const getStatusColor = () => {
        if (platform.error) return 'neutral';
        return platform.available ? 'success' : 'unavailable';
    };

    const getPlatformIcon = (name) => {
        const icons = {
            twitter: '🐦',
            instagram: '📸',
            github: '💻',
            tiktok: '🎵',
            youtube: '▶️',
            reddit: '🤖',
            pinterest: '📌',
            linkedin: '💼',
            twitch: '🎮',
            snapchat: '👻',
        };
        return icons[name] || '🌐';
    };

    return (
        <div className={`platform-card glass-card status-${getStatusColor()}`}>
            <div className="platform-header">
                <span className="platform-icon">{getPlatformIcon(platform.platform)}</span>
                <span className="platform-name">{platform.platform}</span>
            </div>

            <div className="platform-status">
                {platform.error ? (
                    <span className="status-text error">Error</span>
                ) : platform.available ? (
                    <span className="status-text available">✓ Available</span>
                ) : (
                    <span className="status-text taken">✕ Taken</span>
                )}
            </div>

            {!platform.error && (
                <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="platform-link"
                >
                    Visit →
                </a>
            )}
        </div>
    );
};

const SuggestionChip = ({ suggestion }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(suggestion);
    };

    return (
        <button className="suggestion-chip glass-card" onClick={handleCopy} title="Click to copy">
            <span className="suggestion-text">@{suggestion}</span>
            <span className="copy-icon">📋</span>
        </button>
    );
};

export default UsernameSearch;
