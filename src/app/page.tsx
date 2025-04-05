"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import dynamic from "next/dynamic";

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
  location: string;
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
  image?: {
    url: string;
    alt: string;
    credit: {
      name: string;
      link: string;
    };
  };
}

const terrainTypes = ["woodland", "hills", "coast", "mixed"];
const foodTypes = ["pub lunch", "cafe", "picnic spots", "restaurant"];
const vibeTypes = [
  "Chill & Scenic",
  "Epic Views",
  "Adventure & Challenge",
  "Forest Bathing",
];

export default function Home() {
  const [formData, setFormData] = useState<HikeFormData>({
    startLocation: "",
    duration: "",
    distance: "",
    terrain: "",
    foodPreference: "",
    vibe: "",
  });
  const [hikeResponse, setHikeResponse] = useState<HikeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleGetLocation = () => {
    setGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          setFormData((prev) => ({
            ...prev,
            startLocation: data.address,
          }));
        } catch (error) {
          setLocationError(
            "Could not determine your location. Please enter it manually."
          );
          console.error("Geocoding error:", error);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? "Location access was denied. Please enable location services or enter your location manually."
            : "Could not determine your location. Please try again or enter it manually."
        );
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      const data = await response.json();

      // Fetch weather data for the hike location
      try {
        const mainLocation = data.location.split(/[,()]/, 1)[0].trim();

        const weatherResponse = await fetch(
          `/api/weather?location=${encodeURIComponent(mainLocation)}`
        );
        if (!weatherResponse.ok) {
          throw new Error("Weather service responded with an error");
        }
        const weatherData = await weatherResponse.json();
        if (weatherData.error) {
          throw new Error(weatherData.error);
        }
        data.weather = weatherData;

        // Fetch image for the location
        const imageResponse = await fetch(
          `/api/unsplash?query=${encodeURIComponent(mainLocation)}`
        );
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          data.image = imageData;
        }
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }

      setHikeResponse(data);
    } catch (error) {
      console.error("Error generating hike:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!formData.startLocation.trim()) {
      alert("Please enter a starting location first!");
      return;
    }

    setLoading(true);

    const randomData: HikeFormData = {
      startLocation: formData.startLocation,
      duration: `${Math.floor(Math.random() * 4) + 2} hours`,
      distance: "2 hours from " + formData.startLocation,
      terrain: terrainTypes[Math.floor(Math.random() * terrainTypes.length)],
      foodPreference: foodTypes[Math.floor(Math.random() * foodTypes.length)],
      vibe: vibeTypes[Math.floor(Math.random() * vibeTypes.length)],
    };

    try {
      const response = await fetch("/api/generate-hike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(randomData),
      });

      const data = await response.json();

      // Fetch weather data for the hike location
      try {
        // Extract the main location name (first part before any comma or detailed directions)
        const mainLocation = data.location.split(/[,()]/, 1)[0].trim();

        const weatherResponse = await fetch(
          `/api/weather?location=${encodeURIComponent(mainLocation)}`
        );
        if (!weatherResponse.ok) {
          throw new Error("Weather service responded with an error");
        }
        const weatherData = await weatherResponse.json();
        if (weatherData.error) {
          throw new Error(weatherData.error);
        }
        data.weather = weatherData;

        // Fetch image for the location
        const imageResponse = await fetch(
          `/api/unsplash?query=${encodeURIComponent(mainLocation)}`
        );
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          data.image = imageData;
        }
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }

      setHikeResponse(data);
      setFormData(randomData);
    } catch (error) {
      console.error("Error generating surprise hike:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      startLocation: "",
      duration: "",
      distance: "",
      terrain: "",
      foodPreference: "",
      vibe: "",
    });
    setHikeResponse(null);
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
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>HikeScout</h1>
          <p className={styles.heroSubtitle}>
            Day hike recommendations for anywhere in the world
          </p>
          <button onClick={scrollToForm} className={styles.heroButton}>
            Plan my hike
          </button>
        </div>
      </section>

      <section ref={formRef} className={styles.formSection}>
        <div className={styles.formBackground} />
        <div className={styles.formContainer}>
          <div className={styles.surpriseModeToggle}>
            <label className={styles.toggleLabel}>
              <div className={styles.switch}>
                <input
                  type="checkbox"
                  checked={surpriseMode}
                  onChange={(e) => setSurpriseMode(e.target.checked)}
                />
              </div>
              <span>🎲 Surprise Me with a Hike Near My Location</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.locationContainer}>
              <div className={styles.locationInputGroup}>
                <div className={styles.formGroup}>
                  <label htmlFor="startLocation">
                    Where are you starting from?*
                  </label>
                  <input
                    type="text"
                    id="startLocation"
                    name="startLocation"
                    placeholder="Enter any address, city, station, or landmark"
                    value={formData.startLocation}
                    onChange={handleInputChange}
                    required
                  />
                  <span className={styles.helperText}>
                    Try something like "Kings Cross Station" or "Manchester City
                    Centre"
                  </span>
                  {locationError && (
                    <div className={styles.locationError}>{locationError}</div>
                  )}
                </div>
              </div>
              <div className={styles.locationSeparator}>or</div>
              <button
                type="button"
                className={styles.useLocationButton}
                onClick={handleGetLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? "Getting Location..." : "📍 Use My Location"}
              </button>
            </div>

            {!surpriseMode && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="duration">
                    How long would you like to hike?
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    placeholder="e.g. 4 hours or 10km"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="distance">
                    How far are you willing to travel?
                  </label>
                  <input
                    type="text"
                    id="distance"
                    name="distance"
                    placeholder="e.g. 1 hour by train or 50 miles"
                    value={formData.distance}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="terrain">
                    What type of terrain do you prefer?
                  </label>
                  <select
                    id="terrain"
                    name="terrain"
                    value={formData.terrain}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select terrain type</option>
                    <option value="woodland">Woodland</option>
                    <option value="hills">Hills</option>
                    <option value="coast">Coast</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="vibe">Vibe of the Hike</label>
                  <select
                    id="vibe"
                    name="vibe"
                    value={formData.vibe}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select the vibe you want</option>
                    {vibeTypes.map((vibe) => (
                      <option key={vibe} value={vibe}>
                        {vibe}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="foodPreference">
                    Any food or coffee preferences?
                  </label>
                  <input
                    type="text"
                    id="foodPreference"
                    name="foodPreference"
                    placeholder="e.g. Pub lunch, coffee shop, picnic spots"
                    value={formData.foodPreference}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div className={styles.buttonContainer}>
              <div className={styles.mainButtons}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? "Finding your perfect hike..." : "Find My Hike"}
                </button>
                {!surpriseMode && (
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className={styles.surpriseButton}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Surprise Me!"}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearForm}
                className={styles.clearButton}
                disabled={loading}
              >
                <span>✨</span>
                <span>Start a New Adventure</span>
              </button>
            </div>
          </form>

          {hikeResponse && (
            <div className={styles.formContainer}>
              <div className={styles.response}>
                <h2>{hikeResponse.name}</h2>
                {hikeResponse.image && (
                  <>
                    <img
                      src={hikeResponse.image.url}
                      alt={hikeResponse.image.alt}
                      className={styles.hikeImage}
                    />
                    {hikeResponse.image.credit.name && (
                      <p className={styles.photoCredit}>
                        Photo by{" "}
                        <a
                          href={hikeResponse.image.credit.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {hikeResponse.image.credit.name}
                        </a>{" "}
                        on Unsplash
                      </p>
                    )}
                  </>
                )}
                <div className={styles.responseSection}>
                  <h3>📍 Location</h3>
                  <p>{hikeResponse.location}</p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(
                      hikeResponse.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapsLink}
                  >
                    <span>🗺️</span>
                    <span>View on Google Maps</span>
                  </a>
                </div>
                {hikeResponse.weather && (
                  <div className={styles.responseSection}>
                    <h3>🌤️ Weather Forecast</h3>
                    <p>
                      {hikeResponse.weather.description},{" "}
                      {hikeResponse.weather.temperature}°C
                    </p>
                  </div>
                )}
                <div className={styles.responseSection}>
                  <h3>🚂 Getting There</h3>
                  <p>{hikeResponse.transport}</p>
                </div>
                <div className={styles.responseSection}>
                  <h3>🥾 About the Hike</h3>
                  <p>{hikeResponse.description}</p>
                  <p className={styles.difficultyText}>
                    <strong>Difficulty:</strong> {hikeResponse.difficulty}
                  </p>
                </div>
                <div className={styles.responseSection}>
                  <h3>🍽️ Food & Drinks</h3>
                  <p>{hikeResponse.foodStops}</p>
                </div>
                <div className={styles.responseSection}>
                  <h3>🏠 Return Journey</h3>
                  <p>{hikeResponse.returnOptions}</p>
                </div>
                <div className={styles.responseSection}>
                  <h3>🧥 What to Bring</h3>
                  <p>{hikeResponse.tips}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
