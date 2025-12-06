'use client';

import React from 'react';
import styles from './HistoryModal.module.css';

interface HistoryEntry {
    id: number;
    oldValue: string | null;
    newValue: string;
    changedAt: string;
    changedBy: number | null;
    version: number;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    settingKey: string;
    history: HistoryEntry[];
    loading: boolean;
}

export default function HistoryModal({ isOpen, onClose, settingKey, history, loading }: HistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>History: {settingKey}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>
                <div className={styles.content}>
                    {loading ? (
                        <p>Loading history...</p>
                    ) : history.length === 0 ? (
                        <p>No history available.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Old Value</th>
                                    <th>New Value</th>
                                    <th>User ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{new Date(entry.changedAt).toLocaleString()}</td>
                                        <td className={styles.valueCell} title={entry.oldValue || ''}>
                                            {entry.oldValue ? (entry.oldValue.length > 50 ? entry.oldValue.substring(0, 50) + '...' : entry.oldValue) : '-'}
                                        </td>
                                        <td className={styles.valueCell} title={entry.newValue}>
                                            {entry.newValue.length > 50 ? entry.newValue.substring(0, 50) + '...' : entry.newValue}
                                        </td>
                                        <td>{entry.changedBy || 'System'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.btn}>Close</button>
                </div>
            </div>
        </div>
    );
}
