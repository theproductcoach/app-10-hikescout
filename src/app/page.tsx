"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import { HikeCard } from "@/components/HikeCard";
import { HikeForm } from "@/components/HikeForm";
import { Hike } from "@/types/hike";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface HikeFormData {
  startLocation: string;
  duration: string;
  distance: string;
  terrain: string;
  foodPreference: string;
  vibe: string;
}

interface HikeResponse {
  name: string;
  location: {
    name: string;
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
    region: string;
    country: string;
    combinedMapUrl: string;
  };
  transport: string;
  description: string;
  difficulty: string;
  foodStops: string;
  returnOptions: string;
  tips: string;
  weather?: {
    temperature: number;
    description: string;
  };
  images: Array<{
    title: string;
    description: string;
    prompt: string;
    url: string | null;
    error?: string;
  }>;
}

const terrainTypes = ["woodland", "hills", "coast", "mixed"];
const foodTypes = ["pub lunch", "cafe", "picnic spots", "restaurant"];
const vibeTypes = [
  "Chill & Scenic",
  "Epic Views",
  "Adventure & Challenge",
  "Forest Bathing",
];

interface LoadingScreenProps {
  message: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  subMessage,
}) => (
  <div className={styles.loadingOverlay}>
    <div className={styles.loadingContent}>
      <div className={styles.loadingSpinner} />
      <div className={styles.loadingText}>{message}</div>
      {subMessage && <div className={styles.loadingSubtext}>{subMessage}</div>}
    </div>
  </div>
);

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

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>HikeScout</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <HikeForm />
      </Suspense>
    </main>
  );
}

// Server Component for rendering hike results
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
