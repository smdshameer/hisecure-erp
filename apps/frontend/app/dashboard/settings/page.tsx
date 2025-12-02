'use client';

import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        name: 'Admin User',
        email: 'admin@hisecure.com',
        role: 'ADMIN'
    });

    const [business, setBusiness] = useState({
        companyName: 'Hi Secure Solutions',
        gstin: '29ABCDE1234F1Z5',
        address: '123, Tech Park, Bangalore',
        phone: '+91 9876543210',
        email: 'contact@hisecure.com'
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        darkMode: true,
        lowStockAlerts: true
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile updated successfully!');
    };

    const handleSaveBusiness = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Business settings updated successfully!');
    };

    return (
        <>
            <Header title="Settings" />
            <div className={styles.container}>

                {/* Profile Settings */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>👤 Profile Settings</h2>
                    <form onSubmit={handleSaveProfile}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={profile.email}
                                    disabled
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Role</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profile.role}
                                    disabled
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.saveBtn}>Update Profile</button>
                    </form>
                </div>

                {/* Business Settings */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🏢 Business Information</h2>
                    <form onSubmit={handleSaveBusiness}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Company Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={business.companyName}
                                    onChange={(e) => setBusiness({ ...business, companyName: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>GSTIN</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={business.gstin}
                                    onChange={(e) => setBusiness({ ...business, gstin: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Contact Phone</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={business.phone}
                                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Business Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={business.email}
                                    onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label className={styles.label}>Address</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={business.address}
                                    onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.saveBtn}>Save Business Info</button>
                    </form>
                </div>

                {/* App Preferences */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>⚙️ Preferences</h2>
                    <div className={styles.toggleGroup}>
                        <div>
                            <div className={styles.toggleLabel}>Email Notifications</div>
                            <div className={styles.toggleDesc}>Receive daily sales reports via email</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                        />
                    </div>
                    <div className={styles.toggleGroup}>
                        <div>
                            <div className={styles.toggleLabel}>Low Stock Alerts</div>
                            <div className={styles.toggleDesc}>Get notified when items run low</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.lowStockAlerts}
                            onChange={(e) => setPreferences({ ...preferences, lowStockAlerts: e.target.checked })}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                        />
                    </div>
                </div>

            </div>
        </>
    );
}
