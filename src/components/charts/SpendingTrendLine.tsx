'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { formatCurrency } from '@/lib/api';

interface TrendData {
    label: string;
    amount: number;
}

interface SpendingTrendLineProps {
    data: TrendData[];
}

export default function SpendingTrendLine({ data }: SpendingTrendLineProps) {
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
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(99, 102, 241, 0.1)' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    width={45}
                />
                <Tooltip
                    formatter={(value?: number) => [formatCurrency(value ?? 0), 'Spend']}
                    contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: '#f0f4ff',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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
                        stroke: '#0a0e1a',
                        strokeWidth: 3,
                        r: 5,
                        filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))',
                    }}
                    activeDot={{
                        r: 8,
                        fill: '#a78bfa',
                        stroke: '#0a0e1a',
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
