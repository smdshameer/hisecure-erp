'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import SettingsTabs from '../../../../components/settings/SettingsTabs';
import DynamicSettingForm from '../../../../components/settings/DynamicSettingForm';

interface Setting {
    key: string;
    value: string;
    type: string;
    category: string;
    description: string;
    isSystem: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings?includeSystem=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);

                // Extract unique categories
                const cats = Array.from(new Set(data.map((s: Setting) => s.category))) as string[];
                setCategories(cats);
                if (cats.length > 0 && !activeCategory) {
                    setActiveCategory(cats[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings/data/export`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `settings-backup-${new Date().toISOString()}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Export failed. Are you an admin?');
            }
        } catch (err) {
            console.error(err);
            alert('Export error');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings/data/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(json)
                });

                if (res.ok) {
                    const result = await res.json();
                    alert(result.message);
                    fetchSettings(); // Refresh
                } else {
                    alert('Import failed');
                }
            } catch (err) {
                console.error(err);
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const filteredSettings = settings.filter((s) => s.category === activeCategory);

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Advanced Settings</h1>
                    <p className={styles.subtitle}>Configure system parameters and module behaviors.</p>
                </div>
                <div className={styles.actions}>
                    <button onClick={handleExport} className={styles.btn}>Export JSON</button>
                    <button onClick={handleImportClick} className={styles.btn}>Import JSON</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className={styles.hiddenInput}
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className={styles.content}>
                <SettingsTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                <div className={styles.settingsPanel}>
                    {activeCategory && <h2 className={styles.categoryTitle}>{activeCategory} Configuration</h2>}

                    {filteredSettings.length === 0 ? (
                        <p>No settings in this category.</p>
                    ) : (
                        filteredSettings.map((setting) => (
                            <DynamicSettingForm key={setting.key} setting={setting} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
