'use client';

import { useState } from 'react';
import styles from './accounting.module.css';

export default function AccountingPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = async (type: 'sales' | 'purchases') => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:3000/accounting/${type}?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-${startDate}-to-${endDate}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to export data');
            }
        } catch (error) {
            console.error('Export error', error);
            alert('Error exporting data');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Accounting Exports</h1>

            <div className={styles.card}>
                <div className={styles.formGroup}>
                    <label>Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => handleExport('sales')}
                        className={`${styles.exportButton} ${styles.salesButton}`}
                    >
                        Export Sales (CSV)
                    </button>
                    <button
                        onClick={() => handleExport('purchases')}
                        className={`${styles.exportButton} ${styles.purchasesButton}`}
                    >
                        Export Purchases (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
}
