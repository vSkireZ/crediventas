'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    limite_credito: 0
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      let query = supabase
        .from('cliente')
        .select('*')
        .order('nombre', { ascending: true });

      if (filterStatus !== 'todos') {
        query = query.eq('estado', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarClientes = async (termino) => {
    setSearchTerm(termino);
    
    if (termino.length < 2) {
      cargarClientes();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, [filterStatus]);

  const abrirModalCrear = () => {
    setModalMode('create');
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      limite_credito: 0
    });
    setShowModal(true);
  };

  const abrirModalEditar = (cliente) => {
    setModalMode('edit');
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      limite_credito: cliente.limite_credito || 0
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedCliente(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      limite_credito: 0
    });
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from('cliente')
          .insert([{
            ...formData,
            saldo_pendiente: 0,
            estado: 'activo'
          }]);

        if (error) throw error;
        alert('Cliente creado exitosamente');
      } else {
        const { error } = await supabase
          .from('cliente')
          .update(formData)
          .eq('id', selectedCliente.id);

        if (error) throw error;
        alert('Cliente actualizado exitosamente');
      }

      cerrarModal();
      cargarClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarCliente = async (cliente) => {
    if (!confirm(`¿Estás seguro de eliminar a ${cliente.nombre}?`)) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('cliente')
        .update({ estado: 'inactivo' })
        .eq('id', cliente.id);

      if (error) throw error;

      alert('Cliente eliminado exitosamente');
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (cliente) => {
    alert(`Detalle de ${cliente.nombre}\n\nDirección: ${cliente.direccion || 'N/A'}\nTeléfono: ${cliente.telefono || 'N/A'}\nSaldo: $${parseFloat(cliente.saldo_pendiente || 0).toFixed(2)}\nLímite: $${parseFloat(cliente.limite_credito || 0).toFixed(2)}`);
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp space-y-6 md:space-y-8">
      {/* Header con mejor espaciado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-2">
            Clientes
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {clientes.length} clientes registrados
          </p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 md:px-6 py-3 md:py-3.5 rounded-xl font-medium hover:bg-blue-700 shadow-apple-sm hover:shadow-apple-md transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Búsqueda y Filtros con espaciado mejorado */}
      <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100 mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="     Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => buscarClientes(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 lg:flex-initial px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="todos">Todos los clientes</option>
              <option value="activo">Activos</option>
              <option value="moroso">Morosos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla con mejor espaciado y scroll horizontal en móvil */}
      <div className="bg-white rounded-2xl shadow-apple-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">Cliente</th>
                <th className="text-left p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">Contacto</th>
                <th className="text-right p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">Saldo Actual</th>
                <th className="text-right p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">Límite Crédito</th>
                <th className="text-center p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">Estado</th>
                <th className="text-center p-4 md:p-5 text-xs md:text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 md:py-20 text-gray-500 text-sm md:text-base">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr 
                    key={cliente.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 md:p-5">
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base mb-1">{cliente.nombre}</p>
                        <p className="text-xs md:text-sm text-gray-500">{cliente.direccion || 'Sin dirección'}</p>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <p className="text-xs md:text-sm text-gray-900">{cliente.telefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <p className={`font-semibold text-sm md:text-base ${
                        parseFloat(cliente.saldo_pendiente) > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        ${parseFloat(cliente.saldo_pendiente || 0).toLocaleString('es-MX', { 
                          minimumFractionDigits: 2 
                        })}
                      </p>
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <p className="text-xs md:text-sm text-gray-600">
                        ${parseFloat(cliente.limite_credito || 0).toLocaleString('es-MX', { 
                          minimumFractionDigits: 2 
                        })}
                      </p>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="flex justify-center">
                        <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-medium ${
                          cliente.estado === 'activo' 
                            ? 'bg-green-100 text-green-700'
                            : cliente.estado === 'moroso'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {cliente.estado === 'activo' ? 'Activo' : 
                           cliente.estado === 'moroso' ? 'Moroso' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => verDetalle(cliente)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button 
                          onClick={() => abrirModalEditar(cliente)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button 
                          onClick={() => eliminarCliente(cliente)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-100">
          <p className="text-xs md:text-sm text-gray-600">
            Mostrando {clientes.length} clientes
          </p>
        </div>
      </div>

      {/* Modal con espaciado mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-apple-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 md:p-7 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
              </h2>
              <button 
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={guardarCliente} className="p-5 md:p-7 space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="331-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Crédito *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limite_credito}
                    onChange={(e) => setFormData({...formData, limite_credito: parseFloat(e.target.value)})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}