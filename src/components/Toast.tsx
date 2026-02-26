'use client';

import React, { useEffect, useState } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: 'success' | 'error') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    };

    return { toasts, addToast };
}

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '90%',
            maxWidth: '400px',
            pointerEvents: 'none',
        }}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}

function ToastItem({ toast }: { toast: Toast }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const isSuccess = toast.type === 'success';

    return (
        <div style={{
            padding: '14px 20px',
            borderRadius: '14px',
            background: isSuccess
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.9rem',
            fontFamily: 'var(--font-sans)',
            boxShadow: isSuccess
                ? '0 4px 24px rgba(16, 185, 129, 0.3)'
                : '0 4px 24px rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isSuccess ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'auto' as const,
            textAlign: 'center' as const,
        }}>
            {isSuccess ? '✅ ' : '⚠️ '}{toast.message}
        </div>
    );
}
