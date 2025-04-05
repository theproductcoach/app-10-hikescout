import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const DEFAULT_IMAGE = {
  url: '/hikingimage.png',
  alt: 'Default hiking landscape',
  credit: {
    name: '',
    link: ''
  }
};

function getHikeSearchTerm(terrain: string = '', vibe: string = '') {
  // Base search term
  let searchTerm = 'hiking trail';

  // Add terrain-specific terms
  if (terrain) {
    switch (terrain.toLowerCase()) {
      case 'woodland':
        searchTerm = 'forest hiking trail nature';
        break;
      case 'hills':
        searchTerm = 'mountain hiking trail landscape';
        break;
      case 'coast':
        searchTerm = 'coastal hiking trail ocean';
        break;
      case 'mixed':
        searchTerm = 'scenic hiking trail landscape';
        break;
    }
  }

  // Add vibe-specific terms
  if (vibe) {
    switch (vibe) {
      case 'Chill & Scenic':
        searchTerm += ' peaceful scenic';
        break;
      case 'Epic Views':
        searchTerm += ' panoramic vista viewpoint';
        break;
      case 'Adventure & Challenge':
        searchTerm += ' challenging rugged';
        break;
      case 'Forest Bathing':
        searchTerm += ' forest nature tranquil';
        break;
    }
  }

  return searchTerm;
}

export async function GET(request: NextRequest) {
  try {
    const terrain = request.nextUrl.searchParams.get('terrain');
    const vibe = request.nextUrl.searchParams.get('vibe');

    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.error('Missing Unsplash API key');
      return NextResponse.json(DEFAULT_IMAGE);
    }

    const searchTerm = getHikeSearchTerm(terrain, vibe);
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchTerm
      )}&orientation=landscape&per_page=3`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }

    const data = await response.json();
    
    if (!data.results?.length) {
      return NextResponse.json(DEFAULT_IMAGE);
    }

    return NextResponse.json(data.results.map((image: any) => ({
      title: image.alt_description || 'Hiking trail view',
      url: image.urls.regular,
      alt: image.alt_description || 'Hiking trail landscape',
      credit: {
        name: image.user.name,
        link: image.user.links.html
      }
    })));
  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json([DEFAULT_IMAGE]);
  }
} 