'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/api';

interface MonthlyData {
    label: string;
    amount: number;
}

interface MonthlyBarChartProps {
    data: MonthlyData[];
}

function useThemeColors() {
    const [colors, setColors] = useState({
        chartText: '#94a3b8',
        tooltipBg: 'rgba(17, 24, 39, 0.95)',
        tooltipText: '#f0f4ff',
        tooltipBorder: 'rgba(99, 102, 241, 0.2)',
        tooltipShadow: '0 8px 32px rgba(0,0,0,0.4)',
    });

    useEffect(() => {
        const update = () => {
            const s = getComputedStyle(document.documentElement);
            setColors({
                chartText: s.getPropertyValue('--text-chart').trim() || '#94a3b8',
                tooltipBg: s.getPropertyValue('--tooltip-bg').trim() || 'rgba(17, 24, 39, 0.95)',
                tooltipText: s.getPropertyValue('--tooltip-text').trim() || '#f0f4ff',
                tooltipBorder: s.getPropertyValue('--tooltip-border').trim() || 'rgba(99, 102, 241, 0.2)',
                tooltipShadow: s.getPropertyValue('--tooltip-shadow').trim() || '0 8px 32px rgba(0,0,0,0.4)',
            });
        };
        update();
        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => obs.disconnect();
    }, []);

    return colors;
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
    const theme = useThemeColors();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <filter id="bar-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.08)" />
                <XAxis
                    dataKey="label"
                    tick={{ fill: theme.chartText, fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(99, 102, 241, 0.1)' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: theme.chartText, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    width={45}
                />
                <Tooltip
                    formatter={(value?: number) => [formatCurrency(value ?? 0), 'Spend']}
                    contentStyle={{
                        background: theme.tooltipBg,
                        border: `1px solid ${theme.tooltipBorder}`,
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: theme.tooltipText,
                        boxShadow: theme.tooltipShadow,
                    }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                />
                <Bar
                    dataKey="amount"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
