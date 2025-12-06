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
    'use client';

    import { useState, useEffect } from 'react';
    import { getSettings, updateSetting, getSettingHistory, rollbackSetting, Setting, SettingHistory } from '../../../utils/settingsApi';
    import styles from './settings.module.css';
    import Header from '../../../components/Header';
    import { FaHistory, FaTimes } from 'react-icons/fa'; // Assuming react-icons is available, if not we'll use unicode

    const MODULES = [
        'SYSTEM',
        'INVENTORY',
        'SALES',
        'CRM',
        'SERVICE',
    ];

    export default function SettingsPage() {
        const [activeModule, setActiveModule] = useState('SYSTEM');
        const [settings, setSettings] = useState<Setting[]>([]);
        const [loading, setLoading] = useState(true);
        const [search, setSearch] = useState('');
        const [message, setMessage] = useState({ type: '', text: '' });

        // History Modal State
        const [showHistory, setShowHistory] = useState<number | null>(null); // Setting ID
        const [historyData, setHistoryData] = useState<SettingHistory[]>([]);
        const [historyLoading, setHistoryLoading] = useState(false);

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
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                console.error('Failed to update setting:', error);
                setMessage({ type: 'error', text: 'Failed to save setting.' });
            }
        };

        const handleHistoryClick = async (setting: Setting) => {
            setShowHistory(setting.id);
            setHistoryLoading(true);
            try {
                const history = await getSettingHistory(setting.key);
                setHistoryData(history);
            } catch (error) {
                console.error(error);
                setMessage({ type: 'error', text: 'Failed to load history' });
                setShowHistory(null);
            } finally {
                setHistoryLoading(false);
            }
        };

        const handleRollback = async (settingKey: string, version: number) => {
            if (!confirm(`Are you sure you want to rollback to version ${version}?`)) return;
            try {
                await rollbackSetting(settingKey, version);
                setMessage({ type: 'success', text: 'Rollback successful' });
                setShowHistory(null);
                fetchSettings(); // Refresh to see change
            } catch (error) {
                setMessage({ type: 'error', text: 'Rollback failed' });
            }
        };

        const filteredSettings = settings.filter(s =>
            s.key.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase())
        );

        // --- Components ---

        const SecretInput = ({ setting }: { setting: Setting }) => {
            const [isEditing, setIsEditing] = useState(false);
            const [val, setVal] = useState('');

            const onSave = () => {
                if (val) handleSave(setting.key, val);
                setIsEditing(false);
            };

            if (isEditing) {
                return (
                    <div className={styles.secretWrapper}>
                        <input
                            className={styles.input}
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            placeholder="Enter new secret value"
                        />
                        <button className={styles.secretButton} onClick={onSave}>Save</button>
                        <button className={styles.secretButton} onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                );
            }

            return (
                <div className={styles.secretWrapper}>
                    <span className={styles.input} style={{ background: '#f1f5f9', color: '#64748b' }}>•••••••••••••••</span>
                    <button className={styles.secretButton} onClick={() => setIsEditing(true)}>Edit</button>
                </div>
            );
        };

        const renderInput = (setting: Setting) => {
            if (setting.type === 'BOOLEAN') {
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

            if (setting.type === 'SECRET' || setting.isSecret) {
                return <SecretInput setting={setting} />;
            }

            return (
                <div className={styles.inputWrapper}>
                    <input
                        type={setting.type === 'NUMBER' ? "number" : "text"}
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
                                    <div className={styles.emptyState}>No settings found.</div>
                                ) : (
                                    filteredSettings.map(setting => (
                                        <div key={setting.id} className={styles.settingCard}>
                                            <div className={styles.settingInfo}>
                                                <h3 className={styles.settingKey}>
                                                    {setting.key.replace(/_/g, ' ')}
                                                    {setting.isDeveloper && <span className={`${styles.badge} ${styles.badgeDeveloper}`}>Dev</span>}
                                                    {setting.isSecret && <span className={`${styles.badge} ${styles.badgeSecret}`}>Secret</span>}
                                                </h3>
                                                <p className={styles.settingDesc}>{setting.description}</p>
                                            </div>
                                            <div className={styles.settingControl}>
                                                {renderInput(setting)}
                                                <button
                                                    className={styles.historyButton}
                                                    title="View History"
                                                    onClick={() => handleHistoryClick(setting)}
                                                >
                                                    History (v{setting.version})
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </main>
                </div>

                {/* History Modal */}
                {showHistory && (
                    <div className={styles.modalOverlay} onClick={() => setShowHistory(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>History</h3>
                                <button className={styles.closeButton} onClick={() => setShowHistory(null)}>&times;</button>
                            </div>
                            {historyLoading ? (
                                <div className={styles.loading}>Loading history...</div>
                            ) : (
                                <ul className={styles.historyList}>
                                    {historyData.map(h => (
                                        <li key={h.id} className={styles.historyItem}>
                                            <div className={styles.historyMeta}>
                                                <span>v{h.version}</span>
                                                <span>{new Date(h.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className={styles.historyValue}>{h.newValue || 'NULL'}</span>
                                            </div>
                                            <button
                                                className={styles.rollbackBtn}
                                                onClick={() => handleRollback(settings.find(s => s.id === showHistory)?.key!, h.version)}
                                            >
                                                Rollback to this
                                            </button>
                                        </li>
                                    ))}
                                    {historyData.length === 0 && <div className={styles.emptyState}>No history available.</div>}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
