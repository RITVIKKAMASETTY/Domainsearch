import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UsernameSearch from './components/UsernameSearch';
import DomainSearch from './components/DomainSearch';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('username');
    const searchRef = useRef(null);

    const scrollToSearch = () => {
        searchRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTimeout(() => {
            searchRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="app">
            <div className="animated-bg"></div>

            <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

            <main className="main-content">
                <div className="container">
                    <Hero onScrollToSearch={scrollToSearch} activeTab={activeTab} />
                    <div ref={searchRef}>
                        {activeTab === 'username' ? (
                            <UsernameSearch />
                        ) : (
                            <DomainSearch />
                        )}
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p className="footer-text">
                        Made with ❤️ by mystartupwave
                    </p>
                    <p className="footer-info">
                        {activeTab === 'username'
                            ? 'Checking availability across 10+ platforms instantly'
                            : 'WHOIS domain lookup powered by WhoisXML API'
                        }
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
