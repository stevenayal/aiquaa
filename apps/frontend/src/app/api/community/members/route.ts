import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface Member {
  name: string;
  role: string;
  github?: string;
  avatar?: string;
  joined?: string;
  slug: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const idx = line.indexOf(':');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'content', 'community');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    const members: Member[] = files.map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const fm = parseFrontmatter(raw);
      const slug = file.replace('.md', '');
      return {
        slug,
        name: fm.name ?? slug,
        role: fm.role ?? '',
        github: fm.github,
        avatar: fm.github ? `https://github.com/${fm.github}.png` : undefined,
        joined: fm.joined,
      };
    });

    // Sort: joined ascending (oldest first), then alphabetically
    members.sort((a, b) => {
      if (a.joined && b.joined) return a.joined.localeCompare(b.joined);
      if (a.joined) return -1;
      if (b.joined) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ members, count: members.length });
  } catch {
    return NextResponse.json({ members: [], count: 0 });
  }
}
