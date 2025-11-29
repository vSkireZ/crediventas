'use client';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, User } from 'lucide-react';
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
      // Cargar productos
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

      // No cargar clientes al inicio (solo cuando busquen)
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
      // Verificar límite de crédito
      const total = calcularTotal();
      const creditoDisponible = parseFloat(clienteSeleccionado.limite_credito || 0) - 
                                parseFloat(clienteSeleccionado.saldo_pendiente || 0);

      if (total > creditoDisponible) {
        alert(`El cliente no tiene crédito suficiente.\nDisponible: $${creditoDisponible.toFixed(2)}\nTotal venta: $${total.toFixed(2)}`);
        setLoading(false);
        return;
      }

      // 1. Crear venta
      console.log('Creando venta...');
      const ventaData = {
        cliente_id: clienteSeleccionado.id,
        empleado_id: '4d7133c3-fb1a-49ee-871a-2c5b0a8d984a', // UUID temporal
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

      // 2. Crear detalles de venta
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

      // 3. Actualizar saldo del cliente manualmente
      const nuevoSaldo = parseFloat(clienteSeleccionado.saldo_pendiente || 0) + calcularTotal();
      
      const { error: updateError } = await supabase
        .from('cliente')
        .update({ saldo_pendiente: nuevoSaldo })
        .eq('id', clienteSeleccionado.id);

      if (updateError) {
        console.error('Error al actualizar saldo:', updateError);
      }

      alert('¡Venta registrada exitosamente!');
      
      // Limpiar formulario
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
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-8">
        Nueva Venta a Crédito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: Selección Cliente + Productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seleccionar Cliente */}
          <div className="bg-white rounded-2xl p-6 shadow-apple-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Cliente
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchCliente}
                onChange={(e) => buscarClientes(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Resultados búsqueda clientes */}
            {clientes.length > 0 && !clienteSeleccionado && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                {clientes.map(cliente => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => seleccionarCliente(cliente)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{cliente.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Crédito disponible: ${(parseFloat(cliente.limite_credito || 0) - parseFloat(cliente.saldo_pendiente || 0)).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {clienteSeleccionado && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{clienteSeleccionado.nombre}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Límite: ${parseFloat(clienteSeleccionado.limite_credito || 0).toFixed(2)} · 
                      Disponible: ${(parseFloat(clienteSeleccionado.limite_credito || 0) - parseFloat(clienteSeleccionado.saldo_pendiente || 0)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setSearchCliente('');
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Catálogo de Productos */}
          <div className="bg-white rounded-2xl p-6 shadow-apple-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-400" />
                Productos
              </h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                value={searchProducto}
                onChange={(e) => buscarProductos(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {productos.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No hay productos disponibles
                </div>
              ) : (
                productos.map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock <= 0}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                        {producto.codigo?.split('-')[1] || 'P'}
                      </div>
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{producto.nombre}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-blue-600 font-semibold">${parseFloat(producto.precio).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Stock: {producto.stock}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Ticket/Carrito */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-apple-lg border border-gray-100 sticky top-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Ticket de Venta</h2>
              <p className="text-sm text-gray-500 mt-1">
                {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Items del carrito */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">El carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.nombre}</p>
                        <p className="text-sm text-gray-600">${parseFloat(item.precio).toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => modificarCantidad(item.id, 'decrementar')}
                          className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.cantidad}</span>
                        <button 
                          type="button"
                          onClick={() => modificarCantidad(item.id, 'incrementar')}
                          className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="p-1 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="p-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${calcularSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (16%)</span>
                <span className="font-medium">${calcularIVA().toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón de confirmación */}
            <div className="p-6 pt-0">
              <button 
                type="button"
                onClick={confirmarVenta}
                disabled={carrito.length === 0 || !clienteSeleccionado || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-apple-md hover:shadow-apple-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-apple-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Procesando...
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