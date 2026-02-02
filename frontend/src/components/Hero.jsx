import React from 'react';
import './Hero.css';

const Hero = ({ onScrollToSearch, activeTab = 'username' }) => {
    const isUsername = activeTab === 'username';

    return (
        <section className="hero">
            <div className="hero-content fade-in-up">
                <div className="hero-badge">
                    <span className="badge-icon">{isUsername ? '✨' : '🌐'}</span>
                    <span>{isUsername ? 'Find Your Perfect Username' : 'Check Domain Availability'}</span>
                </div>

                <h1 className="hero-title">
                    {isUsername ? 'Claim Your Digital' : 'Find Your Perfect'}
                    <span className="gradient-text">{isUsername ? ' Identity' : ' Domain'}</span>
                </h1>

                <p className="hero-subtitle">
                    {isUsername
                        ? 'Instantly check if your desired username is available across all major social media platforms. Get smart suggestions if taken.'
                        : 'Quickly check if your dream domain is available. Get detailed WHOIS information including registrar, dates, and name servers.'
                    }
                </p>

                <div className="hero-cta">
                    <button
                        className="btn btn-primary btn-large"
                        onClick={onScrollToSearch}
                    >
                        {isUsername ? 'Start Searching' : 'Check Domain'}
                        <span className="btn-arrow">→</span>
                    </button>
                </div>

                <div className="hero-stats">
                    {isUsername ? (
                        <>
                            <div className="stat-item">
                                <div className="stat-number">10+</div>
                                <div className="stat-label">Platforms</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">Instant</div>
                                <div className="stat-label">Results</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">Smart</div>
                                <div className="stat-label">Suggestions</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="stat-item">
                                <div className="stat-number">WHOIS</div>
                                <div className="stat-label">Lookup</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">Fast</div>
                                <div className="stat-label">Results</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">Detailed</div>
                                <div className="stat-label">Info</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="hero-visual">
                <img
                    src="/hero-illustration.png"
                    alt={isUsername ? 'Username Finder Illustration' : 'Domain Checker Illustration'}
                    className="hero-image"
                />
                {isUsername ? (
                    <>
                        <div className="floating-icon icon-1">🐦</div>
                        <div className="floating-icon icon-2">📸</div>
                        <div className="floating-icon icon-3">💻</div>
                        <div className="floating-icon icon-4">🎵</div>
                    </>
                ) : (
                    <>
                        <div className="floating-icon icon-1">🌐</div>
                        <div className="floating-icon icon-2">🔒</div>
                        <div className="floating-icon icon-3">📡</div>
                        <div className="floating-icon icon-4">🖥️</div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Hero;
