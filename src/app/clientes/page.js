export default function Clientes() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cartera de Clientes</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4 font-semibold">Nombre</th>
              <th className="text-left p-4 font-semibold">Teléfono</th>
              <th className="text-left p-4 font-semibold">Dirección</th>
              <th className="text-right p-4 font-semibold">Saldo Deudor</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Ejemplo estático */}
            <tr className="border-b hover:bg-gray-50">
              <td className="p-4">Abarrotes Don Pepe</td>
              <td className="p-4">331-123-4567</td>
              <td className="p-4">Av. Siempre Viva 123</td>
              <td className="p-4 text-right font-bold text-red-600">$1,500.00</td>
              <td className="p-4 text-center">
                <button className="text-blue-500 hover:underline">Ver Detalle</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}