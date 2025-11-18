export default function Ventas() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Columna Izquierda: Buscador de Productos */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Seleccionar Productos</h2>
        <input 
          type="text" 
          placeholder="🔍 Buscar producto por nombre o código..." 
          className="w-full p-3 border rounded-lg mb-4 bg-gray-50"
        />
        
        <div className="grid grid-cols-2 gap-4">
          {/* Simulacion de productos */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border p-4 rounded hover:bg-blue-50 cursor-pointer transition">
              <div className="font-bold">Coca Cola 600ml</div>
              <div className="text-blue-600 font-bold">$18.00</div>
              <div className="text-xs text-gray-500">Stock: 50</div>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Ticket de Venta */}
      <div className="bg-slate-50 p-6 rounded-lg shadow border border-slate-200 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Ticket de Venta</h2>
        
        <div className="flex-1 bg-white border rounded p-2 mb-4 overflow-y-auto">
          <p className="text-center text-gray-400 mt-10">El carrito está vacío</p>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>TOTAL:</span>
            <span>$0.00</span>
          </div>
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
            Confirmar Venta ✅
          </button>
        </div>
      </div>
    </div>
  );
}