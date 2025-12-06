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
    );
}
