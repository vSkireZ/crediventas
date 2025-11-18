export default function Productos() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Agregar Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Producto</th>
              <th className="text-right p-3">Precio</th>
              <th className="text-center p-3">Stock</th>
              <th className="text-center p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">PROD-001</td>
              <td className="p-3 font-medium">Coca Cola 600ml</td>
              <td className="p-3 text-right">$18.00</td>
              <td className="p-3 text-center">54</td>
              <td className="p-3 text-center"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Disponible</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}