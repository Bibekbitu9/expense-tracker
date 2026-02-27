'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS } from '@/lib/types';
import { formatCurrency } from '@/lib/api';

interface PieData {
    category: string;
    amount: number;
}

interface CategoryPieChartProps {
    data: PieData[];
    total: number;
}

interface CustomLabelProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
}

const RADIAN = Math.PI / 180;

// Enhanced neon colors
const NEON_COLORS = [
    '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
    '#f472b6', '#fb7185', '#fb923c', '#34d399',
];

function renderCustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomLabelProps) {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

function useThemeColors() {
    const [colors, setColors] = useState({
        tooltipBg: 'rgba(17, 24, 39, 0.95)',
        tooltipText: '#f0f4ff',
        tooltipBorder: 'rgba(99, 102, 241, 0.2)',
        tooltipShadow: '0 8px 32px rgba(0,0,0,0.4)',
    });

    useEffect(() => {
        const update = () => {
            const s = getComputedStyle(document.documentElement);
            setColors({
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

export default function CategoryPieChart({ data, total }: CategoryPieChartProps) {
    const theme = useThemeColors();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <defs>
                    {NEON_COLORS.map((color, i) => (
                        <filter key={`glow-${i}`} id={`pie-glow-${i}`}>
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    ))}
                </defs>
                <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="45%"
                    paddingAngle={3}
                    label={renderCustomLabel}
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                >
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={NEON_COLORS[index % NEON_COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value?: number, name?: string) => [
                        `${formatCurrency(value ?? 0)} (${(((value ?? 0) / total) * 100).toFixed(1)}%)`,
                        name ?? '',
                    ]}
                    contentStyle={{
                        background: theme.tooltipBg,
                        border: `1px solid ${theme.tooltipBorder}`,
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: theme.tooltipText,
                        boxShadow: theme.tooltipShadow,
                        backdropFilter: 'blur(20px)',
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
