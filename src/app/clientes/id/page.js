'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setClientes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {/* Tu UI aquí */}
      {clientes.map(cliente => (
        <div key={cliente.id}>
          {cliente.nombre}
        </div>
      ))}
    </div>
  );
}