export interface Hike {
  name: string;
  description: string;
  difficulty: string;
  length: number;
  time: string;
  terrain: string;
  vibe: string;
  location: {
    name: string;
    region: string;
    country: string;
    carpark: {
      description: string;
      coordinates: {
        latitude: string;
        longitude: string;
      };
      mapUrl: string;
    };
    trailhead: {
      description: string;
      coordinates: {
        latitude: string;
        longitude: string;
      };
      mapUrl: string;
    };
  };
  transport: string;
  foodStops: string;
  returnOptions: string;
  tips: string;
  weather?: {
    temperature: number;
    description: string;
  };
} 