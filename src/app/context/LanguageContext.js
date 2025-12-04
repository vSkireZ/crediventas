'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
    es: {
        common: {
            appName: 'CrediVentas',
            loading: 'Cargando...',
            error: 'Error',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            search: 'Buscar...',
            actions: 'Acciones',
            noData: 'No hay datos disponibles',
            success: 'Éxito',
            confirmDelete: '¿Estás seguro de que deseas eliminar este elemento?',
            confirm: 'Confirmar',
            processing: 'Procesando...',
        },
        sidebar: {
            dashboard: 'Panel Principal',
            clients: 'Clientes',
            sales: 'Registrar Venta',
            payments: 'Pagos y Abonos',
            products: 'Productos',
            reports: 'Reportes',
            settings: 'Configuración',
            subtitle: 'Sistema de control financiero',
            admin: 'Administrador',
        },
        dashboard: {
            title: 'Panel Principal',
            summary: 'Resumen de actividad del día',
            salesToday: 'Ventas de Hoy',
            collectedToday: 'Cobrado Hoy',
            pendingBalance: 'Saldo Pendiente',
            recentSales: 'Últimas Ventas',
            recentPayments: 'Pagos Recientes',
            noRecentSales: 'No hay ventas recientes',
            noRecentPayments: 'No hay pagos recientes',
            debtorsTitle: 'Clientes con pagos próximos a vencer',
            debtorsDesc: 'Hay {count} clientes con pagos que vencen en los próximos 3 días.',
            viewDetails: 'Ver detalles',
            justNow: 'Justo ahora',
            minsAgo: 'Hace {count} min',
            hoursAgo: 'Hace {count} hora(s)',
            daysAgo: 'Hace {count} día(s)',
        },
        settings: {
            title: 'Configuración',
            subtitle: 'Personaliza la aplicación',
            language: 'Idioma',
            languageDesc: 'Selecciona el idioma de la interfaz',
            spanish: 'Español',
            english: 'Inglés',
            currentLanguage: 'Idioma actual',
            comingSoon: 'Próximamente',
            changeAdmin: 'Cambiar cuenta de administrador',
            theme: 'Tema',
            darkMode: 'Modo Oscuro',
            lightMode: 'Modo Claro',
        },
        clients: {
            title: 'Clientes',
            subtitle: 'Gestión de clientes y estados de cuenta',
            newClient: 'Nuevo Cliente',
            activeClients: 'Clientes Activos',
            totalDebt: 'Deuda Total',
            debtors: 'Morosos',
            showing: 'Mostrando {count} clientes',
            noAddress: 'Sin dirección',
            noPhone: 'Sin teléfono',
            inactive: 'Inactivos',
            table: {
                client: 'Cliente',
                contact: 'Contacto',
                status: 'Estado',
                balance: 'Saldo',
                actions: 'Acciones',
                creditLimit: 'Límite Crédito'
            },
            status: {
                active: 'Al corriente',
                overdue: 'Moroso',
                paid: 'Pagado'
            },
            form: {
                name: 'Nombre',
                address: 'Dirección',
                phone: 'Teléfono',
                creditLimit: 'Límite de Crédito',
                namePlaceholder: 'Nombre del cliente',
                addressPlaceholder: 'Dirección completa',
                phonePlaceholder: '331-123-4567'
            },
            details: {
                title: 'Detalle de {name}',
                address: 'Dirección',
                phone: 'Teléfono',
                balance: 'Saldo',
                limit: 'Límite'
            }
        },
        sales: {
            title: 'Nueva Venta a Crédito',
            selectClient: 'Cliente',
            searchClient: 'Buscar cliente...',
            availableCredit: 'Crédito disponible',
            limit: 'Límite',
            available: 'Disponible',
            change: 'Cambiar',
            products: 'Productos',
            searchProduct: 'Buscar producto...',
            noProducts: 'No hay productos disponibles',
            stock: 'Stock',
            ticket: 'Ticket de Venta',
            items: '{count} producto(s)',
            emptyCart: 'El carrito está vacío',
            subtotal: 'Subtotal',
            tax: 'IVA (16%)',
            total: 'Total',
            confirmSale: 'Confirmar Venta',
            successMsg: '¡Venta registrada exitosamente!',
            errorMsg: 'Error al registrar venta',
            insufficientCredit: 'El cliente no tiene crédito suficiente',
            selectClientAlert: 'Por favor selecciona un cliente'
        },
        payments: {
            title: 'Registrar Abono',
            subtitle: 'Registro de pagos y abonos a crédito',
            searchClient: 'Buscar Cliente',
            searchPlaceholder: 'Escribe el nombre del cliente...',
            selectedClient: 'Cliente seleccionado',
            currentBalance: 'Saldo Actual',
            creditLimit: 'Límite de Crédito',
            amountToPay: 'Monto a Abonar',
            newBalance: 'Nuevo saldo',
            paymentMethod: 'Método de Pago',
            reference: 'Referencia (opcional)',
            referencePlaceholder: 'Núm. de operación, folio, etc.',
            registerPayment: 'Registrar Pago',
            registering: 'Registrando...',
            successMsg: '¡Abono registrado exitosamente!',
            methods: {
                cash: 'Efectivo',
                transfer: 'Transferencia',
                card: 'Tarjeta'
            }
        },
        products: {
            title: 'Inventario de Productos',
            subtitle: '{count} productos registrados',
            addProduct: 'Agregar Producto',
            searchPlaceholder: 'Buscar producto por nombre o código...',
            filterAll: 'Todos los productos',
            filterLow: 'Bajo stock',
            filterOut: 'Agotados',
            noProducts: 'No se encontraron productos',
            lowStockAlert: 'Productos con stock bajo o agotado',
            lowStockDesc: 'Hay {count} productos que requieren reabastecimiento.',
            newProduct: 'Nuevo Producto',
            editProduct: 'Editar Producto',
            table: {
                code: 'Código',
                product: 'Producto',
                price: 'Precio',
                stock: 'Stock',
                min: 'Mín.',
                status: 'Estado',
                actions: 'Acciones'
            },
            status: {
                outOfStock: 'Agotado',
                lowStock: 'Bajo Stock',
                available: 'Disponible'
            },
            form: {
                code: 'Código',
                name: 'Nombre',
                description: 'Descripción',
                price: 'Precio',
                stock: 'Stock',
                minStock: 'Stock Mínimo'
            }
        },
        reports: {
            title: 'Reportes Financieros',
            subtitle: 'Análisis de ventas, productos y clientes',
            periods: {
                week: 'Última semana',
                month: 'Último mes',
                quarter: 'Último trimestre',
                year: 'Último año'
            },
            stats: {
                totalSales: 'Ventas Totales',
                activeClients: 'Clientes Activos',
                productsInStock: 'Productos en Stock',
                pendingBalances: 'Saldos Pendientes'
            },
            charts: {
                salesByDay: 'Ventas por Día',
                topProducts: 'Productos Más Vendidos',
                topClients: 'Mejores Clientes',
                insights: 'Insights del Periodo',
                avgTicket: 'Ticket Promedio',
                starProduct: 'Producto Estrella'
            },
            units: 'unidades'
        }
    },
    en: {
        common: {
            appName: 'CrediVentas',
            loading: 'Loading...',
            error: 'Error',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search...',
            actions: 'Actions',
            noData: 'No data available',
            success: 'Success',
            confirmDelete: 'Are you sure you want to delete this item?',
            confirm: 'Confirm',
            processing: 'Processing...',
        },
        sidebar: {
            dashboard: 'Dashboard',
            clients: 'Clients',
            sales: 'Register Sale',
            payments: 'Payments',
            products: 'Products',
            reports: 'Reports',
            settings: 'Settings',
            subtitle: 'Financial control system',
            admin: 'Administrator',
        },
        dashboard: {
            title: 'Dashboard',
            summary: 'Daily activity summary',
            salesToday: 'Sales Today',
            collectedToday: 'Collected Today',
            pendingBalance: 'Pending Balance',
            recentSales: 'Recent Sales',
            recentPayments: 'Recent Payments',
            noRecentSales: 'No recent sales',
            noRecentPayments: 'No recent payments',
            debtorsTitle: 'Clients with upcoming due payments',
            debtorsDesc: 'There are {count} clients with payments due in the next 3 days.',
            viewDetails: 'View details',
            justNow: 'Just now',
            minsAgo: '{count} min ago',
            hoursAgo: '{count} hour(s) ago',
            daysAgo: '{count} day(s) ago',
        },
        settings: {
            title: 'Settings',
            subtitle: 'Customize the application',
            language: 'Language',
            languageDesc: 'Select the interface language',
            spanish: 'Spanish',
            english: 'English',
            currentLanguage: 'Current language',
            comingSoon: 'Coming Soon',
            changeAdmin: 'Change Administrator Account',
            theme: 'Theme',
            darkMode: 'Dark Mode',
            lightMode: 'Light Mode',
        },
        clients: {
            title: 'Clients',
            subtitle: 'Client management and account statements',
            newClient: 'New Client',
            activeClients: 'Active Clients',
            totalDebt: 'Total Debt',
            debtors: 'Debtors',
            showing: 'Showing {count} clients',
            noAddress: 'No address',
            noPhone: 'No phone',
            inactive: 'Inactive',
            table: {
                client: 'Client',
                contact: 'Contact',
                status: 'Status',
                balance: 'Balance',
                actions: 'Actions',
                creditLimit: 'Credit Limit'
            },
            status: {
                active: 'Up to date',
                overdue: 'Overdue',
                paid: 'Paid'
            },
            form: {
                name: 'Name',
                address: 'Address',
                phone: 'Phone',
                creditLimit: 'Credit Limit',
                namePlaceholder: 'Client name',
                addressPlaceholder: 'Full address',
                phonePlaceholder: '331-123-4567'
            },
            details: {
                title: 'Details of {name}',
                address: 'Address',
                phone: 'Phone',
                balance: 'Balance',
                limit: 'Limit'
            }
        },
        sales: {
            title: 'New Credit Sale',
            selectClient: 'Client',
            searchClient: 'Search client...',
            availableCredit: 'Available credit',
            limit: 'Limit',
            available: 'Available',
            change: 'Change',
            products: 'Products',
            searchProduct: 'Search product...',
            noProducts: 'No products available',
            stock: 'Stock',
            ticket: 'Sale Ticket',
            items: '{count} product(s)',
            emptyCart: 'Cart is empty',
            subtotal: 'Subtotal',
            tax: 'Tax (16%)',
            total: 'Total',
            confirmSale: 'Confirm Sale',
            successMsg: 'Sale registered successfully!',
            errorMsg: 'Error registering sale',
            insufficientCredit: 'Client does not have enough credit',
            selectClientAlert: 'Please select a client'
        },
        payments: {
            title: 'Register Payment',
            subtitle: 'Register credit payments',
            searchClient: 'Search Client',
            searchPlaceholder: 'Type client name...',
            selectedClient: 'Selected Client',
            currentBalance: 'Current Balance',
            creditLimit: 'Credit Limit',
            amountToPay: 'Amount to Pay',
            newBalance: 'New balance',
            paymentMethod: 'Payment Method',
            reference: 'Reference (optional)',
            referencePlaceholder: 'Operation number, folio, etc.',
            registerPayment: 'Register Payment',
            registering: 'Registering...',
            successMsg: 'Payment registered successfully!',
            methods: {
                cash: 'Cash',
                transfer: 'Transfer',
                card: 'Card'
            }
        },
        products: {
            title: 'Product Inventory',
            subtitle: '{count} registered products',
            addProduct: 'Add Product',
            searchPlaceholder: 'Search product by name or code...',
            filterAll: 'All products',
            filterLow: 'Low stock',
            filterOut: 'Out of stock',
            noProducts: 'No products found',
            lowStockAlert: 'Products with low or out of stock',
            lowStockDesc: 'There are {count} products that require restocking.',
            newProduct: 'New Product',
            editProduct: 'Edit Product',
            table: {
                code: 'Code',
                product: 'Product',
                price: 'Price',
                stock: 'Stock',
                min: 'Min.',
                status: 'Status',
                actions: 'Actions'
            },
            status: {
                outOfStock: 'Out of Stock',
                lowStock: 'Low Stock',
                available: 'Available'
            },
            form: {
                code: 'Code',
                name: 'Name',
                description: 'Description',
                price: 'Price',
                stock: 'Stock',
                minStock: 'Min Stock'
            }
        },
        reports: {
            title: 'Financial Reports',
            subtitle: 'Sales, products and clients analysis',
            periods: {
                week: 'Last week',
                month: 'Last month',
                quarter: 'Last quarter',
                year: 'Last year'
            },
            stats: {
                totalSales: 'Total Sales',
                activeClients: 'Active Clients',
                productsInStock: 'Products in Stock',
                pendingBalances: 'Pending Balances'
            },
            charts: {
                salesByDay: 'Sales by Day',
                topProducts: 'Top Selling Products',
                topClients: 'Top Clients',
                insights: 'Period Insights',
                avgTicket: 'Average Ticket',
                starProduct: 'Star Product'
            },
            units: 'units'
        }
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('es');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    const setSpanish = () => {
        setLanguage('es');
        localStorage.setItem('language', 'es');
    };

    const setEnglish = () => {
        setLanguage('en');
        localStorage.setItem('language', 'en');
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setSpanish, setEnglish, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
