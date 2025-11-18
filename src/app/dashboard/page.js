export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel Principal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm uppercase">Ventas de Hoy</h2>
          <p className="text-3xl font-bold mt-2">$12,500.00</p>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm uppercase">Cobrado Hoy</h2>
          <p className="text-3xl font-bold mt-2">$4,200.00</p>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h2 className="text-gray-500 text-sm uppercase">Saldo Pendiente Total</h2>
          <p className="text-3xl font-bold mt-2">$45,300.00</p>
        </div>
      </div>
    </div>
  );
}