import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { processImageBuffer } from '@/lib/detection';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { source_type, urls, blog_url } = body;

    const KEYWORDS = ['nba', 'nfl', 'soccer', 'football', 'messi', 'lebron', 'sports', 'game', 'highlight', 'team', 'player', 'league', 'match'];
    const checkKeywords = (text: string) => {
      if (!text) return 0;
      const lower = text.toLowerCase();
      return KEYWORDS.some(kw => lower.includes(kw)) ? 1 : 0;
    };

    let targetItems: { url: string, keyword_match: number, source_risk: number }[] = [];

    if (source_type === 'reddit') {
      const res = await fetch('https://www.reddit.com/r/sports/new.json', {
        headers: { 'User-Agent': 'SportsLeakDetector/1.0' }
      });
      if (!res.ok) throw new Error('Failed to fetch reddit data');
      const data = await res.json();
      const posts = data.data.children;
      for (const post of posts) {
        const url = post.data.url;
        const title = post.data.title;
        const kwMatch = checkKeywords(title);
        
        // Only process posts/images where metadata matches keywords
        if (kwMatch === 0) continue;

        if (url && url.match(/\.(jpeg|jpg|gif|png)$/i)) {
          targetItems.push({ url, keyword_match: kwMatch, source_risk: 1.0 });
        }
        if (targetItems.length >= 10) break;
      }
    } else if (source_type === 'url') {
      const urlList = Array.isArray(urls) ? urls : [];
      for (const u of urlList) {
        targetItems.push({ url: u, keyword_match: checkKeywords(u), source_risk: 0.5 });
      }
    } else if (source_type === 'blog') {
      if (!blog_url) throw new Error('blog_url is required');
      const res = await fetch(blog_url);
      if (!res.ok) throw new Error('Failed to fetch blog');
      const html = await res.text();
      
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';
      const kwMatch = checkKeywords(title) || checkKeywords(blog_url);
      
      // Only process if blog matches keywords
      if (kwMatch === 1) {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
          let imgUrl = match[1];
          if (imgUrl.startsWith('/')) {
            const urlObj = new URL(blog_url);
            imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
          }
          targetItems.push({ url: imgUrl, keyword_match: kwMatch, source_risk: 1.0 });
          if (targetItems.length >= 5) break;
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid source_type' }, { status: 400 });
    }

    let processed = 0;
    let leaksDetected = 0;
    const results = [];

    for (const item of targetItems) {
      try {
        const res = await fetch(item.url);
        if (!res.ok) continue;

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) continue;

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { isLeak, similarity } = await processImageBuffer({
          buffer,
          source_type,
          source_url: item.url
        });

        // Calculate confidence
        const confidenceScore = (0.7 * similarity) + (0.2 * (item.keyword_match * 100)) + (0.1 * (item.source_risk * 100));

        processed++;
        if (isLeak) leaksDetected++;

        results.push({
          source_url: item.url,
          similarity,
          isLeak,
          confidence: Math.round(confidenceScore * 10) / 10
        });
      } catch (err) {
        console.error(`Failed to process ${item.url}:`, err);
        // Continue processing remaining images
      }
    }

    return NextResponse.json({
      processed,
      leaksDetected,
      results
    });
  } catch (error: any) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
