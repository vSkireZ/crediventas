import "./globals.css";
import Link from "next/link";
import { Home, Users, ShoppingCart, DollarSign, Package, FileText, Settings } from "lucide-react";

export const metadata = {
  title: "CrediVentas",
  description: "Sistema de Control de Ventas a Crédito",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>

      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex h-screen">
          {/* SIDEBAR ESTILO APPLE */}
          <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-100">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                CrediVentas
              </h1>
              <p className="text-xs text-gray-500 mt-1">Sistema de control financiero</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              <NavLink href="/dashboard" icon={Home}>
                Panel Principal
              </NavLink>
              <NavLink href="/clientes" icon={Users}>
                Clientes
              </NavLink>
              <NavLink href="/ventas" icon={ShoppingCart}>
                Registrar Venta
              </NavLink>
              <NavLink href="/abonos" icon={DollarSign}>
                Pagos y Abonos
              </NavLink>
              <NavLink href="/productos" icon={Package}>
                Productos
              </NavLink>
              <NavLink href="/reportes" icon={FileText}>
                Reportes
              </NavLink>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <NavLink href="/configuracion" icon={Settings}>
                  Configuración
                </NavLink>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  EA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Erick Abraham</p>
                  <p className="text-xs text-gray-500 truncate">Administrador</p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

// Componente NavLink reutilizable
function NavLink({ href, icon: Icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group"
    >
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}
