'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDB() {
  const [status, setStatus] = useState('Probando conexión...');
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    async function testConexion() {
      try {
        const { data, error } = await supabase
          .from('producto')
          .select('*')
          .limit(5);

        if (error) throw error;

        setStatus('✅ Conexión exitosa');
        setProductos(data || []);
      } catch (error) {
        setStatus(`❌ Error: ${error.message}`);
      }
    }
    testConexion();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Conexión</h1>
      <p className="text-lg mb-4">{status}</p>
      <div>
        <p className="font-semibold">Productos encontrados: {productos.length}</p>
        <ul className="mt-2">
          {productos.map(p => (
            <li key={p.id} className="text-sm">
              {p.codigo} - {p.nombre} - ${p.precio}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}