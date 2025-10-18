import { NextRequest, NextResponse } from 'next/server';
import {
  generatePairwise,
  validatePairwiseInput,
  type PairwiseInput,
} from '@aiquaa/allpairs-core';

/**
 * POST /api/labs/allpairs/generate
 *
 * Generate pairwise test combinations from input parameters
 *
 * Request body: { labels: string[], parameters: string[][] }
 * Response: { headers: string[], rows: string[][] } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const input: PairwiseInput = {
      labels: body.labels,
      parameters: body.parameters,
    };

    // Validate input data
    const validationErrors = validatePairwiseInput(input);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Generate pairwise combinations
    const result = generatePairwise(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error generating pairwise combinations:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Disable body size limit for large parameter sets
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
