'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSetting, Setting } from '../../../utils/settingsApi';
import styles from './settings.module.css';
import Header from '../../../components/Header';

const MODULES = [
    'SYSTEM',
    'INVENTORY',
    'SALES',
    'CRM',
    'SERVICE',
    // 'FINANCE', // Future
    // 'REPORTING' // Future
];

export default function SettingsPage() {
    const [activeModule, setActiveModule] = useState('SYSTEM');
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, [activeModule]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings(activeModule);
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        try {
            await updateSetting(key, value, activeModule);
            setMessage({ type: 'success', text: `Setting saved successfully.` });

            // Optimistic update
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Failed to update setting:', error);
            setMessage({ type: 'error', text: 'Failed to save setting.' });
        }
    };

    const filteredSettings = settings.filter(s =>
        s.key.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Render Input based on value type/convention
    const renderInput = (setting: Setting) => {
        const isBoolean = setting.value === 'true' || setting.value === 'false' || setting.key.startsWith('ENABLE_');
        const isNumber = !isNaN(Number(setting.value)) && !isBoolean && setting.value !== '';

        if (isBoolean) {
            return (
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={setting.value === 'true'}
                        onChange={(e) => handleSave(setting.key, String(e.target.checked))}
                    />
                    <span className={styles.slider}></span>
                </label>
            );
        }

        return (
            <div className={styles.inputWrapper}>
                <input
                    type={isNumber ? "number" : "text"}
                    className={styles.input}
                    defaultValue={setting.value}
                    onBlur={(e) => {
                        if (e.target.value !== setting.value) {
                            handleSave(setting.key, e.target.value);
                        }
                    }}
                />
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <Header title="System Settings" />

            {message.text && (
                <div className={`${styles.message} ${message.type === 'error' ? styles.error : styles.success}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>Modules</div>
                    <nav className={styles.nav}>
                        {MODULES.map(module => (
                            <button
                                key={module}
                                className={`${styles.navItem} ${activeModule === module ? styles.active : ''}`}
                                onClick={() => setActiveModule(module)}
                            >
                                {module}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className={styles.main}>
                    <div className={styles.toolbar}>
                        <h2 className={styles.moduleTitle}>{activeModule} Configuration</h2>
                        <input
                            type="text"
                            placeholder="Search settings..."
                            className={styles.searchBox}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Loading settings...</div>
                    ) : (
                        <div className={styles.settingsGrid}>
                            {filteredSettings.length === 0 ? (
                                <div className={styles.emptyState}>No settings found for this module.</div>
                            ) : (
                                filteredSettings.map(setting => (
                                    <div key={setting.id} className={styles.settingCard}>
                                        <div className={styles.settingInfo}>
                                            <h3 className={styles.settingKey}>{setting.key.replace(/_/g, ' ')}</h3>
                                            <p className={styles.settingDesc}>{setting.description}</p>
                                        </div>
                                        <div className={styles.settingControl}>
                                            {renderInput(setting)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
