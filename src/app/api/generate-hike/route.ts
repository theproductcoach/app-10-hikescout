import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getVibeContext(vibe: string): string {
  const vibeContexts = {
    "Chill & Scenic": "a relaxed and scenic hike with plenty of opportunities to take in beautiful views, suitable for a laid-back day out",
    "Epic Views": "a hike that prioritizes reaching stunning viewpoints and panoramic vistas, potentially including peaks or elevated positions",
    "Adventure & Challenge": "a more challenging and adventurous hike that might include some scrambling, steeper sections, or interesting terrain features",
    "Forest Bathing": "a peaceful woodland walk focused on tranquility and nature immersion, perfect for mindfulness and relaxation",
  };
  
  return vibeContexts[vibe as keyof typeof vibeContexts] || "a suitable hike matching your preferences";
}

export async function POST(request: NextRequest) {
  try {
    const { startLocation, duration, distance, terrain, foodPreference, vibe } = await request.json();

    const vibeContext = getVibeContext(vibe);
    const prompt = `Generate a hiking trip recommendation from ${startLocation} with the following preferences:
- Hike duration: ${duration}
- Distance willing to travel from ${startLocation}: ${distance}
- Preferred terrain: ${terrain}
- Food/coffee preferences: ${foodPreference}
- Desired vibe: ${vibe}

Please recommend ${vibeContext}.

Please provide a response in JSON format with the following structure:
{
  "name": "Name of the hike",
  "location": {
    "name": "Full name of the location",
    "carpark": {
      "description": "Detailed description of the car park or arrival point",
      "coordinates": {
        "latitude": "Precise latitude of car park",
        "longitude": "Precise longitude of car park"
      }
    },
    "trailhead": {
      "description": "Detailed description of the actual trail starting point",
      "coordinates": {
        "latitude": "Precise latitude of trailhead",
        "longitude": "Precise longitude of trailhead"
      }
    },
    "region": "Region or area name",
    "country": "Country name"
  },
  "transport": "Detailed transport instructions from ${startLocation}",
  "description": "Description of the hike and surroundings, emphasizing aspects that match the desired ${vibe} vibe",
  "difficulty": "Easy/Moderate/Hard",
  "foodStops": "Recommended food and drink stops",
  "returnOptions": "Return transport options to ${startLocation}",
  "tips": "Specific recommendations for what to bring and prepare for this hike, considering the terrain, typical weather conditions, and the ${vibe} experience",
  "images": [
    {
      "title": "Starting Point",
      "description": "A detailed, photographic description of the starting point scene, including notable landmarks, terrain features, and the surrounding environment",
      "prompt": "A carefully crafted prompt suitable for image generation, focusing on the key visual elements of this scene"
    },
    {
      "title": "Scenic Highlight",
      "description": "A detailed, photographic description of the most scenic or notable point along the hike, capturing the essence of the ${vibe} vibe",
      "prompt": "A carefully crafted prompt suitable for image generation, focusing on the key visual elements of this scenic viewpoint"
    },
    {
      "title": "Trail Character",
      "description": "A detailed, photographic description of the typical trail conditions and surrounding environment that hikers will experience",
      "prompt": "A carefully crafted prompt suitable for image generation, focusing on the key visual elements of the trail environment"
    }
  ]
}

For each image description and prompt, please be very specific and detailed, including:
- Time of day and lighting conditions
- Terrain features and natural elements
- Colors and textures
- Perspective and composition
- Weather and atmospheric conditions
- Scale and depth
Ensure the descriptions are vivid and would work well for image generation.
Make sure to provide different coordinates for carpark and trailhead if they are in different locations.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable hiking guide and professional photographer who knows hiking routes worldwide. Provide detailed, practical recommendations that include transport links, food options, and specific tips for preparation and safety. For the image descriptions, think like a photographer and provide rich, detailed visual descriptions that capture the essence of each scene. Ensure the recommendations and visual descriptions match the requested vibe and atmosphere of the hike. Always provide realistic and accurate GPS coordinates for both parking and trailhead locations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const hikeRecommendation = JSON.parse(responseContent);

    // Generate DALL-E images for each image prompt
    const imagePromises = hikeRecommendation.images.map(async (image: any) => {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${image.prompt}. This should be a photorealistic image of a hiking trail or natural landscape, no text or people.`,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "natural"
        });

        return {
          ...image,
          url: response.data[0]?.url || null
        };
      } catch (error) {
        console.error('Error generating image:', error);
        return {
          ...image,
          url: null,
          error: 'Failed to generate image'
        };
      }
    });

    // Wait for all images to be generated
    hikeRecommendation.images = await Promise.all(imagePromises);

    // Add Google Maps URLs for carpark and trailhead
    if (hikeRecommendation.location.carpark?.coordinates) {
      const { latitude, longitude } = hikeRecommendation.location.carpark.coordinates;
      hikeRecommendation.location.carpark.mapUrl = 
        `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    if (hikeRecommendation.location.trailhead?.coordinates) {
      const { latitude, longitude } = hikeRecommendation.location.trailhead.coordinates;
      hikeRecommendation.location.trailhead.mapUrl = 
        `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    // Add combined map URL showing both locations
    if (hikeRecommendation.location.carpark?.coordinates && hikeRecommendation.location.trailhead?.coordinates) {
      const carparkCoords = `${hikeRecommendation.location.carpark.coordinates.latitude},${hikeRecommendation.location.carpark.coordinates.longitude}`;
      const trailheadCoords = `${hikeRecommendation.location.trailhead.coordinates.latitude},${hikeRecommendation.location.trailhead.coordinates.longitude}`;
      hikeRecommendation.location.combinedMapUrl = 
        `https://www.google.com/maps?q=${carparkCoords}|${trailheadCoords}&z=15&output=embed`;
    }

    return NextResponse.json(hikeRecommendation);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hike recommendation' },
      { status: 500 }
    );
  }
} 