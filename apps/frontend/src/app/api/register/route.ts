import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://aiquaabackend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    // Leer el body de la request
    const body = await request.json();
    
    // Log de la request entrante
    console.log(`[${requestId}] Registration proxy request:`, {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      bodySize: JSON.stringify(body).length,
      timestamp: new Date().toISOString()
    });

    // Validar que el body tenga los campos requeridos
    if (!body.email || !body.name || !body.password) {
      console.warn(`[${requestId}] Invalid request body:`, body);
      return NextResponse.json(
        { error: 'Email, name y password son requeridos' },
        { status: 400 }
      );
    }

    // Validaciones de seguridad adicionales
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      console.warn(`[${requestId}] Invalid email format:`, body.email);
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      console.warn(`[${requestId}] Password too short:`, body.password.length);
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (body.name.length < 2) {
      console.warn(`[${requestId}] Name too short:`, body.name.length);
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Sanitizar el nombre (remover caracteres peligrosos)
    const sanitizedName = body.name.replace(/[<>\"'&]/g, '');
    if (sanitizedName !== body.name) {
      console.warn(`[${requestId}] Name contained dangerous characters, sanitized`);
      body.name = sanitizedName;
    }

    // Reenviar la request al backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AIQUAA-Frontend-Proxy/1.0',
        'X-Request-ID': requestId,
        'X-Forwarded-For': request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        'X-Forwarded-Proto': request.headers.get('x-forwarded-proto') || 'https',
        'X-Forwarded-Host': request.headers.get('host') || 'unknown'
      },
      body: JSON.stringify(body),
      // Timeout de 30 segundos
      signal: AbortSignal.timeout(30000)
    });

    // Leer la respuesta del backend
    const responseText = await backendResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Log de la respuesta del backend
    console.log(`[${requestId}] Backend response:`, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      responseSize: responseText.length,
      timestamp: new Date().toISOString()
    });

    // Devolver la respuesta con el mismo status
    return NextResponse.json(
      responseData,
      { 
        status: backendResponse.status,
        headers: {
          'X-Request-ID': requestId,
          'X-Proxy-Source': 'AIQUAA-Frontend'
        }
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Proxy error:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Timeout del servidor. Intenta nuevamente.' },
          { status: 504 }
        );
      }
      
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'No se pudo contactar con el servidor. Verifica tu conexión.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}

// Manejar OPTIONS para CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
}
