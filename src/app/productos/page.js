'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('todos');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      let query = supabase
        .from('producto')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      // Aplicar filtro de stock
      if (filterStock === 'bajo') {
        query = query.lte('stock', supabase.raw('stock_minimo'));
      } else if (filterStock === 'agotado') {
        query = query.eq('stock', 0);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async (termino) => {
    setSearchTerm(termino);
    
    if (termino.length < 2) {
      cargarProductos();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('producto')
        .select('*')
        .eq('activo', true)
        .or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%`)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [filterStock]);

  const obtenerEstadoStock = (producto) => {
    if (producto.stock === 0) {
      return { label: 'Agotado', color: 'bg-red-100 text-red-700' };
    } else if (producto.stock <= producto.stock_minimo) {
      return { label: 'Bajo Stock', color: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { label: 'Disponible', color: 'bg-green-100 text-green-700' };
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            Inventario de Productos
          </h1>
          <p className="text-gray-600">
            {productos.length} productos registrados
          </p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-green-700 shadow-apple-sm hover:shadow-apple-md transition-all duration-200">
          <Plus className="w-5 h-5" />
          Agregar Producto
        </button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-6 shadow-apple-md border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={searchTerm}
              onChange={(e) => buscarProductos(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de stock */}
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los productos</option>
              <option value="bajo">Bajo stock</option>
              <option value="agotado">Agotados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl shadow-apple-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Código</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Producto</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">Precio</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Stock</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Mín.</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Estado</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productos.map((producto) => {
                  const estado = obtenerEstadoStock(producto);
                  return (
                    <tr 
                      key={producto.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {producto.codigo}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          {producto.descripcion && (
                            <p className="text-sm text-gray-500 line-clamp-1">{producto.descripcion}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(producto.precio).toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${
                          producto.stock === 0 
                            ? 'text-red-600' 
                            : producto.stock <= producto.stock_minimo 
                            ? 'text-yellow-600' 
                            : 'text-gray-900'
                        }`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-gray-500">
                          {producto.stock_minimo}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color} flex items-center gap-1`}>
                            {producto.stock <= producto.stock_minimo && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {estado.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Mostrando {productos.length} productos
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de productos con bajo stock */}
      {productos.some(p => p.stock <= p.stock_minimo) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Productos con stock bajo o agotado
              </h3>
              <p className="text-sm text-gray-600">
                Hay {productos.filter(p => p.stock <= p.stock_minimo).length} productos que requieren reabastecimiento.
                <button className="ml-2 text-yellow-700 font-medium hover:text-yellow-800">
                  Ver lista →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}