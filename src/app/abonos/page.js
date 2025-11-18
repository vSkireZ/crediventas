export default function Abonos() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Registrar Abono</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Buscar Cliente</label>
          <input type="text" className="w-full border p-3 rounded" placeholder="Escribe nombre del cliente..." />
        </div>

        <div className="p-4 bg-blue-50 rounded mb-6 border border-blue-100">
          <p className="text-sm text-gray-500">Saldo Actual:</p>
          <p className="text-2xl font-bold text-red-600">$1,500.00</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Monto a Abonar ($)</label>
          <input type="number" className="w-full border p-3 rounded text-2xl font-bold text-green-700" placeholder="0.00" />
        </div>

        <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transform hover:scale-[1.02] transition">
          Registrar Pago 💰
        </button>
      </div>
    </div>
  );
}