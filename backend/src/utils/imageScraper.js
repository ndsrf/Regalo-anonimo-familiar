import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeImageFromUrl(url) {
  if (!url) return null;

  try {
    // Add timeout to avoid hanging
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Try to get og:image meta tag
    let imageUrl = $('meta[property="og:image"]').attr('content');

    // Fallback to twitter:image
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr('content');
    }

    // Fallback to first image with reasonable size
    if (!imageUrl) {
      const images = $('img');
      for (let i = 0; i < images.length; i++) {
        const src = $(images[i]).attr('src');
        if (src && !src.includes('icon') && !src.includes('logo')) {
          imageUrl = src;
          break;
        }
      }
    }

    // Convert relative URLs to absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      const urlObj = new URL(url);
      imageUrl = urlObj.origin + (imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl);
    }

    return imageUrl || null;
  } catch (error) {
    console.error('Error scraping image:', error.message);
    return null;
  }
}
