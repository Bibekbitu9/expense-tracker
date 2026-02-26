'use client';

import React, { useState, useCallback } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import DateFilter from '@/components/DateFilter';
import Dashboard from '@/components/Dashboard';
import ThemeToggle from '@/components/ThemeToggle';
import ToastContainer, { useToast } from '@/components/Toast';
import { Expense } from '@/lib/types';
import { fetchExpenses, filterByDateRange, expensesToCsv } from '@/lib/api';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filtered, setFiltered] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [currentStart, setCurrentStart] = useState('');
  const [currentEnd, setCurrentEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'report'>('add');
  const { toasts, addToast } = useToast();

  const loadData = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setCurrentStart(startDate);
    setCurrentEnd(endDate);
    try {
      const data = await fetchExpenses();
      setExpenses(data);
      const filteredData = filterByDateRange(data, startDate, endDate);
      setFiltered(filteredData);
      setHasData(true);
      if (filteredData.length === 0) {
        addToast('No expenses found for the selected range', 'error');
      } else {
        addToast(`Loaded ${filteredData.length} expense${filteredData.length > 1 ? 's' : ''}`, 'success');
      }
    } catch {
      addToast('Failed to fetch data. Check your Script URL.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleExpenseAdded = () => {
    if (hasData) {
      loadData(currentStart, currentEnd);
    }
  };

  const handleClear = () => {
    setExpenses([]);
    setFiltered([]);
    setHasData(false);
    setCurrentStart('');
    setCurrentEnd('');
  };

  const handleDownloadCsv = () => {
    const csv = expensesToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV downloaded!', 'success');
  };

  const handleExportPdf = async () => {
    const { exportPdf } = await import('@/lib/exportPdf');
    exportPdf(filtered, currentStart, currentEnd);
    addToast('PDF exported!', 'success');
  };

  return (
    <main className="app-container">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <header className="header fade-in">
        <h1>💎 Expense Intelligence</h1>
        <div className="header-actions">
          {hasData && filtered.length > 0 && (
            <>
              <button className="btn-icon" onClick={handleDownloadCsv} title="Download CSV" id="csv-btn">
                📥
              </button>
              <button className="btn-icon" onClick={handleExportPdf} title="Export PDF" id="pdf-btn">
                📄
              </button>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="fade-in fade-in-delay-1" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        padding: '4px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        marginBottom: '16px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <button
          onClick={() => setActiveTab('add')}
          id="tab-add"
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: activeTab === 'add' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'add' ? 'white' : 'var(--text-muted)',
            boxShadow: activeTab === 'add' ? '0 4px 15px var(--accent-glow)' : 'none',
          }}
        >
          ➕ Add Expense
        </button>
        <button
          onClick={() => setActiveTab('report')}
          id="tab-report"
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: activeTab === 'report' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'report' ? 'white' : 'var(--text-muted)',
            boxShadow: activeTab === 'report' ? '0 4px 15px var(--accent-glow)' : 'none',
          }}
        >
          📊 Report
        </button>
      </div>

      {/* Tab Content */}
      <div className="fade-in fade-in-delay-2" style={{ marginBottom: '20px' }}>
        {activeTab === 'add' ? (
          <ExpenseForm onExpenseAdded={handleExpenseAdded} onToast={addToast} />
        ) : (
          <DateFilter onFilter={loadData} onClear={handleClear} loading={loading} />
        )}
      </div>

      {/* Dashboard */}
      {hasData && <Dashboard expenses={filtered} />}

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 0 16px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.02em',
      }}>
        Expense Intelligence • Built with Next.js + Google Sheets
      </footer>
    </main>
  );
}
