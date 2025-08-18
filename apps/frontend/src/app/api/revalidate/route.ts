import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const tag = searchParams.get('tag');

    // Verificar token
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
    }

    // Revalidar el tag
    revalidateTag(tag);

    return NextResponse.json({ revalidated: true, tag });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}
