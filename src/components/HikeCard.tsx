import React from "react";
import Image from "next/image";
import { Hike } from "@/types/hike";
import styles from "./HikeCard.module.css";

interface HikeCardProps {
  hike: Hike;
  image: {
    url: string;
    alt: string;
    credit?: {
      name: string;
      link: string;
    };
  };
}

export function HikeCard({ hike, image }: HikeCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {image.credit && (
          <a
            href={image.credit.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.imageCredit}
          >
            Photo by {image.credit.name} on Unsplash
          </a>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{hike.name}</h3>
          <span className={styles.badge}>{hike.difficulty}</span>
        </div>
        <p className={styles.description}>{hike.description}</p>
        <div className={styles.badges}>
          <span className={styles.badge}>{hike.length}km</span>
          <span className={styles.badge}>{hike.time}</span>
          <span className={styles.badge}>{hike.terrain}</span>
        </div>
      </div>
    </div>
  );
}
