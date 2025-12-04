'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, ShoppingCart, DollarSign, Package, FileText, Settings } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function SidebarContent({ children }) {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
            {/* SIDEBAR ESTILO APPLE */}
            <aside className="w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-50">
                        {t.common.appName}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.sidebar.subtitle}</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    <NavLink href="/dashboard" icon={Home} active={pathname === '/dashboard'}>
                        {t.sidebar.dashboard}
                    </NavLink>
                    <NavLink href="/clientes" icon={Users} active={pathname.startsWith('/clientes')}>
                        {t.sidebar.clients}
                    </NavLink>
                    <NavLink href="/ventas" icon={ShoppingCart} active={pathname.startsWith('/ventas')}>
                        {t.sidebar.sales}
                    </NavLink>
                    <NavLink href="/abonos" icon={DollarSign} active={pathname.startsWith('/abonos')}>
                        {t.sidebar.payments}
                    </NavLink>
                    <NavLink href="/productos" icon={Package} active={pathname.startsWith('/productos')}>
                        {t.sidebar.products}
                    </NavLink>
                    <NavLink href="/reportes" icon={FileText} active={pathname.startsWith('/reportes')}>
                        {t.sidebar.reports}
                    </NavLink>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
                        <NavLink href="/configuracion" icon={Settings} active={pathname === '/configuracion'}>
                            {t.sidebar.settings}
                        </NavLink>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            EA
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-50 truncate">Erick Abraham</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{t.sidebar.admin}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto p-8">{children}</div>
            </main>
        </div>
    );
}

// Componente NavLink reutilizable
function NavLink({ href, icon: Icon, children, active }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-50'
                }`}
        >
            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'
                }`} />
            <span className="font-medium text-sm">{children}</span>
        </Link>
    );
}

export default function ClientLayout({ children }) {
    return (
        <LanguageProvider>
            <SidebarContent>{children}</SidebarContent>
        </LanguageProvider>
    );
}
