'use client';

import Sidebar from '../../components/Sidebar';
import styles from './layout.module.css';
import { SidebarProvider } from '../../context/SidebarContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
