import { HikeCard } from "./HikeCard";
import { Hike } from "@/types/hike";

async function getHikeImage(terrain: string, vibe: string) {
  try {
    const response = await fetch(
      `/api/unsplash?terrain=${encodeURIComponent(
        terrain
      )}&vibe=${encodeURIComponent(vibe)}`
    );
    if (!response.ok) throw new Error("Failed to fetch image");
    const images = await response.json();
    return (
      images[0] || {
        url: "/hikingimage.png",
        alt: "Default hiking landscape",
      }
    );
  } catch (error) {
    console.error("Error fetching image:", error);
    return {
      url: "/hikingimage.png",
      alt: "Default hiking landscape",
    };
  }
}

export async function HikeResults({ hikes }: { hikes: Hike[] }) {
  const hikeImages = await Promise.all(
    hikes.map((hike) => getHikeImage(hike.terrain, hike.vibe))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {hikes.map((hike, index) => (
        <HikeCard key={hike.name} hike={hike} image={hikeImages[index]} />
      ))}
    </div>
  );
}
