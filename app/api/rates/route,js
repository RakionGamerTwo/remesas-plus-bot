import { NextResponse } from "next/server";
import { getRates } from "../../../lib/fetchRates";

// Forzar a Next.js a que no guarde en caché estática esta ruta, 
// asegurando que cada consulta ejecute el scraping/fetch en tiempo real.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Ejecutas la función de tu librería
    const rates = await getRates();

    // 2. Retornas las tasas en formato JSON
    return NextResponse.json({ 
      success: true, 
      data: rates 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching rates:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: "No se pudieron obtener las tasas actuales" 
    }, { status: 500 });
  }
}
