import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import type { BugReportResponse } from '@/types/bug';

/**
 * Bug Report API Route Handler with GitHub Integration
 *
 * Environment variables required:
 * - GITHUB_TOKEN: Personal access token with repo scope (secret)
 * - GITHUB_REPO: Owner/repo (e.g., "stevenayal/aiquaa")
 * - BUG_REPORT_TARGET: "github" (default)
 */

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webm', 'mp4', 'txt', 'log'];

// Initialize Octokit
const getOctokit = () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }
  return new Octokit({ auth: token });
};

/**
 * Submit bug report to GitHub Issues
 */
async function submitToGitHub(data: {
  title: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: string;
  impact: string;
  technicalInfo: any;
  attachments: File[];
}): Promise<{ issueNumber: number; issueUrl: string }> {
  const octokit = getOctokit();
  const repo = process.env.GITHUB_REPO || 'stevenayal/aiquaa';
  const [owner, repoName] = repo.split('/');

  if (!owner || !repoName) {
    throw new Error('Invalid GITHUB_REPO format. Expected: owner/repo');
  }

  // Build issue body
  let body = `## 🐛 Bug Report

**Severity:** ${data.severity}
**Impact:** ${data.impact}

### Steps to Reproduce
${data.stepsToReproduce}

### Expected Result
${data.expectedResult}

### Actual Result
${data.actualResult}
`;

  // Add technical information if available
  if (data.technicalInfo) {
    body += `\n### 🔧 Technical Information\n`;
    body += `- **URL:** ${data.technicalInfo.url}\n`;
    body += `- **Browser:** ${data.technicalInfo.userAgent}\n`;
    body += `- **Viewport:** ${data.technicalInfo.viewport.width}x${data.technicalInfo.viewport.height}\n`;
    body += `- **Language:** ${data.technicalInfo.language}\n`;
    body += `- **Timezone:** ${data.technicalInfo.timezone}\n`;
    body += `- **Platform:** ${data.technicalInfo.platform}\n`;
    if (data.technicalInfo.deviceMemory) {
      body += `- **Device Memory:** ${data.technicalInfo.deviceMemory} GB\n`;
    }
    body += `- **Timestamp:** ${data.technicalInfo.timestamp}\n`;
  }

  // Add attachments information
  if (data.attachments.length > 0) {
    body += `\n### 📎 Attachments (${data.attachments.length})\n`;
    for (const file of data.attachments) {
      const sizeKB = (file.size / 1024).toFixed(2);
      body += `- ${file.name} (${sizeKB} KB)\n`;
    }
    body += `\n*Note: Attachments will be uploaded as comments below.*\n`;
  }

  body += `\n---\n*Reported via Bug Report Widget on ${new Date().toLocaleString()}*`;

  // Determine labels based on severity
  const labels = ['bug'];
  if (data.severity === 'Critical') {
    labels.push('priority: critical');
  } else if (data.severity === 'Major') {
    labels.push('priority: high');
  } else {
    labels.push('priority: medium');
  }

  // Add impact label
  if (data.impact === 'High') {
    labels.push('impact: high');
  } else if (data.impact === 'Medium') {
    labels.push('impact: medium');
  }

  // Create the issue
  const issue = await octokit.issues.create({
    owner,
    repo: repoName,
    title: `[Bug] ${data.title}`,
    body,
    labels,
  });

  // Upload attachments as comments with base64 content
  if (data.attachments.length > 0) {
    for (const file of data.attachments) {
      try {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        let commentBody = `### 📎 Attachment: ${file.name}\n\n`;

        // For images, embed them directly
        if (['png', 'jpg', 'jpeg'].includes(extension)) {
          commentBody += `![${file.name}](data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${base64})\n\n`;
        }
        // For text files, show content
        else if (['txt', 'log'].includes(extension)) {
          const text = Buffer.from(buffer).toString('utf-8');
          commentBody += `\`\`\`\n${text}\n\`\`\`\n\n`;
        }
        // For videos, provide download info
        else if (['webm', 'mp4'].includes(extension)) {
          commentBody += `**Video file:** ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\n\n`;
          commentBody += `*Download the video by copying this base64 data and using a base64-to-file converter.*\n\n`;
          commentBody += `<details>\n<summary>Base64 Data (click to expand)</summary>\n\n\`\`\`\n${base64.substring(0, 1000)}...\n\`\`\`\n\n</details>\n`;
        }

        commentBody += `*Uploaded: ${new Date().toLocaleString()}*`;

        await octokit.issues.createComment({
          owner,
          repo: repoName,
          issue_number: issue.data.number,
          body: commentBody,
        });
      } catch (error) {
        console.error(`Failed to upload attachment ${file.name}:`, error);
        // Continue with other attachments even if one fails
      }
    }
  }

  return {
    issueNumber: issue.data.number,
    issueUrl: issue.data.html_url,
  };
}

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

    // Submit to GitHub
    const result = await submitToGitHub({
      title,
      stepsToReproduce,
      expectedResult,
      actualResult,
      severity,
      impact,
      technicalInfo,
      attachments,
    });

    const response: BugReportResponse = {
      success: true,
      message: 'Bug report submitted successfully to GitHub!',
      issueId: `#${result.issueNumber}`,
      issueUrl: result.issueUrl,
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
