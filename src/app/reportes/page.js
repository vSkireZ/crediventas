export default function Reportes() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reportes Financieros</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfica 1 Simulada */}
        <div className="bg-white p-6 rounded-lg shadow h-80 flex flex-col items-center justify-center border border-dashed border-gray-300">
          <span className="text-4xl mb-2">📈</span>
          <p className="text-gray-500">Gráfica de Ventas Semanales</p>
        </div>

        {/* Gráfica 2 Simulada */}
        <div className="bg-white p-6 rounded-lg shadow h-80 flex flex-col items-center justify-center border border-dashed border-gray-300">
          <span className="text-4xl mb-2">🍰</span>
          <p className="text-gray-500">Distribución de Productos Más Vendidos</p>
        </div>
      </div>
    </div>
  );
}