import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const tag = searchParams.get('tag');
    const path = searchParams.get('path');

    // Verificar token (allow bypass in development)
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!tag && !path) {
      return NextResponse.json({ error: 'Tag or path is required' }, { status: 400 });
    }

    // Revalidar por tag o path
    if (tag) {
      revalidateTag(tag);
    }

    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      tag: tag || null,
      path: path || null
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}
