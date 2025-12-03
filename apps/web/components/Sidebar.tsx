'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useSidebar } from '../context/SidebarContext';

const menuItems = [
    { name: 'Overview', path: '/dashboard' },
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
    { name: 'CRM', path: '/dashboard/crm' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, closeSidebar } = useSidebar();

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
                    <h2>HiSecure ERP</h2>
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
