'use client';

import React from 'react';
import { Expense, BUDGET_LIMIT } from '@/lib/types';
import {
    getTotalSpend,
    getTopCategory,
    getAveragePerMonth,
    getPercentChange,
    getCategoryBreakdown,
    getMonthlyTotals,
    formatCurrency,
} from '@/lib/api';
import CategoryPieChart from './charts/CategoryPieChart';
import MonthlyBarChart from './charts/MonthlyBarChart';
import SpendingTrendLine from './charts/SpendingTrendLine';

interface DashboardProps {
    expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
    if (expenses.length === 0) {
        return (
            <div className="card fade-in">
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>No expenses found. Add some expenses or adjust your date range.</p>
                </div>
            </div>
        );
    }

    const total = getTotalSpend(expenses);
    const topCategory = getTopCategory(expenses);
    const avgPerMonth = getAveragePerMonth(expenses);
    const percentChange = getPercentChange(expenses);
    const categoryBreakdown = getCategoryBreakdown(expenses);
    const monthlyTotals = getMonthlyTotals(expenses);

    // Current month total for budget comparison
    const now = new Date();
    const currentMonthKey = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]} ${now.getFullYear()}`;
    const currentMonthTotal = monthlyTotals.find(m => m.label === currentMonthKey)?.amount || 0;
    const currentBudgetPercent = Math.min((currentMonthTotal / BUDGET_LIMIT) * 100, 100);
    const currentBudgetStatus = currentBudgetPercent < 60 ? 'safe' : currentBudgetPercent < 85 ? 'caution' : 'danger';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stats Grid — 2x2 on mobile, 4 across on tablet+ */}
            <div className="grid-4 fade-in fade-in-delay-2">
                <div className="card stat-card">
                    <div className="stat-icon purple">💰</div>
                    <div className="card-title">Total Spend</div>
                    <div className="card-value accent">{formatCurrency(total)}</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon green">🏆</div>
                    <div className="card-title">Top Category</div>
                    <div className="card-value" style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>{topCategory}</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon amber">📈</div>
                    <div className="card-title">Avg / Month</div>
                    <div className="card-value" style={{ fontSize: '1.1rem' }}>{formatCurrency(avgPerMonth)}</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon rose">📊</div>
                    <div className="card-title">vs Prev Month</div>
                    <div className="card-value" style={{ fontSize: '1.1rem' }}>
                        {percentChange !== null ? (
                            <span style={{
                                color: percentChange > 0 ? '#f87171' : '#34d399',
                                textShadow: percentChange > 0
                                    ? '0 0 10px rgba(248,113,113,0.3)'
                                    : '0 0 10px rgba(52,211,153,0.3)',
                            }}>
                                {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                            </span>
                        ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget Bar */}
            <div className="card fade-in fade-in-delay-3">
                <h3 className="section-title">💳 Monthly Budget</h3>
                <div className="budget-bar-container">
                    <div className="budget-bar-header">
                        <span>{formatCurrency(currentMonthTotal)} spent</span>
                        <span>{formatCurrency(BUDGET_LIMIT)} limit</span>
                    </div>
                    <div className="budget-bar">
                        <div
                            className={`budget-bar-fill ${currentBudgetStatus}`}
                            style={{ width: `${currentBudgetPercent}%` }}
                        />
                    </div>
                    {currentBudgetPercent >= 85 && (
                        <p style={{
                            color: '#f87171',
                            fontSize: '0.82rem',
                            marginTop: '10px',
                            fontWeight: 500,
                            textShadow: '0 0 10px rgba(248,113,113,0.2)',
                        }}>
                            ⚠️ You&apos;ve used {currentBudgetPercent.toFixed(0)}% of your monthly budget!
                        </p>
                    )}
                </div>
            </div>

            {/* Charts — stacked on mobile, side-by-side on desktop */}
            <div className="grid-2 fade-in fade-in-delay-4">
                <div className="card">
                    <h3 className="section-title">🥧 Categories</h3>
                    <div className="chart-container">
                        <CategoryPieChart data={categoryBreakdown} total={total} />
                    </div>
                </div>

                <div className="card">
                    <h3 className="section-title">📊 Monthly</h3>
                    <div className="chart-container">
                        <MonthlyBarChart data={monthlyTotals} />
                    </div>
                </div>
            </div>

            {/* Trend Line */}
            <div className="card fade-in">
                <h3 className="section-title">📈 Spending Trend</h3>
                <div className="chart-container">
                    <SpendingTrendLine data={monthlyTotals} />
                </div>
            </div>

            {/* Category Breakdown — scrollable on mobile */}
            <div className="card fade-in">
                <h3 className="section-title">📋 Breakdown</h3>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>%</th>
                                <th style={{ minWidth: '80px' }}>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryBreakdown.map((item) => {
                                const pct = (item.amount / total) * 100;
                                return (
                                    <tr key={item.category}>
                                        <td style={{ fontWeight: 500, fontSize: '0.8rem' }}>{item.category}</td>
                                        <td style={{ fontSize: '0.8rem' }}>{formatCurrency(item.amount)}</td>
                                        <td style={{ fontSize: '0.8rem' }}>{pct.toFixed(1)}%</td>
                                        <td>
                                            <div className="category-bar">
                                                <div
                                                    className="category-bar-fill"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
