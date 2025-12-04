'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function Productos() {
  const { t } = useLanguage();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    stock_minimo: 5
  });

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
      alert(t.common.error + ': ' + error.message);
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

  const abrirModalCrear = () => {
    setModalMode('create');
    setFormData({
      codigo: `PROD-${Date.now().toString().slice(-6)}`,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      stock_minimo: 5
    });
    setShowModal(true);
  };

  const abrirModalEditar = (producto) => {
    setModalMode('edit');
    setSelectedProducto(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      stock_minimo: 5
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from('producto')
          .insert([{
            ...formData,
            activo: true
          }]);

        if (error) throw error;
        alert(t.common.success);
      } else {
        const { error } = await supabase
          .from('producto')
          .update(formData)
          .eq('id', selectedProducto.id);

        if (error) throw error;
        alert(t.common.success);
      }

      cerrarModal();
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(t.common.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (producto) => {
    if (!confirm(t.common.confirmDelete)) {
      return;
    }

    setLoading(true);

    try {
      // Soft delete
      const { error } = await supabase
        .from('producto')
        .update({ activo: false })
        .eq('id', producto.id);

      if (error) throw error;

      alert(t.common.success);
      cargarProductos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(t.common.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const obtenerEstadoStock = (producto) => {
    if (producto.stock === 0) {
      return { label: t.products.status.outOfStock, color: 'bg-red-100 text-red-700' };
    } else if (producto.stock <= producto.stock_minimo) {
      return { label: t.products.status.lowStock, color: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { label: t.products.status.available, color: 'bg-green-100 text-green-700' };
    }
  };

  if (loading && productos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-2">
            {t.products.title}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {t.products.subtitle.replace('{count}', productos.length)}
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-5 md:px-6 py-3 md:py-3.5 rounded-xl font-medium hover:bg-green-700 shadow-apple-sm hover:shadow-apple-md transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>{t.products.addProduct}</span>
        </button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100 mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.products.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => buscarProductos(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="flex-1 lg:flex-initial px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="todos">{t.products.filterAll}</option>
              <option value="bajo">{t.products.filterLow}</option>
              <option value="agotado">{t.products.filterOut}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-apple-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.code}</th>
                <th className="text-left p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.product}</th>
                <th className="text-right p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.price}</th>
                <th className="text-center p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.stock}</th>
                <th className="text-center p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.min}</th>
                <th className="text-center p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.status}</th>
                <th className="text-center p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">{t.products.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 md:py-20 text-gray-500 text-sm md:text-base">
                    {t.products.noProducts}
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
                      <td className="p-4 md:p-5">
                        <span className="font-mono text-xs md:text-sm text-gray-600 bg-gray-100 px-2.5 py-1 md:px-3 md:py-1.5 rounded">
                          {producto.codigo}
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <div>
                          <p className="font-medium text-gray-900 text-sm md:text-base mb-1">{producto.nombre}</p>
                          {producto.descripcion && (
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{producto.descripcion}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-right">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">
                          ${parseFloat(producto.precio).toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4 md:p-5 text-center">
                        <span className={`font-semibold text-sm md:text-base ${producto.stock === 0
                            ? 'text-red-600'
                            : producto.stock <= producto.stock_minimo
                              ? 'text-yellow-600'
                              : 'text-gray-900'
                          }`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="p-4 md:p-5 text-center">
                        <span className="text-xs md:text-sm text-gray-500">
                          {producto.stock_minimo}
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex justify-center">
                          <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-medium ${estado.color} flex items-center gap-1`}>
                            {producto.stock <= producto.stock_minimo && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {estado.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalEditar(producto)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title={t.common.edit}
                          >
                            <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title={t.common.delete}
                          >
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-5 border-t border-gray-100">
          <p className="text-xs md:text-sm text-gray-600">
            {t.products.subtitle.replace('{count}', productos.length)}
          </p>
        </div>
      </div>

      {/* Alerta */}
      {productos.some(p => p.stock <= p.stock_minimo) && (
        <div className="mt-6 md:mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 md:p-7">
          <div className="flex items-start gap-4 md:gap-5">
            <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">
                {t.products.lowStockAlert}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {t.products.lowStockDesc.replace('{count}', productos.filter(p => p.stock <= p.stock_minimo).length)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-apple-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 md:p-7 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? t.products.newProduct : t.products.editProduct}
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={guardarProducto} className="p-5 md:p-7 space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.products.form.code} *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="PROD-001"
                  disabled={modalMode === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.products.form.name} *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.products.form.description}</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción opcional del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.products.form.price} *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.products.form.stock} *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.products.form.minStock} *</label>
                <input
                  type="number"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? t.common.processing : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}