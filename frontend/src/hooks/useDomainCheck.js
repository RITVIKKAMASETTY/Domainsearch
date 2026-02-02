import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Custom hook for checking domain availability
 * @returns {Object} Hook state and methods
 */
export const useDomainCheck = () => {
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const debouncedDomain = useDebounce(domain, 600);

    const checkDomain = useCallback(async (domainToCheck) => {
        if (!domainToCheck || domainToCheck.length < 3) {
            setResult(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/check-domain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain_name: domainToCheck }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to check domain availability');
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDomainChange = useCallback((newDomain) => {
        setDomain(newDomain);
    }, []);

    const triggerCheck = useCallback(() => {
        if (debouncedDomain) {
            checkDomain(debouncedDomain);
        } else {
            setResult(null);
        }
    }, [debouncedDomain, checkDomain]);

    return {
        domain,
        setDomain: handleDomainChange,
        isLoading,
        error,
        result,
        checkDomain,
        triggerCheck,
        debouncedDomain,
    };
};
