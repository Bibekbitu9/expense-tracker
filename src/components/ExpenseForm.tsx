'use client';

import React, { useState } from 'react';
import { CATEGORIES } from '@/lib/types';
import { addExpense } from '@/lib/api';

interface ExpenseFormProps {
    onExpenseAdded: () => void;
    onToast: (message: string, type: 'success' | 'error') => void;
}

export default function ExpenseForm({ onExpenseAdded, onToast }: ExpenseFormProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !category || !amount) {
            onToast('Please fill all required fields', 'error');
            return;
        }

        if (parseFloat(amount) <= 0) {
            onToast('Amount must be greater than 0', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await addExpense({
                date,
                category,
                amount: parseFloat(amount),
                note,
            });

            if (result.success) {
                onToast('Expense Added Successfully ✅', 'success');
                // Reset form
                setCategory('');
                setAmount('');
                setNote('');
                onExpenseAdded();
            } else {
                onToast(result.message || 'Failed to add expense', 'error');
            }
        } catch {
            onToast('Failed to add expense. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in">
            <h2 className="section-title">➕ Add Expense</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label" htmlFor="expense-date">Date *</label>
                        <input
                            id="expense-date"
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="expense-category">Category *</label>
                        <select
                            id="expense-category"
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="expense-amount">Amount (₹) *</label>
                        <input
                            id="expense-amount"
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="expense-note">Note (optional)</label>
                        <input
                            id="expense-note"
                            type="text"
                            className="form-input"
                            placeholder="e.g., Weekly groceries"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="form-group full-width" style={{ marginTop: '4px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="add-expense-btn">
                            {loading ? (
                                <>
                                    <span className="spinner" /> Adding...
                                </>
                            ) : (
                                'Add Expense'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
