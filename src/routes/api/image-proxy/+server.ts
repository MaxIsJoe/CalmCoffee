// src/routes/api/image-proxy/+server.ts
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) throw error(400, 'Missing image URL');

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Mimic a browser
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*'
      }
    });

    if (!response.ok) throw error(response.status, `Failed to fetch image at ${targetUrl} \n Status: ${response.status} \n Status Text: ${response.statusText}`);

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    console.error('Proxy error:', err);
    throw error(500, 'Proxy failed');
  }
}
