import { NextRequest, NextResponse } from 'next/server';
import type { BugReportResponse } from '@/types/bug';

/**
 * Bug Report API Route Handler
 *
 * This is a stub implementation. The actual backend integration should:
 * 1. Validate the incoming data
 * 2. Process attachments
 * 3. Submit to configured target (GitHub, Azure DevOps, Email, or Webhook)
 * 4. Use server-side secrets (GITHUB_TOKEN, AZURE_PAT, etc.) stored in env vars
 *
 * Environment variables:
 * - BUG_REPORT_TARGET: "github" | "azure" | "email" | "webhook"
 * - GITHUB_REPO: Owner/repo (e.g., "anthropics/aiquaa")
 * - GITHUB_TOKEN: Personal access token (secret)
 * - AZURE_ORG: Azure DevOps organization
 * - AZURE_PROJECT: Azure DevOps project
 * - AZURE_PAT: Azure DevOps personal access token (secret)
 * - BUG_REPORT_EMAIL: Email address for bug reports
 * - BUG_REPORT_WEBHOOK_URL: Webhook endpoint URL
 */

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webm', 'mp4', 'txt', 'log'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get('title') as string;
    const stepsToReproduce = formData.get('stepsToReproduce') as string;
    const expectedResult = formData.get('expectedResult') as string;
    const actualResult = formData.get('actualResult') as string;
    const severity = formData.get('severity') as string;
    const impact = formData.get('impact') as string;
    const consent = formData.get('consent') === 'true';
    const technicalInfoStr = formData.get('technicalInfo') as string | null;

    // Validate required fields
    if (!title || !stepsToReproduce || !expectedResult || !actualResult || !severity || !impact) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length > 120) {
      return NextResponse.json(
        { success: false, message: 'Title must be 120 characters or less' },
        { status: 400 }
      );
    }

    // Validate enums
    if (!['Minor', 'Major', 'Critical'].includes(severity)) {
      return NextResponse.json(
        { success: false, message: 'Invalid severity value' },
        { status: 400 }
      );
    }

    if (!['Low', 'Medium', 'High'].includes(impact)) {
      return NextResponse.json(
        { success: false, message: 'Invalid impact value' },
        { status: 400 }
      );
    }

    // Parse technical info
    let technicalInfo = null;
    if (technicalInfoStr && consent) {
      try {
        technicalInfo = JSON.parse(technicalInfoStr);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Invalid technical info format' },
          { status: 400 }
        );
      }
    }

    // Process attachments
    const attachments: File[] = [];
    let totalSize = 0;

    for (const [key, value] of formData.entries()) {
      if (key === 'attachments' && value instanceof File) {
        attachments.push(value);
        totalSize += value.size;
      }
    }

    // Validate attachments
    if (attachments.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, message: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    if (totalSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Total file size exceeds 25 MB' },
        { status: 400 }
      );
    }

    // Validate file extensions
    for (const file of attachments) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
          { success: false, message: `Invalid file type: ${file.name}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Get target from environment
    const target = process.env.BUG_REPORT_TARGET || 'github';

    // STUB: In production, this would actually submit to the configured target
    // For now, we just simulate a successful submission

    console.log('Bug report received:', {
      title,
      severity,
      impact,
      target,
      attachmentsCount: attachments.length,
      hasTechnicalInfo: !!technicalInfo,
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate different responses based on target
    let issueUrl = '';
    let issueId = '';

    switch (target) {
      case 'github':
        issueId = `#${Math.floor(Math.random() * 1000)}`;
        issueUrl = `https://github.com/${process.env.GITHUB_REPO || 'owner/repo'}/issues/${issueId.slice(1)}`;
        break;
      case 'azure':
        issueId = `${Math.floor(Math.random() * 10000)}`;
        issueUrl = `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_workitems/edit/${issueId}`;
        break;
      case 'email':
        issueId = `EMAIL-${Date.now()}`;
        issueUrl = '';
        break;
      case 'webhook':
        issueId = `WEBHOOK-${Date.now()}`;
        issueUrl = process.env.BUG_REPORT_WEBHOOK_URL || '';
        break;
    }

    const response: BugReportResponse = {
      success: true,
      message: `Bug report submitted successfully to ${target}!`,
      issueId,
      issueUrl: issueUrl || undefined,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Bug report submission error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
