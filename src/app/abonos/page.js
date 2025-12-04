'use client';
import { useState, useEffect } from 'react';
import { Search, DollarSign, CreditCard, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function Abonos() {
  const { t } = useLanguage();
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [referencia, setReferencia] = useState('');
  const [loading, setLoading] = useState(false);

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
        .gt('saldo_pendiente', 0) // Solo clientes con saldo pendiente
        .order('nombre', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClientes([]);
    setSearchCliente(cliente.nombre);
  };

  const registrarAbono = async (e) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
      alert(t.sales.selectClientAlert);
      return;
    }

    const montoNumerico = parseFloat(monto);

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      alert('Por favor ingresa un monto válido'); // TODO: Add to translations if needed
      return;
    }

    const saldoPendiente = parseFloat(clienteSeleccionado.saldo_pendiente);

    if (montoNumerico > saldoPendiente) {
      alert(`El monto no puede ser mayor al saldo pendiente: $${saldoPendiente.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      // Registrar abono
      const { data: abono, error: abonoError } = await supabase
        .from('abono')
        .insert([{
          cliente_id: clienteSeleccionado.id,
          empleado_id: '4d7133c3-fb1a-49ee-871a-2c5b0a8d984a', // TODO: Obtener del contexto de auth
          monto: montoNumerico,
          referencia: referencia || null,
          metodo_pago: metodoPago
        }])
        .select()
        .single();

      if (abonoError) throw abonoError;

      alert(t.payments.successMsg);

      // Limpiar formulario
      setClienteSeleccionado(null);
      setSearchCliente('');
      setMonto('');
      setReferencia('');
      setMetodoPago('efectivo');
    } catch (error) {
      console.error('Error al registrar abono:', error);
      alert(t.common.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeInUp">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2 text-center">
        {t.payments.title}
      </h1>
      <p className="text-gray-600 text-center mb-8">
        {t.payments.subtitle}
      </p>

      <form onSubmit={registrarAbono} className="bg-white p-8 rounded-2xl shadow-apple-lg border border-gray-100">
        {/* Buscar Cliente */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            {t.payments.searchClient}
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchCliente}
              onChange={(e) => buscarClientes(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.payments.searchPlaceholder}
              disabled={loading}
            />
          </div>

          {/* Resultados búsqueda */}
          {clientes.length > 0 && !clienteSeleccionado && (
            <div className="mt-2 bg-white border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
              {clientes.map(cliente => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => seleccionarCliente(cliente)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <p className="font-medium text-gray-900">{cliente.nombre}</p>
                  <p className="text-sm text-red-600 font-semibold">
                    {t.dashboard.pendingBalance}: ${parseFloat(cliente.saldo_pendiente).toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del cliente seleccionado */}
        {clienteSeleccionado && (
          <div className="p-6 bg-blue-50 rounded-xl mb-6 border border-blue-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.payments.selectedClient}:</p>
                <p className="font-semibold text-gray-900 text-lg">{clienteSeleccionado.nombre}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setClienteSeleccionado(null);
                  setSearchCliente('');
                }}
                className="text-red-600 text-sm hover:underline"
              >
                {t.sales.change}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
              <div>
                <p className="text-xs text-gray-600">{t.payments.currentBalance}:</p>
                <p className="text-2xl font-bold text-red-600">
                  ${parseFloat(clienteSeleccionado.saldo_pendiente).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t.payments.creditLimit}:</p>
                <p className="text-lg font-semibold text-gray-700">
                  ${parseFloat(clienteSeleccionado.limite_credito).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monto a abonar */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {t.payments.amountToPay}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl text-3xl font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="     0.00"
              disabled={!clienteSeleccionado || loading}
              required
            />
          </div>
          {clienteSeleccionado && monto && parseFloat(monto) > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {t.payments.newBalance}: ${(parseFloat(clienteSeleccionado.saldo_pendiente) - parseFloat(monto)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Método de pago */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            {t.payments.paymentMethod}
          </label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="efectivo">{t.payments.methods.cash}</option>
            <option value="transferencia">{t.payments.methods.transfer}</option>
            <option value="tarjeta">{t.payments.methods.card}</option>
          </select>
        </div>

        {/* Referencia (opcional) */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t.payments.reference}
          </label>
          <input
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t.payments.referencePlaceholder}
            disabled={loading}
          />
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          disabled={!clienteSeleccionado || !monto || loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 shadow-apple-md hover:shadow-apple-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-apple-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              {t.payments.registering}
            </>
          ) : (
            <>
              {t.payments.registerPayment}
            </>
          )}
        </button>
      </form>
    </div>
  );
}