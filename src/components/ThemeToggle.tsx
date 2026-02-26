'use client';

import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('expense-theme');
        if (saved === 'light') {
            setDark(false);
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            // Default to dark — clear any old theme keys
            setDark(true);
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme'); // Clean old key
        }
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        if (next) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('expense-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('expense-theme', 'light');
        }
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return <div style={{ width: 52, height: 28 }} />;

    return (
        <button
            className="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-btn"
        >
            <div className="theme-toggle-thumb">
                {dark ? '🌙' : '☀️'}
            </div>
        </button>
    );
}
