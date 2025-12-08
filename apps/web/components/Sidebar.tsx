'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import { useSidebar } from '../context/SidebarContext';

const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'CRM', path: '/dashboard/crm' },
    { name: 'Inventory', path: '/dashboard/inventory' },
    { name: 'Sales & Invoices', path: '/dashboard/sales' },
    { name: 'Quotations', path: '/dashboard/quotations' },
    { name: 'Suppliers', path: '/dashboard/suppliers' },
    { name: 'Purchase Orders', path: '/dashboard/purchase-orders' },
    { name: 'Warranty', path: '/dashboard/warranty' },
    { name: 'Accounting', path: '/dashboard/accounting' },
    { name: 'POS', path: '/dashboard/pos' },
    { name: 'Service Tickets', path: '/dashboard/service' },
    { name: 'Customers', path: '/dashboard/customers' },
    { name: 'Branches', path: '/dashboard/branches' },
    { name: 'Transfers', path: '/dashboard/transfers' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Delivery Challans', path: '/dashboard/delivery-challans' },
    { name: 'Goods Receipt Notes', path: '/dashboard/grn' },
    { name: 'Settings', path: '/dashboard/settings' },
    { name: 'Users', path: '/dashboard/users' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, closeSidebar } = useSidebar();
    const [companyName, setCompanyName] = useState('HiSecure ERP');

    const fetchCompanyName = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('Sidebar: No token found');
                return;
            }

            // Default to localhost:4000 (Backend) not 3000 (Frontend)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            console.log('Sidebar: Fetching company name from', `${apiUrl}/settings/COMPANY_NAME`);

            const res = await fetch(`${apiUrl}/settings/COMPANY_NAME`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Sidebar: Received data', data);

                let val = data.value;
                try {
                    // Settings are often JSON stringified
                    const parsed = JSON.parse(val);
                    if (typeof parsed === 'string') val = parsed;
                } catch (e) {
                    // value is plain string
                }
                console.log('Sidebar: Setting name to', val);
                setCompanyName(val || 'HiSecure ERP');
            } else {
                console.error('Sidebar: Fetch failed status:', res.status);
            }
        } catch (error) {
            console.error('Sidebar: Failed to fetch company name', error);
        }
    };

    useEffect(() => {
        fetchCompanyName();

        const handleSettingsChange = () => {
            fetchCompanyName();
        };

        window.addEventListener('settingsChanged', handleSettingsChange);

        return () => {
            window.removeEventListener('settingsChanged', handleSettingsChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={closeSidebar}></div>}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <h2>{companyName}</h2>
                </div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.link} ${pathname === item.path ? styles.active : ''}`}
                            onClick={closeSidebar}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className={styles.footer}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
