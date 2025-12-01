import React, { useEffect, useState } from 'react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    method: 'CARD' | 'UPI';
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, method }: PaymentModalProps) {
    const [status, setStatus] = useState<'processing' | 'success'>('processing');

    useEffect(() => {
        if (isOpen) {
            setStatus('processing');
            const timer = setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1000);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                minWidth: '300px',
                border: '1px solid var(--border-color)',
            }}>
                {status === 'processing' ? (
                    <>
                        <div className="spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid var(--accent-color)',
                            borderRadius: '50%',
                            margin: '0 auto 1rem',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <h3 style={{ color: 'var(--text-primary)' }}>Processing {method} Payment...</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Amount: ₹{amount.toFixed(2)}</p>
                    </>
                ) : (
                    <>
                        <div style={{
                            fontSize: '40px',
                            color: '#10b981',
                            marginBottom: '1rem'
                        }}>✓</div>
                        <h3 style={{ color: 'var(--text-primary)' }}>Payment Successful!</h3>
                    </>
                )}
            </div>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
