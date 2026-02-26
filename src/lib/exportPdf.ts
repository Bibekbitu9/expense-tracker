import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, BUDGET_LIMIT } from './types';
import { formatCurrency, getCategoryBreakdown, getTotalSpend, getTopCategory, getAveragePerMonth } from './api';

export function exportPdf(expenses: Expense[], startDate?: string, endDate?: string) {
    const doc = new jsPDF();
    const total = getTotalSpend(expenses);
    const topCat = getTopCategory(expenses);
    const avg = getAveragePerMonth(expenses);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('Monthly Expense Intelligence', 14, 22);

    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100);
    const rangeText = startDate && endDate
        ? `Report: ${startDate} to ${endDate}`
        : 'Report: All Time';
    doc.text(rangeText, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 36);

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Total Spend: ${formatCurrency(total)}`, 14, 48);
    doc.text(`Budget: ${formatCurrency(BUDGET_LIMIT)}`, 14, 56);
    doc.text(`Top Category: ${topCat}`, 14, 64);
    doc.text(`Avg/Month: ${formatCurrency(avg)}`, 14, 72);

    // Category breakdown table
    const breakdown = getCategoryBreakdown(expenses);
    autoTable(doc, {
        startY: 82,
        head: [['Category', 'Amount', '% of Total']],
        body: breakdown.map((item) => [
            item.category,
            formatCurrency(item.amount),
            `${((item.amount / total) * 100).toFixed(1)}%`,
        ]),
        headStyles: { fillColor: [99, 102, 241] },
        alternateRowStyles: { fillColor: [245, 245, 255] },
    });

    // Expense detail table
    const finalY = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY) || 140;
    autoTable(doc, {
        startY: finalY + 10,
        head: [['Date', 'Category', 'Amount', 'Note']],
        body: expenses.map((e) => [e.date, e.category, formatCurrency(e.amount), e.note]),
        headStyles: { fillColor: [99, 102, 241] },
        alternateRowStyles: { fillColor: [245, 245, 255] },
        styles: { fontSize: 8 },
    });

    doc.save('expense-report.pdf');
}
