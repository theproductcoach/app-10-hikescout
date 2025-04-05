import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const latitude = request.nextUrl.searchParams.get('latitude');
    const longitude = request.nextUrl.searchParams.get('longitude');
    const zoom = request.nextUrl.searchParams.get('zoom') || '14';

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Generate a link to OpenStreetMap
    const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;
    
    // Generate a static map URL (using OpenStreetMap's static map service)
    const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;

    return NextResponse.json({
      osmUrl,
      staticMapUrl
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate map data' },
      { status: 500 }
    );
  }
} 