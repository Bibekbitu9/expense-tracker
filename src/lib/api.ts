import { Expense, MONTH_ORDER } from './types';

export async function addExpense(expense: {
    date: string;
    category: string;
    amount: number;
    note: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
        });

        const data = await res.json();
        return data;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, message: `Network error: ${msg}` };
    }
}

export async function fetchExpenses(): Promise<Expense[]> {
    const res = await fetch('/api/expenses', {
        method: 'GET',
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    return data.data.map((row: Record<string, unknown>) => ({
        date: String(row.date || ''),
        category: String(row.category || ''),
        amount: Number(row.amount) || 0,
        note: String(row.note || ''),
        month: String(row.month || ''),
        year: Number(row.year) || 0,
    }));
}

export function filterByDateRange(
    expenses: Expense[],
    startDate?: string,
    endDate?: string
): Expense[] {
    if (!startDate && !endDate) return expenses;

    // Parse YYYY-MM-DD as local time (not UTC) to avoid timezone issues
    const parseLocalDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const start = startDate ? parseLocalDate(startDate) : null;
    const end = endDate ? parseLocalDate(endDate) : null;

    // Make end date inclusive (set to end of day)
    if (end) {
        end.setHours(23, 59, 59, 999);
    }

    return expenses.filter((exp) => {
        const parts = exp.date.split('/');
        const expDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0])
        );

        if (start && expDate < start) return false;
        if (end && expDate > end) return false;
        return true;
    });
}

export function getCategoryBreakdown(expenses: Expense[]) {
    const map: Record<string, number> = {};
    expenses.forEach((exp) => {
        map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });
    return Object.entries(map)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyTotals(expenses: Expense[]) {
    const map: Record<string, number> = {};
    expenses.forEach((exp) => {
        const key = `${exp.month} ${exp.year}`;
        map[key] = (map[key] || 0) + exp.amount;
    });

    return Object.entries(map)
        .map(([label, amount]) => {
            const [month, year] = label.split(' ');
            return { label, month, year: parseInt(year), amount };
        })
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month);
        });
}

export function getTotalSpend(expenses: Expense[]): number {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

export function getTopCategory(expenses: Expense[]): string {
    const breakdown = getCategoryBreakdown(expenses);
    return breakdown.length > 0 ? breakdown[0].category : 'N/A';
}

export function getAveragePerMonth(expenses: Expense[]): number {
    const monthly = getMonthlyTotals(expenses);
    if (monthly.length === 0) return 0;
    const total = monthly.reduce((sum, m) => sum + m.amount, 0);
    return total / monthly.length;
}

export function getPercentChange(expenses: Expense[]): number | null {
    const monthly = getMonthlyTotals(expenses);
    if (monthly.length < 2) return null;
    const current = monthly[monthly.length - 1].amount;
    const previous = monthly[monthly.length - 2].amount;
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function expensesToCsv(expenses: Expense[]): string {
    const header = 'Date,Category,Amount,Note,Month,Year';
    const rows = expenses.map(
        (e) => `"${e.date}","${e.category}",${e.amount},"${e.note}","${e.month}",${e.year}`
    );
    return [header, ...rows].join('\n');
}
