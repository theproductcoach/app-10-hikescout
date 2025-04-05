"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { HikeResults } from "./HikeResults";
import { Hike } from "@/types/hike";
import styles from "./HikeForm.module.css";

const terrainTypes = ["woodland", "hills", "coast", "mixed"];
const foodTypes = ["pub lunch", "cafe", "picnic spots", "restaurant"];
const vibeTypes = [
  "Chill & Scenic",
  "Epic Views",
  "Adventure & Challenge",
  "Forest Bathing",
];

interface FormData {
  startLocation: string;
  duration: string;
  distance: string;
  terrain: string;
  foodPreference: string;
  vibe: string;
}

export function HikeForm() {
  const [formData, setFormData] = useState<FormData>({
    startLocation: "",
    duration: "",
    distance: "",
    terrain: "",
    foodPreference: "",
    vibe: "",
  });
  const [loading, setLoading] = useState(false);
  const [hikes, setHikes] = useState<Hike[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/generate-hike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate hike");
      }

      const data = await response.json();
      setHikes([data]); // Wrap single hike in array
    } catch (error) {
      console.error("Error generating hike:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="startLocation" className={styles.label}>
                Starting Location*
              </label>
              <input
                id="startLocation"
                name="startLocation"
                placeholder="Enter city, station, or landmark"
                value={formData.startLocation}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration" className={styles.label}>
                Duration
              </label>
              <input
                id="duration"
                name="duration"
                placeholder="e.g. 4 hours"
                value={formData.duration}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="distance" className={styles.label}>
                Travel Distance
              </label>
              <input
                id="distance"
                name="distance"
                placeholder="e.g. 1 hour by train"
                value={formData.distance}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="terrain" className={styles.label}>
                Terrain Type
              </label>
              <select
                id="terrain"
                name="terrain"
                value={formData.terrain}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">Select terrain type</option>
                {terrainTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="vibe" className={styles.label}>
                Hike Vibe
              </label>
              <select
                id="vibe"
                name="vibe"
                value={formData.vibe}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">Select the vibe you want</option>
                {vibeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="foodPreference" className={styles.label}>
                Food Preference
              </label>
              <select
                id="foodPreference"
                name="foodPreference"
                value={formData.foodPreference}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Select food preference</option>
                {foodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Finding your perfect hike..." : "Find My Hike"}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        hikes.length > 0 && <HikeResults hikes={hikes} />
      )}
    </div>
  );
}
