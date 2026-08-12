'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, BookOpen, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header style={{
      borderBottom: '1px solid #202534',
      background: 'rgba(9, 10, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '1.75rem',
            height: '1.75rem',
            background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#090a0f',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            J
          </div>
          <span style={{ color: '#f3f4f8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.88rem', textTransform: 'uppercase' }}>
            Jarvis OS
          </span>
        </Link>
        <span style={{ color: '#586073', fontSize: '0.75rem', fontFamily: 'monospace' }}>| continuity engine</span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace', color: '#8b94a8' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f3f4f8', textDecoration: 'none' }}>
          <Compass style={{ width: '0.9rem', height: '0.9rem', color: '#818cf8' }} />
          <span>Discovery</span>
        </Link>
        <Link href="/journal" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b94a8', textDecoration: 'none' }}>
          <BookOpen style={{ width: '0.9rem', height: '0.9rem', color: '#38bdf8' }} />
          <span>Journal</span>
        </Link>
        <Link href="/reflect" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b94a8', textDecoration: 'none' }}>
          <UserCheck style={{ width: '0.9rem', height: '0.9rem', color: '#34d399' }} />
          <span>Reflect</span>
        </Link>
      </nav>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        color: '#8b94a8',
        background: '#11141d',
        padding: '0.3rem 0.75rem',
        border: '1px solid #202534',
        borderRadius: '9999px'
      }}>
        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#34d399' }} />
        <span>LIVE AGENT</span>
      </div>
    </header>
  );
};
