'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { formatCurrency } from '@/lib/api';

interface TrendData {
    label: string;
    amount: number;
}

interface SpendingTrendLineProps {
    data: TrendData[];
}

function useThemeColors() {
    const [colors, setColors] = useState({
        chartText: '#94a3b8',
        tooltipBg: 'rgba(17, 24, 39, 0.95)',
        tooltipText: '#f0f4ff',
        tooltipBorder: 'rgba(99, 102, 241, 0.2)',
        tooltipShadow: '0 8px 32px rgba(0,0,0,0.4)',
        dotStroke: '#0a0e1a',
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
                dotStroke: s.getPropertyValue('--dot-stroke').trim() || '#0a0e1a',
            });
        };
        update();
        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => obs.disconnect();
    }, []);

    return colors;
}

export default function SpendingTrendLine({ data }: SpendingTrendLineProps) {
    const theme = useThemeColors();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
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
                />
                <Area
                    type="monotone"
                    dataKey="amount"
                    fill="url(#areaGradient)"
                    stroke="none"
                />
                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{
                        fill: '#818cf8',
                        stroke: theme.dotStroke,
                        strokeWidth: 3,
                        r: 5,
                        filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))',
                    }}
                    activeDot={{
                        r: 8,
                        fill: '#a78bfa',
                        stroke: theme.dotStroke,
                        strokeWidth: 3,
                        filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))',
                    }}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
