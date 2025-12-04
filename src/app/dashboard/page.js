'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    ventasHoy: 0,
    abonosHoy: 0,
    saldoTotal: 0,
    clientesMorosos: 0
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [abonosRecientes, setAbonosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];

      const { data: ventasHoy, error: ventasError } = await supabase
        .from('venta')
        .select('total')
        .gte('fecha', `${hoy}T00:00:00`)
        .lte('fecha', `${hoy}T23:59:59`);

      if (ventasError) throw ventasError;

      const { data: abonosHoy, error: abonosError } = await supabase
        .from('abono')
        .select('monto')
        .gte('fecha', `${hoy}T00:00:00`)
        .lte('fecha', `${hoy}T23:59:59`);

      if (abonosError) throw abonosError;

      const { data: clientes, error: clientesError } = await supabase
        .from('cliente')
        .select('saldo_pendiente, estado');

      if (clientesError) throw clientesError;

      const totalVentas = ventasHoy?.reduce((sum, v) => sum + parseFloat(v.total || 0), 0) || 0;
      const totalAbonos = abonosHoy?.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0) || 0;
      const saldoTotal = clientes?.reduce((sum, c) => sum + parseFloat(c.saldo_pendiente || 0), 0) || 0;
      const morosos = clientes?.filter(c => c.estado === 'moroso').length || 0;

      setStats({
        ventasHoy: totalVentas,
        abonosHoy: totalAbonos,
        saldoTotal: saldoTotal,
        clientesMorosos: morosos
      });

      const { data: ventas } = await supabase
        .from('venta')
        .select('id, total, fecha, cliente:cliente_id(nombre)')
        .order('fecha', { ascending: false })
        .limit(3);

      const { data: abonos } = await supabase
        .from('abono')
        .select('id, monto, fecha, cliente:cliente_id(nombre)')
        .order('fecha', { ascending: false })
        .limit(3);

      setVentasRecientes(ventas || []);
      setAbonosRecientes(abonos || []);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp space-y-6 md:space-y-8">
      {/* Header con más espacio */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-2 md:mb-3">
          {t.dashboard.title}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {t.dashboard.summary} · {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* KPI Cards con espaciado mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-10">
        <KPICard
          title={t.dashboard.salesToday}
          value={`$${stats.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="+12.5%"
          trendUp={true}
          icon="💳"
          color="blue"
        />
        <KPICard
          title={t.dashboard.collectedToday}
          value={`$${stats.abonosHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="+8.3%"
          trendUp={true}
          icon="💰"
          color="green"
        />
        <KPICard
          title={t.dashboard.pendingBalance}
          value={`$${stats.saldoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="-3.2%"
          trendUp={true}
          icon="📊"
          color="orange"
        />
      </div>

      {/* Actividad Reciente con mejor espaciado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Últimas Ventas */}
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
          <h2 className="text-lg md:text-xl font-semibold mb-5 md:mb-6 text-gray-900">{t.dashboard.recentSales}</h2>
          <div className="space-y-3 md:space-y-4">
            {ventasRecientes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8 md:py-12">{t.dashboard.noRecentSales}</p>
            ) : (
              ventasRecientes.map((venta) => (
                <ActivityItem
                  key={venta.id}
                  title={venta.cliente?.nombre || 'Cliente desconocido'}
                  subtitle={`Venta #${venta.id.substring(0, 8)}`}
                  amount={`$${parseFloat(venta.total).toFixed(2)}`}
                  time={formatTimeAgo(venta.fecha, t)}
                />
              ))
            )}
          </div>
        </div>

        {/* Pagos Recientes */}
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
          <h2 className="text-lg md:text-xl font-semibold mb-5 md:mb-6 text-gray-900">{t.dashboard.recentPayments}</h2>
          <div className="space-y-3 md:space-y-4">
            {abonosRecientes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8 md:py-12">{t.dashboard.noRecentPayments}</p>
            ) : (
              abonosRecientes.map((abono) => (
                <ActivityItem
                  key={abono.id}
                  title={abono.cliente?.nombre || 'Cliente desconocido'}
                  subtitle={`Abono #${abono.id.substring(0, 8)}`}
                  amount={`$${parseFloat(abono.monto).toFixed(2)}`}
                  time={formatTimeAgo(abono.fecha, t)}
                  isPayment={true}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alertas con mejor espaciado */}
      {stats.clientesMorosos > 0 && (
        <div className="mt-6 md:mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 md:p-7">
          <div className="flex items-start gap-4 md:gap-5">
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {stats.clientesMorosos}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">
                {t.dashboard.debtorsTitle}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {t.dashboard.debtorsDesc.replace('{count}', stats.clientesMorosos)}
                <button className="ml-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  {t.dashboard.viewDetails} →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4 md:mb-5">
        <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-xl md:text-3xl shadow-sm`}>
          {icon}
        </div>
        <span className={`text-xs md:text-sm font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">{title}</p>
      <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

function ActivityItem({ title, subtitle, amount, time, isPayment = false }) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isPayment ? 'bg-green-100' : 'bg-blue-100'}`}>
          <span className="text-lg md:text-xl">{isPayment ? '💵' : '🛒'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm md:text-base truncate">{title}</p>
          <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className={`font-semibold text-sm md:text-base ${isPayment ? 'text-green-600' : 'text-gray-900'}`}>
          {amount}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function formatTimeAgo(fecha, t) {
  const ahora = new Date();
  const entonces = new Date(fecha);
  const diffMs = ahora - entonces;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return t.dashboard.justNow;
  if (diffMins < 60) return t.dashboard.minsAgo.replace('{count}', diffMins);
  if (diffHours < 24) return t.dashboard.hoursAgo.replace('{count}', diffHours);
  return t.dashboard.daysAgo.replace('{count}', diffDays);
}