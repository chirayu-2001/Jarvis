'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, BookOpen, UserCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header style={{
      borderBottom: '1px solid #3d2e1e',
      background: 'linear-gradient(180deg, rgba(26, 20, 16, 0.98) 0%, rgba(13, 13, 13, 0.95) 100%)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(240, 165, 0, 0.08) inset'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          {/* Arc Reactor Logo */}
          <div style={{
            width: '2rem',
            height: '2rem',
            background: 'radial-gradient(circle, #4fc3f7 0%, #0288d1 50%, #01579b 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f0e6d3',
            fontWeight: 900,
            fontSize: '0.8rem',
            fontFamily: "'Orbitron', monospace",
            boxShadow: '0 0 15px rgba(79, 195, 247, 0.5), 0 0 30px rgba(79, 195, 247, 0.2)',
            border: '2px solid rgba(79, 195, 247, 0.6)',
            animation: 'reactorPulse 3s ease-in-out infinite'
          }}>
            J
          </div>
          <span style={{
            color: '#f0e6d3',
            fontWeight: 800,
            letterSpacing: '0.12em',
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            fontFamily: "'Orbitron', 'Inter', sans-serif",
            background: 'linear-gradient(90deg, #f0a500, #ffd54f)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Jarvis OS
          </span>
        </Link>
        <span style={{
          color: '#8a7a5a',
          fontSize: '0.72rem',
          fontFamily: "'Orbitron', monospace",
          letterSpacing: '0.1em'
        }}>
          // STARK INDUSTRIES
        </span>
      </div>

      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        fontFamily: "'Orbitron', monospace",
        color: '#b89b6a'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#f0a500',
          textDecoration: 'none',
          transition: 'color 200ms ease'
        }}>
          <Compass style={{ width: '0.9rem', height: '0.9rem', color: '#f0a500' }} />
          <span>Discovery</span>
        </Link>
        <Link href="/journal" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#dbb97a',
          textDecoration: 'none',
          transition: 'color 200ms ease'
        }}>
          <BookOpen style={{ width: '0.9rem', height: '0.9rem', color: '#e63946' }} />
          <span>Journal</span>
        </Link>
        <Link href="/reflect" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#dbb97a',
          textDecoration: 'none',
          transition: 'color 200ms ease'
        }}>
          <UserCheck style={{ width: '0.9rem', height: '0.9rem', color: '#4fc3f7' }} />
          <span>Reflect</span>
        </Link>
      </nav>

      {/* Live Agent Status — Arc Reactor Glow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.72rem',
        fontFamily: "'Orbitron', monospace",
        letterSpacing: '0.08em',
        color: '#4fc3f7',
        background: 'rgba(79, 195, 247, 0.08)',
        padding: '0.35rem 0.85rem',
        border: '1px solid rgba(79, 195, 247, 0.25)',
        borderRadius: '9999px',
        boxShadow: '0 0 10px rgba(79, 195, 247, 0.1)'
      }}>
        <Zap style={{ width: '0.7rem', height: '0.7rem', color: '#4fc3f7' }} />
        <div style={{
          width: '0.45rem',
          height: '0.45rem',
          borderRadius: '50%',
          background: '#4fc3f7',
          boxShadow: '0 0 6px #4fc3f7',
          animation: 'reactorPulse 2s ease-in-out infinite'
        }} />
        <span>SUIT ONLINE</span>
      </div>
    </header>
  );
};
