'use client';

import React, { useState } from 'react';

interface DateFilterProps {
    onFilter: (startDate: string, endDate: string) => void;
    onClear: () => void;
    loading: boolean;
}

export default function DateFilter({ onFilter, onClear, loading }: DateFilterProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(startDate, endDate);
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onClear();
    };

    return (
        <div className="card fade-in fade-in-delay-1">
            <h2 className="section-title">📊 Generate Report</h2>
            <form onSubmit={handleSubmit}>
                <div className="filter-bar">
                    <div className="form-group">
                        <label className="form-label" htmlFor="start-date">Start Date</label>
                        <input
                            id="start-date"
                            type="date"
                            className="form-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="end-date">End Date</label>
                        <input
                            id="end-date"
                            type="date"
                            className="form-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} id="generate-report-btn">
                        {loading ? (
                            <>
                                <span className="spinner" /> Loading...
                            </>
                        ) : (
                            'Generate Report'
                        )}
                    </button>

                    {(startDate || endDate) && (
                        <button type="button" className="btn btn-secondary" onClick={handleClear}>
                            Clear
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
