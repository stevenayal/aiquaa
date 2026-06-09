import { NextResponse } from 'next/server';
import { OPENAPI_SPEC } from '@/app/assessments/api-banking/data/openapi-spec';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    headers: {
      'Content-Disposition': 'attachment; filename="banking-api-openapi.json"',
      'Content-Type': 'application/json',
    },
  });
}
