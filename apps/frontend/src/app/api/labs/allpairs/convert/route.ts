import { NextRequest, NextResponse } from 'next/server';
import { parseJsonOrYaml, validatePairwiseInput } from '@aiquaa/allpairs-core';

/**
 * POST /api/labs/allpairs/convert
 *
 * Convert JSON or YAML text to normalized pairwise input format
 *
 * Request body: { text: string }
 * Response: { labels: string[], parameters: string[][] } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !body.text) {
      return NextResponse.json(
        { error: 'Request body must contain "text" field' },
        { status: 400 }
      );
    }

    const text = body.text.trim();

    if (text.length === 0) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    // Parse JSON or YAML
    let parsed;
    try {
      parsed = parseJsonOrYaml(text);
    } catch (parseError: any) {
      return NextResponse.json(
        {
          error: 'Failed to parse JSON/YAML',
          message: parseError?.message || 'Invalid format',
        },
        { status: 400 }
      );
    }

    // Validate the parsed data
    const validationErrors = validatePairwiseInput(parsed);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Parsed data is invalid',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: any) {
    console.error('Error converting JSON/YAML:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
