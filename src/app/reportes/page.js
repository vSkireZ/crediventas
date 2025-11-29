'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, Package, DollarSign, Calendar, Download } from 'lucide-react';

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes'); // 'semana', 'mes', 'trimestre', 'año'
  const [reportes, setReportes] = useState({
    ventasPorDia: [],
    topProductos: [],
    topClientes: [],
    estadisticasGenerales: {
      ventasTotales: 0,
      clientesActivos: 0,
      productosStock: 0,
      saldosPendientes: 0
    }
  });

  useEffect(() => {
    cargarReportes();
  }, [periodo]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const fechaInicio = obtenerFechaInicio(periodo);
      
      // 1. Ventas por día
      const { data: ventas, error: ventasError } = await supabase
        .from('venta')
        .select('fecha, total')
        .gte('fecha', fechaInicio)
        .order('fecha', { ascending: true });

      if (ventasError) throw ventasError;

      // Agrupar ventas por día
      const ventasPorDia = agruparPorDia(ventas || []);

      // 2. Top 5 productos más vendidos
      const { data: detalles, error: detallesError } = await supabase
        .from('detalle_venta')
        .select(`
          cantidad,
          producto:producto_id (
            nombre
          ),
          venta:venta_id (
            fecha
          )
        `)
        .gte('venta.fecha', fechaInicio);

      if (detallesError) throw detallesError;

      const productosAgrupados = agruparProductos(detalles || []);

      // 3. Top 5 clientes con más compras
      const { data: ventasClientes, error: clientesError } = await supabase
        .from('venta')
        .select(`
          total,
          cliente:cliente_id (
            nombre
          )
        `)
        .gte('fecha', fechaInicio);

      if (clientesError) throw clientesError;

      const clientesAgrupados = agruparClientes(ventasClientes || []);

      // 4. Estadísticas generales
      const { data: statsVentas } = await supabase
        .from('venta')
        .select('total')
        .gte('fecha', fechaInicio);

      const { data: statsClientes } = await supabase
        .from('cliente')
        .select('saldo_pendiente')
        .eq('estado', 'activo');

      const { data: statsProductos } = await supabase
        .from('producto')
        .select('stock')
        .eq('activo', true);

      setReportes({
        ventasPorDia,
        topProductos: productosAgrupados,
        topClientes: clientesAgrupados,
        estadisticasGenerales: {
          ventasTotales: statsVentas?.reduce((sum, v) => sum + parseFloat(v.total || 0), 0) || 0,
          clientesActivos: statsClientes?.length || 0,
          productosStock: statsProductos?.reduce((sum, p) => sum + parseInt(p.stock || 0), 0) || 0,
          saldosPendientes: statsClientes?.reduce((sum, c) => sum + parseFloat(c.saldo_pendiente || 0), 0) || 0
        }
      });

    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerFechaInicio = (periodo) => {
    const hoy = new Date();
    switch(periodo) {
      case 'semana':
        hoy.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        hoy.setMonth(hoy.getMonth() - 1);
        break;
      case 'trimestre':
        hoy.setMonth(hoy.getMonth() - 3);
        break;
      case 'año':
        hoy.setFullYear(hoy.getFullYear() - 1);
        break;
    }
    return hoy.toISOString();
  };

  const agruparPorDia = (ventas) => {
    const agrupado = {};
    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      if (!agrupado[fecha]) {
        agrupado[fecha] = 0;
      }
      agrupado[fecha] += parseFloat(venta.total || 0);
    });
    return Object.entries(agrupado).map(([fecha, total]) => ({ fecha, total }));
  };

  const agruparProductos = (detalles) => {
    const agrupado = {};
    detalles.forEach(detalle => {
      const nombre = detalle.producto?.nombre || 'Desconocido';
      if (!agrupado[nombre]) {
        agrupado[nombre] = 0;
      }
      agrupado[nombre] += parseInt(detalle.cantidad || 0);
    });
    return Object.entries(agrupado)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  const agruparClientes = (ventas) => {
    const agrupado = {};
    ventas.forEach(venta => {
      const nombre = venta.cliente?.nombre || 'Desconocido';
      if (!agrupado[nombre]) {
        agrupado[nombre] = 0;
      }
      agrupado[nombre] += parseFloat(venta.total || 0);
    });
    return Object.entries(agrupado)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const exportarPDF = () => {
    alert('Funcionalidad de exportar a PDF próximamente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const maxVenta = Math.max(...reportes.ventasPorDia.map(v => v.total), 1);
  const maxProducto = Math.max(...reportes.topProductos.map(p => p.cantidad), 1);
  const maxCliente = Math.max(...reportes.topClientes.map(c => c.total), 1);

  return (
    <div className="animate-fadeInUp space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-2">
            Reportes Financieros
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Análisis de ventas, productos y clientes
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="flex-1 sm:flex-initial px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="año">Último año</option>
          </select>
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Ventas Totales"
          value={`$${reportes.estadisticasGenerales.ventasTotales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Clientes Activos"
          value={reportes.estadisticasGenerales.clientesActivos}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Productos en Stock"
          value={reportes.estadisticasGenerales.productosStock}
          icon={<Package className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Saldos Pendientes"
          value={`$${reportes.estadisticasGenerales.saldosPendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Ventas por Día */}
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Ventas por Día</span>
            </h2>
          </div>
          <div className="space-y-3">
            {reportes.ventasPorDia.length === 0 ? (
              <p className="text-center py-12 text-gray-500 text-sm">No hay datos para mostrar</p>
            ) : (
              reportes.ventasPorDia.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.fecha}</span>
                    <span className="font-semibold text-blue-600">
                      ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.total / maxVenta) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Productos */}
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              <span>Productos Más Vendidos</span>
            </h2>
          </div>
          <div className="space-y-3">
            {reportes.topProductos.length === 0 ? (
              <p className="text-center py-12 text-gray-500 text-sm">No hay datos para mostrar</p>
            ) : (
              reportes.topProductos.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-700 truncate">{item.nombre}</span>
                    </div>
                    <span className="font-semibold text-green-600 ml-2">
                      {item.cantidad} unidades
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.cantidad / maxProducto) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Mejores Clientes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportes.topClientes.length === 0 ? (
              <p className="col-span-full text-center py-12 text-gray-500 text-sm">No hay datos para mostrar</p>
            ) : (
              reportes.topClientes.map((item, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md">
                    {index + 1}
                  </div>
                  <p className="font-medium text-gray-900 text-center text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                    {item.nombre}
                  </p>
                  <p className="text-lg font-bold text-purple-600">
                    ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5 md:p-7">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Insights del Periodo</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
            <p className="text-2xl font-bold text-gray-900">
              ${reportes.ventasPorDia.length > 0 
                ? (reportes.estadisticasGenerales.ventasTotales / reportes.ventasPorDia.length).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                : '0.00'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Producto Estrella</p>
            <p className="text-xl font-bold text-gray-900 truncate">
              {reportes.topProductos[0]?.nombre || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-apple-md border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-4 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xs md:text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl md:text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}