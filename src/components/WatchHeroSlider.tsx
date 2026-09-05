"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HeroSlide } from '@/lib/firebaseDb';

interface Props {
  slides?: HeroSlide[];
}

export default function WatchHeroSlider({ slides = [] }: Props) {
  const activeSlides = slides.filter(s => s.active);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length, isPaused]);

  if (activeSlides.length === 0) return null;

  const nextSlide = () => setCurrent(prev => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + activeSlides.length) % activeSlides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section
      className="watch-hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Luxury Hero Showcase"
    >
      <style>{`
        .watch-hero-slider {
          position: relative;
          width: 100%;
          min-height: 520px;
          height: 68vh;
          max-height: 720px;
          background: #0b0f17;
          overflow: hidden;
          margin-bottom: 0;
          border-bottom: 1px solid rgba(214, 178, 105, 0.2);
        }

        .watch-slide-track {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .watch-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform: scale(1.04);
        }

        .watch-slide.active {
          opacity: 1;
          pointer-events: auto;
          transform: scale(1);
        }

        .watch-slide-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: brightness(0.68) contrast(1.08);
        }

        .watch-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(11, 15, 23, 0.88) 0%,
            rgba(11, 15, 23, 0.45) 50%,
            rgba(11, 15, 23, 0.2) 100%
          );
        }

        .watch-slide-content-wrap {
          position: relative;
          z-index: 3;
          height: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
        }

        .watch-slide-content {
          max-width: 580px;
          animation: watchSlideFadeUp 0.8s ease-out;
        }

        .watch-slide-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: rgba(214, 178, 105, 0.15);
          border: 1px solid rgba(214, 178, 105, 0.35);
          color: #D6B269;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-radius: 30px;
          margin-bottom: 1.25rem;
          backdrop-filter: blur(8px);
        }

        .watch-slide-title {
          font-size: 3.2rem;
          line-height: 1.15;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 18px rgba(0,0,0,0.5);
        }

        .watch-slide-subtitle {
          font-size: 1.15rem;
          line-height: 1.6;
          color: #e2e8f0;
          margin-bottom: 2rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }

        .watch-hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 34px;
          background: #D6B269;
          color: #0b0f17;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(214, 178, 105, 0.35);
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .watch-hero-btn:hover {
          background: #e5c47e;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(214, 178, 105, 0.5);
        }

        /* Nav Arrows */
        .watch-slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(10px);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .watch-slider-arrow:hover {
          background: #D6B269;
          color: #0b0f17;
          border-color: #D6B269;
          transform: translateY(-50%) scale(1.08);
        }

        .watch-slider-arrow.left { left: 24px; }
        .watch-slider-arrow.right { right: 24px; }

        /* Slide Indicators / Dots */
        .watch-slider-dots {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .watch-slider-dot {
          width: 32px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          padding: 0;
        }

        .watch-slider-dot.active {
          width: 48px;
          background: #D6B269;
          box-shadow: 0 0 12px rgba(214, 178, 105, 0.8);
        }

        @keyframes watchSlideFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .watch-hero-slider {
            min-height: 440px;
            height: 60vh;
          }
          .watch-slide-overlay {
            background: linear-gradient(
              to bottom,
              rgba(11, 15, 23, 0.3) 0%,
              rgba(11, 15, 23, 0.75) 60%,
              rgba(11, 15, 23, 0.95) 100%
            );
          }
          .watch-slide-content-wrap {
            align-items: flex-end;
            padding-bottom: 60px;
            text-align: center;
            justify-content: center;
          }
          .watch-slide-content {
            max-width: 100%;
          }
          .watch-slide-title {
            font-size: 2.1rem;
          }
          .watch-slide-subtitle {
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
          }
          .watch-slider-arrow {
            display: none; /* Swipe on mobile */
          }
        }
      `}</style>

      {/* Slide Track */}
      <div className="watch-slide-track">
        {activeSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`watch-slide ${idx === current ? 'active' : ''}`}
            aria-hidden={idx !== current}
          >
            {/* Contain Mode Backdrop (if user selected contain to avoid any gaps) */}
            {slide.desktopFit === 'contain' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${slide.desktopImage})`,
                  backgroundPosition: slide.desktopPosition || 'center',
                  backgroundSize: 'cover',
                  filter: 'blur(24px) brightness(0.35)',
                  transform: 'scale(1.25)',
                  pointerEvents: 'none'
                }}
              />
            )}

            <picture>
              {slide.mobileImage && (
                <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
              )}
              <img
                src={slide.desktopImage}
                alt={slide.title}
                className="watch-slide-image"
                loading={idx === 0 ? "eager" : "lazy"}
                style={{
                  objectPosition: slide.desktopPosition || 'center',
                  objectFit: slide.desktopFit || 'cover',
                  transform: slide.desktopZoom && slide.desktopZoom !== 1 ? `scale(${slide.desktopZoom})` : undefined
                }}
              />
            </picture>

            <div className="watch-slide-overlay" />

            <div className="watch-slide-content-wrap">
              <div className="watch-slide-content">
                <div className="watch-slide-badge">
                  <span>★</span> Signature Watch Selection
                </div>
                <h1 className="watch-slide-title">{slide.title}</h1>
                <p className="watch-slide-subtitle">{slide.subtitle}</p>
                {slide.buttonText && (
                  <a href={slide.buttonLink || '#shop-now'} className="watch-hero-btn">
                    <span>{slide.buttonText}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left/Right Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            className="watch-slider-arrow left"
            onClick={prevSlide}
            aria-label="Previous Slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="watch-slider-arrow right"
            onClick={nextSlide}
            aria-label="Next Slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Indicators / Progress Dots */}
          <div className="watch-slider-dots">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                className={`watch-slider-dot ${idx === current ? 'active' : ''}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
