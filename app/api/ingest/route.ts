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

    if (source_type === 'reddit' || source_type === 'unsplash') {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY;
      if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY is not defined in environment variables');

      const res = await fetch(`https://api.unsplash.com/photos?per_page=8&client_id=${accessKey}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`Failed to fetch unsplash data: ${res.status}`);
      
      const photos = await res.json();
      console.log(`Fetched ${photos.length} photos from Unsplash`);
      
      for (const photo of photos) {
        const url = photo.urls?.regular;
        if (url) {
          targetItems.push({ url, keyword_match: 1.0, source_risk: 1.0 });
        }
        if (targetItems.length >= 8) break;
      }
    } else if (source_type === 'url') {
      const urlList = Array.isArray(urls) ? urls : [];
      for (const u of urlList) {
        targetItems.push({ url: u, keyword_match: 1.0, source_risk: 0.5 });
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

    const Content = (await import('@/models/Content')).Content;
    const contentCount = await Content.countDocuments({});
    if (contentCount === 0) {
      return NextResponse.json({
        processed: 0,
        leaks: 0,
        matches: [],
        message: "No reference images uploaded"
      });
    }

    let processed = 0;
    let leaks = 0;
    let suspicious = 0;
    let safe = 0;
    const matches: any[] = [];

    for (const item of targetItems.slice(0, 8)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(item.url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'image/jpeg, image/png',
            'User-Agent': 'Mozilla/5.0'
          }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`Invalid content-type ${contentType}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { isLeak, similarity, match, status } = await processImageBuffer({
          buffer,
          source_type,
          source_url: item.url
        });

        processed++;
        if (status === 'LEAK') leaks++;
        else if (status === 'SUSPICIOUS') suspicious++;
        else safe++;

        console.log(`Processed image: ${item.url} | Similarity: ${similarity}% | Status: ${status}`);

        matches.push({
          source_url: item.url,
          similarity,
          matched_content_id: match ? match.matchedContentId?._id : null,
          isLeak,
          status
        });
      } catch (err: any) {
        console.error(`Failed to process ${item.url}: ${err.message}`);
        // Ensure the image still shows in the UI as processed and SAFE
        processed++;
        safe++;
        matches.push({
          source_url: item.url,
          similarity: 0,
          matched_content_id: null,
          isLeak: false,
          status: 'SAFE'
        });
      }
    }

    console.log(`--- Ingestion Complete ---`);
    console.log(`Processed: ${processed}`);
    console.log(`LEAK: ${leaks} | SUSPICIOUS: ${suspicious} | SAFE: ${safe}`);

    return NextResponse.json({
      processed,
      leaks,
      matches
    });
  } catch (error: any) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
