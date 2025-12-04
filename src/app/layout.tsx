import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from './context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CrediVentas',
  description: 'Sistema de Control de Ventas a Crédito',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
