'use client';

import React from 'react';
import Link from 'next/link';
import { Trajectory } from '@/lib/types';

interface TrajectoryCardProps {
  trajectory: Trajectory;
}

const defaultPhotos: Record<string, string> = {
  ai: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  software: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  finance: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  psychology: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
  fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  career: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  money: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80",
  travel: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  creative: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  learning: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
};

export const TrajectoryCard: React.FC<TrajectoryCardProps> = ({ trajectory }) => {
  const momentumPercent = Math.round((trajectory.momentum || 0.5) * 100);
  const photoUrl =
    trajectory.photo_url ||
    defaultPhotos[trajectory.title.toLowerCase()] ||
    defaultPhotos[trajectory.kind] ||
    defaultPhotos.ai;

  return (
    <Link href={`/trajectory/${trajectory.id}`} className="interest-card">
      <img src={photoUrl} alt={trajectory.title} />
      <div className="card-shade" />
      <div className="interest-meta">
        <small className="kicker">{trajectory.kind}</small>
        <strong>{trajectory.title}</strong>
        <em>{trajectory.standing || trajectory.subtitle || 'Fresh signal, uncommitted.'}</em>
        
        <div className="progress-line" style={{ marginTop: '0.6rem' }}>
          <i style={{ width: `${momentumPercent}%` }} />
        </div>
      </div>
    </Link>
  );
};
