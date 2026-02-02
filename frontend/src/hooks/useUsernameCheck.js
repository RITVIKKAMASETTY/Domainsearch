import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Custom hook for checking username availability
 * @returns {Object} Hook state and methods
 */
export const useUsernameCheck = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const debouncedUsername = useDebounce(username, 600);

    const checkUsername = useCallback(async (usernameToCheck) => {
        if (!usernameToCheck || usernameToCheck.length < 2) {
            setResults(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameToCheck }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message || 'Failed to check username availability');
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-check when debounced username changes
    const handleUsernameChange = useCallback((newUsername) => {
        setUsername(newUsername);
    }, []);

    // Trigger check when debounced value changes
    const triggerCheck = useCallback(() => {
        if (debouncedUsername) {
            checkUsername(debouncedUsername);
        } else {
            setResults(null);
        }
    }, [debouncedUsername, checkUsername]);

    return {
        username,
        setUsername: handleUsernameChange,
        isLoading,
        error,
        results,
        checkUsername,
        triggerCheck,
        debouncedUsername,
    };
};
