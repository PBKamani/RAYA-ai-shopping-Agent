import { useState, useEffect, useRef, useCallback } from 'react'

export default function HeroBanner({ onExploreCategory, onScrollToCatalog }) {
  // Video scrubber state
  const trackRef = useRef(null)
  const videoRef = useRef(null)
  const rafIdRef = useRef(null)
  const isSeekingRef = useRef(false)
  const currentProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isVisibleRef = useRef(false)

  const [uiProgress, setUiProgress] = useState(0)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setPrefersReducedMotion(e.matches)
    if (mq.addEventListener) {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [])

  // Calculate scroll position relative to track
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const scrollDistance = rect.height - window.innerHeight
    if (scrollDistance <= 0) return

    const raw = -rect.top / scrollDistance
    const clamped = Math.min(Math.max(raw, 0), 1)
    targetProgressRef.current = clamped
  }, [])

  // rAF lerping loop for butter-smooth video scrubbing
  useEffect(() => {
    if (prefersReducedMotion) return

    let active = true
    const loop = () => {
      if (!active) return

      if (isVisibleRef.current) {
        const diff = targetProgressRef.current - currentProgressRef.current
        if (Math.abs(diff) > 0.0003) {
          currentProgressRef.current += diff * 0.12
          setUiProgress(currentProgressRef.current)

          const video = videoRef.current
          if (video && video.duration && !isSeekingRef.current) {
            const targetTime = currentProgressRef.current * video.duration
            if (Math.abs(video.currentTime - targetTime) > 0.03) {
              isSeekingRef.current = true
              video.currentTime = targetTime
            }
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(loop)
    }

    rafIdRef.current = requestAnimationFrame(loop)

    return () => {
      active = false
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [prefersReducedMotion])

  // IntersectionObserver to save resources when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) handleScroll()
      },
      { threshold: 0, rootMargin: '120px 0px 120px 0px' }
    )

    if (trackRef.current) {
      observer.observe(trackRef.current)
    }

    return () => observer.disconnect()
  }, [handleScroll])

  // Passive event listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])

  // Jump to specific scroll progress
  const scrollToRatio = (ratio) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const absoluteTop = window.scrollY + rect.top
    const scrollDistance = trackRef.current.clientHeight - window.innerHeight
    const targetScrollY = absoluteTop + ratio * scrollDistance

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })
  }

  // Active narrative milestone
  const milestones = [
    {
      num: '01',
      title: 'Structural Silhouette',
      caption: 'Form and volume shaped by bespoke architectural draping.',
      range: [0.0, 0.33],
    },
    {
      num: '02',
      title: 'Tactile Natural Fibers',
      caption: 'Uncompromising texture: double-faced wool, cashmere, and washed linen.',
      range: [0.33, 0.66],
    },
    {
      num: '03',
      title: 'Timeless Longevity',
      caption: 'Curated essentials resisting seasonal obsolescence through craft.',
      range: [0.66, 1.0],
    },
  ]

  const activeMilestone =
    milestones.find(
      (m) => uiProgress >= m.range[0] && uiProgress <= m.range[1]
    ) || milestones[0]

  return (
    <div className="hero-landing-wrapper">
      {/* Editorial Hero Top Header */}
      <section className="editorial-hero-banner">
        <div className="editorial-hero-container">
          <div className="editorial-meta-tag">
            <span className="meta-dash" />
            <span>RAYA ATELIER ARCHIVE</span>
            <span className="meta-season">AUTUMN / WINTER EDITION</span>
          </div>

          <h1 className="editorial-main-headline">
            THE MINIMALIST <span className="headline-italic">ARCHIVE</span>
          </h1>

          <p className="editorial-lead-text">
            Pure lines, architectural proportions, and tactile natural textiles. A modern
            wardrobe engineered for quiet confidence and enduring utility.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-atelier-primary"
              onClick={onScrollToCatalog}
            >
              <span>Explore Collection</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="btn-atelier-secondary"
              onClick={() => onExploreCategory('Apparel')}
            >
              Shop Apparel
            </button>
          </div>

          {/* Editorial Quick Jump Links */}
          <div className="collection-pills-row">
            <span className="pills-label">Curated Drops:</span>
            {['Apparel', 'Footwear', 'Accessories', 'Sale'].map((cat) => (
              <button
                key={cat}
                type="button"
                className="collection-pill-btn"
                onClick={() => onExploreCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SCROLL-DRIVEN VIDEO ANIMATION SECTION */}
      <section
        ref={trackRef}
        className="scroll-video-section-track"
        aria-label="Scroll-driven cinematic garment reveal"
      >
        <div className="scroll-video-sticky-viewport">
          <div className="video-section-header">
            <span className="video-pill-badge">CINEMATIC REVEAL</span>
            <h2 className="video-section-title">
              Form in Motion <span className="title-muted">— Scroll to Unveil</span>
            </h2>
          </div>

          {/* Center Stage: Left Card, Center Video, Right Milestones */}
          <div className="video-presentation-stage">
            {/* Left Milestone Text */}
            <div className="stage-side stage-left">
              <div className="milestone-editorial-card" key={activeMilestone.num}>
                <span className="milestone-number">{activeMilestone.num}</span>
                <h3 className="milestone-title">{activeMilestone.title}</h3>
                <p className="milestone-caption">{activeMilestone.caption}</p>
                <div className="milestone-progress-bar">
                  <div
                    className="milestone-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          ((uiProgress - activeMilestone.range[0]) /
                            (activeMilestone.range[1] - activeMilestone.range[0])) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Center Video Chassis */}
            <div className="video-chassis-container">
              <div className="chassis-shadow-box">
                {/* Loading Skeleton */}
                {isVideoLoading && (
                  <div className="chassis-loading-skeleton">
                    <div className="chassis-spinner" />
                    <span className="chassis-loading-text">Loading cinema stream...</span>
                  </div>
                )}

                {/* Error Fallback */}
                {videoError && (
                  <div className="chassis-fallback-card">
                    <div className="fallback-badge">OFFLINE PREVIEW</div>
                    <h4>Editorial Video Stream</h4>
                    <p>
                      The cinematic animation could not be loaded. Please ensure
                      connection or preview fallback.
                    </p>
                    <button
                      type="button"
                      className="fallback-retry-btn"
                      onClick={() => {
                        setVideoError(false)
                        setIsVideoLoading(true)
                        if (videoRef.current) videoRef.current.load()
                      }}
                    >
                      Reload Stream
                    </button>
                  </div>
                )}

                {/* The Scroll-Driven HTML5 Video Element */}
                <video
                  ref={videoRef}
                  src="/videos/hero-animation.mp4"
                  className={`scroll-hero-video ${isVideoLoaded ? 'is-visible' : 'is-hidden'}`}
                  preload="auto"
                  muted
                  playsInline
                  webkit-playsinline="true"
                  onCanPlay={() => {
                    setIsVideoLoading(false)
                    setIsVideoLoaded(true)
                  }}
                  onSeeked={() => {
                    isSeekingRef.current = false
                  }}
                  onError={() => {
                    setIsVideoLoading(false)
                    setVideoError(true)
                  }}
                  aria-label="RAYA ATELIER fashion reveal animation"
                />

                <div className="chassis-glare-overlay" aria-hidden="true" />
              </div>
            </div>

            {/* Right Telemetry / Quick Jump Milestones */}
            <div className="stage-side stage-right">
              <div className="stage-hud-box">
                <div className="hud-metric-pill">
                  <span className="hud-metric-label">SCROLL INDEX</span>
                  <span className="hud-metric-val">{Math.round(uiProgress * 100)}%</span>
                </div>

                <div className="stage-milestone-list">
                  {milestones.map((m) => {
                    const isCurrent =
                      uiProgress >= m.range[0] && uiProgress <= m.range[1]
                    return (
                      <button
                        key={m.num}
                        type="button"
                        className={`stage-jump-btn ${isCurrent ? 'active' : ''}`}
                        onClick={() => scrollToRatio(m.range[0])}
                      >
                        <span className="jump-num">{m.num}</span>
                        <span className="jump-title">{m.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Scrub Rail */}
          <div className="bottom-scrub-bar">
            <span className="scrub-status-label">
              TIMELINE: <strong>{Math.round(uiProgress * 100)}%</strong>
            </span>
            <div
              className="scrub-interactive-rail"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - rect.left) / rect.width
                scrollToRatio(Math.min(Math.max(ratio, 0), 1))
              }}
              role="slider"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(uiProgress * 100)}
              aria-label="Scroll video scrub progress"
              tabIndex={0}
            >
              <div
                className="scrub-rail-fill"
                style={{ width: `${uiProgress * 100}%` }}
              />
              <div
                className="scrub-rail-handle"
                style={{ left: `${uiProgress * 100}%` }}
              />
            </div>
            <span className="scrub-scroll-hint">SCROLL TO PROGRESS ↓</span>
          </div>
        </div>
      </section>
    </div>
  )
}
