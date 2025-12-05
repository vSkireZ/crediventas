'use client';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchProducto, setSearchProducto] = useState('');
  const [searchCliente, setSearchCliente] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data: prodData, error: prodError } = await supabase
        .from('producto')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (prodError) {
        console.error('Error productos:', prodError);
        throw prodError;
      }
      
      setProductos(prodData || []);
      setClientes([]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async (termino) => {
    setSearchProducto(termino);
    
    if (termino.length < 2) {
      cargarDatos();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('producto')
        .select('*')
        .eq('activo', true)
        .or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%`)
        .limit(20);

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error en búsqueda productos:', error);
    }
  };

  const buscarClientes = async (termino) => {
    setSearchCliente(termino);
    
    if (termino.length < 2) {
      setClientes([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .eq('estado', 'activo')
        .limit(10);

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error en búsqueda clientes:', error);
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClientes([]);
    setSearchCliente(cliente.nombre);
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (productoId, accion) => {
    setCarrito(carrito.map(item => {
      if (item.id === productoId) {
        const nuevaCantidad = accion === 'incrementar' 
          ? item.cantidad + 1 
          : Math.max(1, item.cantidad - 1);
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
  };

  const calcularIVA = () => {
    return calcularSubtotal() * 0.16;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA();
  };

  const confirmarVenta = async () => {
    if (!clienteSeleccionado) {
      alert('Por favor selecciona un cliente');
      return;
    }

    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      const total = calcularTotal();
      const creditoDisponible = parseFloat(clienteSeleccionado.limite_credito || 0) - 
                                parseFloat(clienteSeleccionado.saldo_pendiente || 0);

      if (total > creditoDisponible) {
        alert(`El cliente no tiene crédito suficiente.\nDisponible: $${creditoDisponible.toFixed(2)}\nTotal venta: $${total.toFixed(2)}`);
        setLoading(false);
        return;
      }

      console.log('Creando venta...');
      const ventaData = {
        cliente_id: clienteSeleccionado.id,
        empleado_id: '4d7133c3-fb1a-49ee-871a-2c5b0a8d984a',
        subtotal: calcularSubtotal(),
        iva: calcularIVA(),
        total: calcularTotal(),
        plazo: 30,
        estado: 'pendiente'
      };

      const { data: venta, error: ventaError } = await supabase
        .from('venta')
        .insert([ventaData])
        .select()
        .single();

      if (ventaError) {
        console.error('Error al crear venta:', ventaError);
        throw new Error(`Error al crear venta: ${ventaError.message}`);
      }

      console.log('Venta creada:', venta);

      const detalles = carrito.map(prod => ({
        venta_id: venta.id,
        producto_id: prod.id,
        cantidad: prod.cantidad,
        precio_unitario: parseFloat(prod.precio),
        subtotal: parseFloat(prod.precio) * prod.cantidad
      }));

      console.log('Creando detalles:', detalles);

      const { error: detallesError } = await supabase
        .from('detalle_venta')
        .insert(detalles);

      if (detallesError) {
        console.error('Error al crear detalles:', detallesError);
        throw new Error(`Error al crear detalles: ${detallesError.message}`);
      }

      const nuevoSaldo = parseFloat(clienteSeleccionado.saldo_pendiente || 0) + calcularTotal();
      
      const { error: updateError } = await supabase
        .from('cliente')
        .update({ saldo_pendiente: nuevoSaldo })
        .eq('id', clienteSeleccionado.id);

      if (updateError) {
        console.error('Error al actualizar saldo:', updateError);
      }

      alert('¡Venta registrada exitosamente!');
      
      setCarrito([]);
      setClienteSeleccionado(null);
      setSearchCliente('');
      cargarDatos();
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error al registrar venta: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && productos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200" />
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0" />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeInUp space-y-6 md:space-y-8">
      {/* Header Mejorado */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-14 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Nueva Venta a Crédito
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* COLUMNA IZQUIERDA: Selección Cliente + Productos */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Seleccionar Cliente - Mejorado */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-5 flex items-center gap-2 md:gap-3">
                <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                <span>Cliente</span>
              </h2>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchCliente}
                  onChange={(e) => buscarClientes(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 text-sm md:text-base"
                  disabled={loading}
                />
              </div>
              
              {clientes.length > 0 && !clienteSeleccionado && (
                <div className="mt-3 bg-white border-2 border-gray-200 rounded-2xl max-h-48 overflow-y-auto shadow-lg">
                  {clientes.map(cliente => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => seleccionarCliente(cliente)}
                      className="w-full text-left p-3 md:p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent border-b last:border-b-0 transition-all group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover/item:scale-110 transition-transform">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm md:text-base mb-1 group-hover/item:text-blue-600 transition-colors">{cliente.nombre}</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            Crédito disponible: <span className="font-bold text-green-600">${(parseFloat(cliente.limite_credito || 0) - parseFloat(cliente.saldo_pendiente || 0)).toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {clienteSeleccionado && (
                <div className="mt-4 md:mt-5 p-4 md:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        {clienteSeleccionado.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <p className="font-medium text-gray-900 text-sm md:text-base">{clienteSeleccionado.nombre}</p>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Límite: ${parseFloat(clienteSeleccionado.limite_credito || 0).toFixed(2)} · 
                          Disponible: <span className="font-bold text-green-600">${(parseFloat(clienteSeleccionado.limite_credito || 0) - parseFloat(clienteSeleccionado.saldo_pendiente || 0)).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(null);
                        setSearchCliente('');
                      }}
                      className="text-red-600 text-xs md:text-sm hover:underline flex-shrink-0 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Catálogo de Productos - Mejorado */}
          <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2 md:gap-3">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                <span>Productos</span>
              </h2>
            </div>

            <div className="relative mb-4 md:mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchProducto}
                onChange={(e) => buscarProductos(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm md:text-base transition-all hover:border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4 max-h-96 overflow-y-auto">
              {productos.length === 0 ? (
                <div className="col-span-full text-center py-12 md:py-16 text-gray-500 text-sm md:text-base">
                  No hay productos disponibles
                </div>
              ) : (
                productos.map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock <= 0}
                    className="group relative p-4 md:p-5 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm group-hover:scale-110 transition-transform">
                          {producto.codigo?.split('-')[1] || 'P'}
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                          <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 text-sm md:text-base mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">{producto.nombre}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-blue-600 font-semibold text-sm md:text-base">${parseFloat(producto.precio).toFixed(2)}</p>
                        <p className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          producto.stock > 10 
                            ? 'bg-green-100 text-green-700' 
                            : producto.stock > 0 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>Stock: {producto.stock}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Ticket/Carrito (DISEÑO ORIGINAL) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-apple-lg border border-gray-100 sticky top-6">
            <div className="p-5 md:p-7 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Ticket de Venta</h2>
              <p className="text-sm text-gray-500">
                {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            <div className="p-4 md:p-5 max-h-80 overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <ShoppingCart className="w-14 h-14 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-400 text-sm">El carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 md:gap-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base text-gray-900 line-clamp-2 mb-1">{item.nombre}</p>
                        <p className="text-xs md:text-sm text-gray-600">${parseFloat(item.precio).toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <button 
                          type="button"
                          onClick={() => modificarCantidad(item.id, 'decrementar')}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                        </button>
                        <span className="w-7 md:w-8 text-center font-medium text-sm">{item.cantidad}</span>
                        <button 
                          type="button"
                          onClick={() => modificarCantidad(item.id, 'incrementar')}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 md:p-7 border-t border-gray-100 space-y-3 md:space-y-4">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${calcularSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">IVA (16%)</span>
                <span className="font-medium">${calcularIVA().toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-baseline">
                <span className="text-base md:text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  ${calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-5 md:p-7 pt-0">
              <button 
                type="button"
                onClick={confirmarVenta}
                disabled={carrito.length === 0 || !clienteSeleccionado || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 md:py-4 rounded-xl font-semibold text-sm md:text-base hover:from-blue-700 hover:to-blue-800 shadow-apple-md hover:shadow-apple-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-apple-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  'Confirmar Venta'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}