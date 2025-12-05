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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200" />
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Mejorado */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-12 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Panel Principal
            </h1>
          </div>
        </div>
        <p className="text-base text-gray-500 ml-5 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Resumen de actividad del día · {new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* KPI Cards Mejorados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Ventas de Hoy"
          value={`$${stats.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="+12.5%"
          trendUp={true}
          icon="💳"
          color="blue"
          delay="0"
        />
        <KPICard
          title="Cobrado Hoy"
          value={`$${stats.abonosHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="+8.3%"
          trendUp={true}
          icon="💰"
          color="green"
          delay="100"
        />
        <KPICard
          title="Saldo Pendiente"
          value={`$${stats.saldoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          trend="-3.2%"
          trendUp={true}
          icon="📊"
          color="orange"
          delay="200"
        />
      </div>

      {/* Actividad Reciente Mejorada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Ventas */}
        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 overflow-hidden relative">
          {/* Efecto de fondo sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <span className="text-2xl">🛒</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Últimas Ventas</h2>
              </div>
              <span className="text-sm text-gray-400 font-medium">Recientes</span>
            </div>
            
            <div className="space-y-3">
              {ventasRecientes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl opacity-50">📭</span>
                  </div>
                  <p className="text-gray-400 text-sm">No hay ventas recientes</p>
                </div>
              ) : (
                ventasRecientes.map((venta, index) => (
                  <ActivityItem
                    key={venta.id}
                    title={venta.cliente?.nombre || 'Cliente desconocido'}
                    subtitle={`Venta #${venta.id.substring(0, 8)}`}
                    amount={`$${parseFloat(venta.total).toFixed(2)}`}
                    time={formatTimeAgo(venta.fecha)}
                    delay={index * 50}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pagos Recientes */}
        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 overflow-hidden relative">
          {/* Efecto de fondo sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                  <span className="text-2xl">💵</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Pagos Recientes</h2>
              </div>
              <span className="text-sm text-gray-400 font-medium">Recientes</span>
            </div>
            
            <div className="space-y-3">
              {abonosRecientes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl opacity-50">📭</span>
                  </div>
                  <p className="text-gray-400 text-sm">No hay pagos recientes</p>
                </div>
              ) : (
                abonosRecientes.map((abono, index) => (
                  <ActivityItem
                    key={abono.id}
                    title={abono.cliente?.nombre || 'Cliente desconocido'}
                    subtitle={`Abono #${abono.id.substring(0, 8)}`}
                    amount={`$${parseFloat(abono.monto).toFixed(2)}`}
                    time={formatTimeAgo(abono.fecha)}
                    isPayment={true}
                    delay={index * 50}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta Mejorada */}
      {stats.clientesMorosos > 0 && (
        <div className="relative group overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-3xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl">
          {/* Patrón de fondo animado */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>
          
          <div className="relative flex items-start gap-5">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-blue-200 transform group-hover:scale-110 transition-transform duration-300">
                  {stats.clientesMorosos}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 text-lg flex items-center gap-2">
                ⚠️ Clientes con pagos próximos a vencer
              </h3>
              <p className="text-gray-600 mb-3 leading-relaxed">
                Hay <span className="font-semibold text-blue-600">{stats.clientesMorosos} clientes</span> con pagos que vencen en los próximos 3 días.
              </p>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5">
                Ver detalles
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, icon, color, delay }) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      bg: "bg-blue-50",
      hover: "hover:shadow-blue-200",
      text: "text-blue-600"
    },
    green: {
      gradient: "from-green-500 via-green-600 to-green-700",
      bg: "bg-green-50",
      hover: "hover:shadow-green-200",
      text: "text-green-600"
    },
    orange: {
      gradient: "from-orange-500 via-orange-600 to-orange-700",
      bg: "bg-orange-50",
      hover: "hover:shadow-orange-200",
      text: "text-orange-600"
    }
  };

  const colorClass = colorClasses[color];

  return (
    <div 
      className={`group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl ${colorClass.hover} transition-all duration-500 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Efecto de brillo en hover */}
      <div className={`absolute inset-0 ${colorClass.bg} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '10px 10px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass.gradient} flex items-center justify-center text-3xl shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            {icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-sm`}>
              {trend}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}
          </p>
        </div>

        {/* Indicador decorativo */}
        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${colorClass.gradient} rounded-full transform origin-left group-hover:scale-x-100 scale-x-75 transition-transform duration-700`} />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, subtitle, amount, time, isPayment = false, delay }) {
  return (
    <div 
      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transform group-hover:scale-110 transition-all duration-300 ${
          isPayment 
            ? 'bg-gradient-to-br from-green-100 to-green-200' 
            : 'bg-gradient-to-br from-blue-100 to-blue-200'
        }`}>
          <span className="text-xl">{isPayment ? '💵' : '🛒'}</span>
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
            isPayment ? 'bg-green-500' : 'bg-blue-500'
          } animate-pulse`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {title}
          </p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0 ml-4">
        <p className={`font-bold text-lg ${isPayment ? 'text-green-600' : 'text-gray-900'} group-hover:scale-110 transition-transform`}>
          {amount}
        </p>
        <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {time}
        </p>
      </div>
    </div>
  );
}

function formatTimeAgo(fecha) {
  const ahora = new Date();
  const entonces = new Date(fecha);
  const diffMs = ahora - entonces;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `Hace ${Math.floor(diffHours / 24)} día${Math.floor(diffHours / 24) > 1 ? 's' : ''}`;
}