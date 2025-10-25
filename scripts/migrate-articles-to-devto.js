#!/usr/bin/env node
/**
 * Migration script to publish articles from JSON to DEV.to
 *
 * Usage:
 * 1. Get your DEV.to API key from https://dev.to/settings/extensions
 * 2. Set environment variable: export DEVTO_API_KEY="your-api-key"
 * 3. Run: node scripts/migrate-articles-to-devto.js
 *
 * Features:
 * - Converts JSON articles to DEV.to markdown format
 * - Generates markdown files for manual upload
 * - Optionally publishes directly via API
 */

const fs = require('fs');
const path = require('path');

// Load articles from both JSON files
const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
const postsPath = path.join(__dirname, '..', 'src', 'data', 'posts.json');

let allArticles = [];

try {
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  allArticles = [...articles, ...posts];
  console.log(`✅ Loaded ${allArticles.length} articles (${articles.length} from data/articles.json, ${posts.length} from src/data/posts.json)`);
} catch (error) {
  console.error('❌ Error loading articles:', error.message);
  process.exit(1);
}

/**
 * Convert JSON article to DEV.to markdown format
 * DEV.to uses front matter for metadata
 */
function convertToDevToMarkdown(article) {
  const tags = Array.isArray(article.tags)
    ? article.tags.slice(0, 4).join(', ') // DEV.to max 4 tags
    : '';

  const coverImage = article.image || '';
  const canonicalUrl = `https://aiquaa.com/blog/${article.slug}`;

  // Build front matter
  const frontMatter = `---
title: ${article.title}
published: true
description: ${article.excerpt}
tags: ${tags}
cover_image: ${coverImage}
canonical_url: ${canonicalUrl}
---

`;

  // Combine front matter with content
  return frontMatter + article.content;
}

/**
 * Generate markdown files for manual upload
 */
function generateMarkdownFiles() {
  const outputDir = path.join(__dirname, '..', 'scripts', 'articles-markdown');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('\n📝 Generating markdown files...\n');

  allArticles.forEach((article, index) => {
    const markdown = convertToDevToMarkdown(article);
    const filename = `${String(index + 1).padStart(2, '0')}-${article.slug}.md`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, markdown, 'utf-8');
    console.log(`  ✅ ${filename}`);
  });

  console.log(`\n✅ Generated ${allArticles.length} markdown files in: ${outputDir}`);
  console.log('\n📚 Next steps:');
  console.log('  1. Review the markdown files');
  console.log('  2. Go to https://dev.to/new');
  console.log('  3. Copy/paste each article content');
  console.log('  4. Publish on DEV.to\n');
}

/**
 * Sanitize tags for DEV.to (alphanumeric only, no spaces)
 */
function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return tags
    .slice(0, 4) // DEV.to max 4 tags
    .map(tag => tag.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''))
    .filter(tag => tag.length > 0);
}

/**
 * Sanitize image URL (only valid HTTP(S) URLs)
 */
function sanitizeImageUrl(url) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return undefined; // Skip local URLs
}

/**
 * Delay helper for rate limiting
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Publish articles directly to DEV.to via API
 */
async function publishToDevTo() {
  const apiKey = process.env.DEVTO_API_KEY;

  if (!apiKey) {
    console.error('\n❌ DEVTO_API_KEY environment variable not set');
    console.log('\n📚 To publish via API:');
    console.log('  1. Get your API key: https://dev.to/settings/extensions');
    console.log('  2. Set environment variable: export DEVTO_API_KEY="your-key"');
    console.log('  3. Run this script again\n');
    return;
  }

  console.log('\n🚀 Publishing articles to DEV.to...\n');

  for (let i = 0; i < allArticles.length; i++) {
    const article = allArticles[i];

    try {
      const tags = sanitizeTags(article.tags);
      const mainImage = sanitizeImageUrl(article.image);

      const payload = {
        article: {
          title: article.title,
          published: false, // Save as draft first
          body_markdown: article.content,
          description: article.excerpt,
          tags: tags,
          main_image: mainImage,
          canonical_url: `https://aiquaa.com/blog/${article.slug}`,
        }
      };

      const response = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      console.log(`  ✅ Created draft: ${article.title}`);
      console.log(`     URL: ${result.url}`);

      // Delay between requests to avoid rate limiting (6 seconds)
      if (i < allArticles.length - 1) {
        console.log(`     ⏳ Waiting 6 seconds before next article...\n`);
        await delay(6000);
      }
    } catch (error) {
      console.error(`  ❌ Failed to publish "${article.title}": ${error.message}`);

      // If rate limited, wait longer
      if (error.message.includes('429')) {
        console.log(`     ⏳ Rate limited. Waiting 30 seconds...\n`);
        await delay(30000);
      } else {
        // Wait a bit before retrying next article
        await delay(3000);
      }
    }
  }

  console.log('\n✅ Done! Check your DEV.to dashboard for drafts.');
  console.log('   Dashboard: https://dev.to/dashboard\n');
}

// Main execution
async function main() {
  console.log('\n🔄 AIQUAA Articles Migration to DEV.to\n');
  console.log('Articles to migrate:');
  allArticles.forEach((article, index) => {
    console.log(`  ${index + 1}. ${article.title}`);
  });

  // Generate markdown files (always)
  generateMarkdownFiles();

  // Ask if user wants to publish via API
  if (process.argv.includes('--publish')) {
    await publishToDevTo();
  } else {
    console.log('\n💡 To publish via API, run: node scripts/migrate-articles-to-devto.js --publish\n');
  }
}

main().catch(console.error);
