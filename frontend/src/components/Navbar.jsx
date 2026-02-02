import React from 'react';
import './Navbar.css';

const Navbar = ({ activeTab, onTabChange }) => {
    return (
        <nav className="navbar glass-card">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">🔍</span>
                    <span className="brand-text">NameCheck</span>
                </div>

                <div className="navbar-tabs">
                    <button
                        className={`nav-tab ${activeTab === 'username' ? 'active' : ''}`}
                        onClick={() => onTabChange('username')}
                    >
                        <span className="tab-icon">@</span>
                        <span className="tab-text">Username</span>
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'domain' ? 'active' : ''}`}
                        onClick={() => onTabChange('domain')}
                    >
                        <span className="tab-icon">🌐</span>
                        <span className="tab-text">Domain</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
