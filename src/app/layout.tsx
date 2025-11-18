import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "CrediVentas",
  description: "Sistema de Control de Ventas a Crédito",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        <div className="flex h-screen">
          {/* --- SIDEBAR (Menú Lateral) --- */}
          <aside className="w-64 bg-slate-100 text-black flex flex-col">
            <div className="p-6 text-2xl font-bold text-center border-b border-slate-700">
              CrediVentas 
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/dashboard" className="block p-3 rounded hover:bg-blue-600 transition">
                🏠 Dashboard
              </Link>
              <Link href="/clientes" className="block p-3 rounded hover:bg-blue-600 transition">
                👥 Clientes
              </Link>
              <Link href="/ventas" className="block p-3 rounded hover:bg-blue-600 transition">
                🛒 Registrar Venta
              </Link>
              <Link href="/abonos" className="block p-3 rounded hover:bg-blue-600 transition">
                💲 Saldos y Abonos
              </Link>
              <Link href="/productos" className="block p-3 rounded hover:bg-blue-600 transition">
                📦 Productos
              </Link>
              <Link href="/reportes" className="block p-3 rounded hover:bg-blue-600 transition">
                📊 Reportes
              </Link>
            </nav>
            <div className="p-4 border-t border-slate-700 text-sm text-slate-400 text-center">
              © 2025 Equipo Crediventas
            </div>
          </aside>

          {/* --- CONTENIDO PRINCIPAL --- */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}