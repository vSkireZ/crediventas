'use client';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function Ventas() {
  const { t } = useLanguage();
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
      alert(t.common.error + ': ' + error.message);
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
      alert(t.sales.selectClientAlert);
      return;
    }

    if (carrito.length === 0) {
      alert(t.sales.emptyCart);
      return;
    }

    setLoading(true);

    try {
      const total = calcularTotal();
      const creditoDisponible = parseFloat(clienteSeleccionado.limite_credito || 0) -
        parseFloat(clienteSeleccionado.saldo_pendiente || 0);

      if (total > creditoDisponible) {
        alert(`${t.sales.insufficientCredit}.\n${t.sales.available}: $${creditoDisponible.toFixed(2)}\n${t.sales.total}: $${total.toFixed(2)}`);
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

      alert(t.sales.successMsg);

      setCarrito([]);
      setClienteSeleccionado(null);
      setSearchCliente('');
      cargarDatos();
    } catch (error) {
      console.error('Error completo:', error);
      alert(t.sales.errorMsg + ': ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-6 md:mb-8">
        {t.sales.title}
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* COLUMNA IZQUIERDA: Selección Cliente + Productos */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Seleccionar Cliente */}
          <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-5 flex items-center gap-2 md:gap-3">
              <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              <span>{t.sales.selectClient}</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.sales.searchClient}
                value={searchCliente}
                onChange={(e) => buscarClientes(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                disabled={loading}
              />
            </div>

            {clientes.length > 0 && !clienteSeleccionado && (
              <div className="mt-3 bg-white border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                {clientes.map(cliente => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => seleccionarCliente(cliente)}
                    className="w-full text-left p-3 md:p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm md:text-base mb-1">{cliente.nombre}</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {t.sales.availableCredit}: ${(parseFloat(cliente.limite_credito || 0) - parseFloat(cliente.saldo_pendiente || 0)).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {clienteSeleccionado && (
              <div className="mt-4 md:mt-5 p-4 md:p-5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base mb-2">{clienteSeleccionado.nombre}</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {t.sales.limit}: ${parseFloat(clienteSeleccionado.limite_credito || 0).toFixed(2)} ·
                      {t.sales.available}: ${(parseFloat(clienteSeleccionado.limite_credito || 0) - parseFloat(clienteSeleccionado.saldo_pendiente || 0)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setSearchCliente('');
                    }}
                    className="text-red-600 text-xs md:text-sm hover:underline flex-shrink-0"
                  >
                    {t.sales.change}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Catálogo de Productos */}
          <div className="bg-white rounded-2xl p-5 md:p-7 shadow-apple-md border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2 md:gap-3">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                <span>{t.sales.products}</span>
              </h2>
            </div>

            <div className="relative mb-4 md:mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.sales.searchProduct}
                value={searchProducto}
                onChange={(e) => buscarProductos(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm md:text-base"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4 max-h-96 overflow-y-auto">
              {productos.length === 0 ? (
                <div className="col-span-full text-center py-12 md:py-16 text-gray-500 text-sm md:text-base">
                  {t.sales.noProducts}
                </div>
              ) : (
                productos.map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock <= 0}
                    className="p-4 md:p-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                        {producto.codigo?.split('-')[1] || 'P'}
                      </div>
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm md:text-base mb-2 line-clamp-2 min-h-[2.5rem]">{producto.nombre}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-blue-600 font-semibold text-sm md:text-base">${parseFloat(producto.precio).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{t.sales.stock}: {producto.stock}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Ticket/Carrito */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-apple-lg border border-gray-100 sticky top-6">
            <div className="p-5 md:p-7 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">{t.sales.ticket}</h2>
              <p className="text-sm text-gray-500">
                {t.sales.items.replace('{count}', carrito.length)}
              </p>
            </div>

            <div className="p-4 md:p-5 max-h-80 overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <ShoppingCart className="w-14 h-14 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-400 text-sm">{t.sales.emptyCart}</p>
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
                <span className="text-gray-600">{t.sales.subtotal}</span>
                <span className="font-medium">${calcularSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">{t.sales.tax}</span>
                <span className="font-medium">${calcularIVA().toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-baseline">
                <span className="text-base md:text-lg font-semibold text-gray-900">{t.sales.total}</span>
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
                    <span>{t.common.processing}</span>
                  </>
                ) : (
                  t.sales.confirmSale
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}