'use client';

import React, { useState } from 'react';
import styles from './DynamicSettingForm.module.css';
import HistoryModal from './HistoryModal';

interface Setting {
    key: string;
    value: string;
    type: string;
    category: string;
    description: string;
    isSystem: boolean;
}

interface DynamicSettingFormProps {
    setting: Setting;
}

export default function DynamicSettingForm({ setting }: DynamicSettingFormProps) {
    const [value, setValue] = useState(JSON.parse(setting.value));
    const [loading, setLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = setting.type === 'boolean'
            ? (e.target as HTMLInputElement).checked
            : setting.type === 'number'
                ? Number(e.target.value)
                : e.target.value;
        setValue(val);
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings/${setting.key}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ value }),
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error('You do not have permission to edit this setting.');
                throw new Error('Failed to update setting');
            }

            setMessage({ type: 'success', text: 'Saved!' });
            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Error saving setting' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async () => {
        setHistoryOpen(true);
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings/${setting.key}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.label}>
                {setting.description || setting.key}
                {setting.isSystem && <span className={styles.systemBadge}>System</span>}
            </label>

            <div className={styles.inputContainer}>
                {setting.type === 'boolean' ? (
                    <div className={styles.toggleSwitch}>
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={handleChange}
                            disabled={loading} // Removing isSystem check here to let backend handle AUTH enforcement for better UE (or keep it if strictly desired)
                            id={`toggle-${setting.key}`}
                        />
                        <label htmlFor={`toggle-${setting.key}`}></label>
                    </div>
                ) : (
                    <input
                        type={setting.type === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={handleChange}
                        disabled={loading}
                        className={styles.input}
                    />
                )}

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={styles.saveBtn}
                >
                    {loading ? '...' : 'Save'}
                </button>

                <button
                    onClick={handleViewHistory}
                    className={styles.historyBtn}
                    title="View History"
                >
                    History
                </button>
            </div>
            {message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

            <HistoryModal
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
                settingKey={setting.key}
                history={history}
                loading={loadingHistory}
            />
        </div>
    );
}
