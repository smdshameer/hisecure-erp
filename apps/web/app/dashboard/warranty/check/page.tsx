'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../warranty.module.css';

interface WarrantyCheckResult {
    productName: string;
    sku: string;
    warrantyMonths: number;
    purchaseDate: string;
    expiryDate: string;
    isValid: boolean;
    saleItemId: number;
}

export default function CheckWarrantyPage() {
    const router = useRouter();
    const [invoice, setInvoice] = useState('');
    const [results, setResults] = useState<WarrantyCheckResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Claim Form State
    const [selectedItem, setSelectedItem] = useState<WarrantyCheckResult | null>(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const checkWarranty = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults(null);
        setSelectedItem(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/warranty/check?invoice=${invoice}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data);
            } else {
                const err = await res.json();
                setError(err.message || 'Invoice not found');
            }
        } catch (err) {
            setError('Failed to check warranty');
        } finally {
            setLoading(false);
        }
    };

    const fileClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/warranty/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    saleItemId: selectedItem.saleItemId,
                    description,
                }),
            });

            if (res.ok) {
                alert('Warranty claim filed successfully!');
                router.push('/dashboard/warranty');
            } else {
                const err = await res.json();
                alert(`Failed to file claim: ${err.message}`);
            }
        } catch (err) {
            alert('Error filing claim');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Check Warranty Status</h1>
            </div>

            <div style={{ maxWidth: '600px', background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <form onSubmit={checkWarranty} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <input
                        type="text"
                        placeholder="Enter Invoice Number (e.g., INV-123)"
                        value={invoice}
                        onChange={(e) => setInvoice(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.checkButton}
                    >
                        {loading ? 'Checking...' : 'Check'}
                    </button>
                </form>

                {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}

                {results && (
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Results for {invoice}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.map((item) => (
                                <div key={item.saleItemId} style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem', background: item.isValid ? '#f0fdf4' : '#fef2f2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>{item.productName}</strong>
                                        <span style={{ color: '#6b7280' }}>{item.sku}</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                                        <div>Purchased: {new Date(item.purchaseDate).toLocaleDateString()}</div>
                                        <div>Warranty: {item.warrantyMonths} Months</div>
                                        <div>Expires: {new Date(item.expiryDate).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                        <span style={{ fontWeight: 'bold', color: item.isValid ? '#059669' : '#dc2626' }}>
                                            {item.isValid ? 'Active Warranty' : 'Expired'}
                                        </span>
                                        {item.isValid && (
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className={styles.actionButton}
                                                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none' }}
                                            >
                                                File Claim
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedItem && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>File Warranty Claim</h2>
                        <p style={{ marginBottom: '1rem' }}>Product: <strong>{selectedItem.productName}</strong></p>

                        <form onSubmit={fileClaim}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Issue Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '100px' }}
                                    required
                                    placeholder="Describe the issue..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedItem(null)}
                                    className={styles.actionButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={styles.checkButton}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Claim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
