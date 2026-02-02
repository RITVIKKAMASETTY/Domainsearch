import React, { useState } from 'react';
import { useDomainCheck } from '../hooks/useDomainCheck';
import './DomainSearch.css';

const DomainSearch = () => {
    const {
        domain,
        setDomain,
        isLoading,
        error,
        result,
        checkDomain,
    } = useDomainCheck();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (domain.trim()) {
            checkDomain(domain.trim());
        }
    };

    const handleClear = () => {
        setDomain('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <section className="domain-section" id="domain-search">
            <div className="container">
                <div className="search-header">
                    <h2 className="section-title">Check Domain Availability</h2>
                    <p className="section-subtitle">
                        Enter a domain name and click search to check if it's registered
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="search-form glass-card">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🌐</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="example.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            spellCheck="false"
                        />
                        {domain && (
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
                            disabled={isLoading || !domain.trim()}
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

                {result && <DomainResult data={result} />}
            </div>
        </section>
    );
};

const DomainResult = ({ data }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    if (data.error) {
        return (
            <div className="domain-result glass-card error-state">
                <div className="result-header">
                    <span className="status-icon error">❌</span>
                    <div>
                        <h3 className="domain-name">{data.domain_name}</h3>
                        <p className="error-message">{data.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="domain-result-wrapper fade-in-up">
            <div className={`domain-result glass-card ${data.domain_exists ? 'registered' : 'available'}`}>
                <div className="result-header">
                    <span className={`status-icon ${data.domain_exists ? 'registered' : 'available'}`}>
                        {data.domain_exists ? '🔒' : '✅'}
                    </span>
                    <div className="result-info">
                        <h3 className="domain-name">{data.domain_name}</h3>
                        <span className={`status-badge ${data.domain_exists ? 'registered' : 'available'}`}>
                            {data.domain_exists ? 'Registered' : 'Available!'}
                        </span>
                    </div>
                </div>

                {data.domain_exists && (
                    <div className="whois-details">
                        <div className="detail-grid">
                            <DetailCard
                                icon="🏢"
                                label="Registrar"
                                value={data.registrar || 'Unknown'}
                            />
                            <DetailCard
                                icon="📅"
                                label="Created"
                                value={formatDate(data.creation_date)}
                            />
                            <DetailCard
                                icon="⏰"
                                label="Expires"
                                value={formatDate(data.expiration_date)}
                            />
                            <DetailCard
                                icon="🖥️"
                                label="Name Servers"
                                value={data.name_servers.length > 0 ? data.name_servers.length + ' servers' : 'N/A'}
                            />
                        </div>

                        {data.name_servers.length > 0 && (
                            <div className="nameservers-section">
                                <h4 className="section-label">
                                    <span className="label-icon">🌍</span>
                                    Name Servers
                                </h4>
                                <div className="nameservers-list">
                                    {data.name_servers.map((ns, index) => (
                                        <span key={index} className="nameserver-chip">
                                            {ns.toLowerCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!data.domain_exists && (
                    <div className="available-message">
                        <p className="available-text">
                            🎉 Great news! This domain appears to be available for registration.
                        </p>
                        <p className="available-hint">
                            Visit your preferred domain registrar to secure it now!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailCard = ({ icon, label, value }) => {
    return (
        <div className="detail-card">
            <span className="detail-icon">{icon}</span>
            <div className="detail-content">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
            </div>
        </div>
    );
};

export default DomainSearch;
