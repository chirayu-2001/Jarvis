'use client';

import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

interface Post {
  id: string;
  source: 'Reddit' | 'Substack' | 'X/Twitter' | 'YouTube';
  title: string;
  interestTag: string;
  why: string;
  action: string;
}

const posts: Post[] = [
  {
    id: 'p1',
    source: 'Reddit',
    title: 'Solo founders are using AI agents as internal tools before selling them',
    interestTag: 'AI',
    why: 'Relevant because your first product can be a personal workflow you actually use.',
    action: 'Save to AI',
  },
  {
    id: 'p2',
    source: 'Substack',
    title: 'The boring path to independent consulting income',
    interestTag: 'Software',
    why: 'You need a paid experiment, not a six-month SaaS cave.',
    action: 'Turn into offer',
  },
  {
    id: 'p3',
    source: 'X/Twitter',
    title: 'A thread on paper-trading with one hypothesis at a time',
    interestTag: 'Finance',
    why: 'Finance is recurring. This gives it a bounded container.',
    action: 'Create experiment',
  },
  {
    id: 'p4',
    source: 'YouTube',
    title: 'How to build strength with two sessions per week',
    interestTag: 'Fitness',
    why: 'The goal is energy stability, not becoming a fitness influencer.',
    action: 'Add to plan',
  },
];

export const SocialRadar: React.FC = () => {
  return (
    <div className="panel">
      <div className="section-title compact-title">
        <div>
          <span className="kicker">SOCIAL RADAR / INFORMATION DIET</span>
          <h2>3 items per day max</h2>
        </div>
        <span>Curated inputs linked directly to your active trajectories.</span>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#f7f7f7] px-2 py-0.5 border border-[#333333] bg-[#141414]">
                  {post.source}
                </span>
                <span className="text-[10px] font-mono text-[#666666]">→ {post.interestTag}</span>
              </div>
              <strong>{post.title}</strong>
              <p>{post.why}</p>
            </div>
            <button className="whitespace-nowrap text-xs font-mono">
              <span>{post.action}</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
