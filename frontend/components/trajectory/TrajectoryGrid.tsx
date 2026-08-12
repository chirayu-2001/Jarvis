'use client';

import React from 'react';
import { Trajectory, TrajectoryKind } from '@/lib/types';
import { TrajectoryCard } from './TrajectoryCard';
import { AddTrajectoryCard } from './AddTrajectoryCard';

interface TrajectoryGridProps {
  trajectories: Trajectory[];
  onAddTrajectory: (data: { title: string; kind: TrajectoryKind; goal?: string }) => Promise<void>;
}

export const TrajectoryGrid: React.FC<TrajectoryGridProps> = ({
  trajectories,
  onAddTrajectory,
}) => {
  return (
    <div className="interest-grid">
      {trajectories.map((traj) => (
        <TrajectoryCard key={traj.id} trajectory={traj} />
      ))}
      <AddTrajectoryCard onAdd={onAddTrajectory} />
    </div>
  );
};
