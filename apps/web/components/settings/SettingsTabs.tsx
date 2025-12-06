import React from 'react';
import styles from './SettingsTabs.module.css';

interface SettingsTabsProps {
    categories: string[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function SettingsTabs({
    categories,
    activeCategory,
    onSelectCategory,
}: SettingsTabsProps) {
    return (
        <>
            {/* Desktop Tabs */}
            <div className={styles.tabsContainer}>
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`${styles.tab} ${activeCategory === category ? styles.active : ''}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Mobile Dropdown */}
            <div className={styles.mobileSelectContainer}>
                <select
                    className={styles.mobileSelect}
                    value={activeCategory}
                    onChange={(e) => onSelectCategory(e.target.value)}
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}
