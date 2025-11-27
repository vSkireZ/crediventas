'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    abonosHoy: 0,
    saldoTotal: 0,
    clientesMorosos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_dashboard_stats');

      if (error) throw error;
      
      setStats({
        ventasHoy: data.ventas_hoy || 0,
        abonosHoy: data.abonos_hoy || 0,
        saldoTotal: data.saldo_total || 0,
        clientesMorosos: data.clientes_morosos || 0
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
          Panel Principal
        </h1>
        <p className="text-gray-600">
          Resumen de actividad del día · {new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Ventas de Hoy"
          value={`${stats.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="+12.5%"
          trendUp={true}
          icon="💳"
          color="blue"
        />
        <KPICard
          title="Cobrado Hoy"
          value={`${stats.abonosHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="+8.3%"
          trendUp={true}
          icon="💰"
          color="green"
        />
        <KPICard
          title="Saldo Pendiente"
          value={`${stats.saldoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="-3.2%"
          trendUp={true}
          icon="📊"
          color="orange"
        />
      </div>

      {/* Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Ventas */}
        <div className="bg-white rounded-2xl p-6 shadow-apple-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Últimas Ventas</h2>
          <div className="space-y-3">
            <ActivityItem
              title="Abarrotes Don Pepe"
              subtitle="Venta #1234"
              amount="$850.00"
              time="Hace 15 min"
            />
            <ActivityItem
              title="Tienda La Esquina"
              subtitle="Venta #1233"
              amount="$1,250.00"
              time="Hace 1 hora"
            />
            <ActivityItem
              title="Minisuper Ramírez"
              subtitle="Venta #1232"
              amount="$3,400.00"
              time="Hace 2 horas"
            />
          </div>
        </div>

        {/* Pagos Recientes */}
        <div className="bg-white rounded-2xl p-6 shadow-apple-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Pagos Recientes</h2>
          <div className="space-y-3">
            <ActivityItem
              title="María González"
              subtitle="Abono #789"
              amount="$500.00"
              time="Hace 30 min"
              isPayment={true}
            />
            <ActivityItem
              title="Abarrotes Central"
              subtitle="Abono #788"
              amount="$1,000.00"
              time="Hace 1 hora"
              isPayment={true}
            />
            <ActivityItem
              title="Tienda Los Arcos"
              subtitle="Abono #787"
              amount="$750.00"
              time="Hace 3 horas"
              isPayment={true}
            />
          </div>
        </div>
      </div>

      {/* Alertas/Notificaciones */}
      {stats.clientesMorosos > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {stats.clientesMorosos}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Clientes con pagos próximos a vencer</h3>
              <p className="text-sm text-gray-600">
                Hay {stats.clientesMorosos} clientes con pagos que vencen en los próximos 3 días. 
                <button className="ml-2 text-blue-600 font-medium hover:text-blue-700">
                  Ver detalles →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente KPI Card
function KPICard({ title, value, trend, trendUp, icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple-md border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// Componente Activity Item
function ActivityItem({ title, subtitle, amount, time, isPayment = false }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPayment ? 'bg-green-100' : 'bg-blue-100'}`}>
          <span className="text-lg">{isPayment ? '💵' : '🛒'}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-sm ${isPayment ? 'text-green-600' : 'text-gray-900'}`}>
          {amount}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}