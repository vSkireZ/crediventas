import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Obtener todos los clientes
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cliente')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo cliente
export async function POST(request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('cliente')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}