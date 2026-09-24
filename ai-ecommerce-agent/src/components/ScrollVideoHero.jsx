import { useEffect, useRef, useState, useCallback } from 'react'

const NARRATIVE_STEPS = [
  {
    id: 1,
    range: [0.0, 0.24],
    stepNumber: '01',
    badge: 'Autonomous Discovery',
    title: 'Instant Taste Profiling',
    description:
      'RAYA observes subtle browsing cues, analyzing silhouettes, fabrics, and palettes in milliseconds to synthesize tailored product recommendations.',
  },
  {
    id: 2,
    range: [0.25, 0.49],
    stepNumber: '02',
    badge: 'Neural Vision',
    title: 'Multimodal Spatial Match',
    description:
      'Powered by real-time computer vision, the agent inspects textures, garment geometries, and contextual aesthetic fits across thousands of SKUs.',
  },
  {
    id: 3,
    range: [0.5, 0.74],
    stepNumber: '03',
    badge: 'Dynamic Curation',
    title: 'Adaptive Agentic Wardrobe',
    description:
      'Continuous reinforcement loops refine selection matrices dynamically, eliminating search fatigue and elevating modern personal style curation.',
  },
  {
    id: 4,
    range: [0.75, 1.0],
    stepNumber: '04',
    badge: 'Frictionless Execution',
    title: 'Autonomous Instant Order',
    description:
      'Seamless checkout orchestrated in seconds. Verified sizing, tokenized payment security, and automated dispatch tracking without human friction.',
  },
]

export default function ScrollVideoHero({
  videoSrc = '/video/refrence_backgroung_animation.mp4',
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const rafIdRef = useRef(null)
  const isSeekingRef = useRef(false)
  const currentProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isVisibleRef = useRef(false)

  const [uiProgress, setUiProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })
  const [isPlayingReduced, setIsPlayingReduced] = useState(false)

  // Detect user preference for reduced motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = (e) => setPrefersReducedMotion(e.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  // Calculate target scroll ratio based on container bounding rect
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scrollDistance = rect.height - window.innerHeight

    if (scrollDistance <= 0) return

    // Calculate normalized progress [0.0 - 1.0]
    const rawProgress = -rect.top / scrollDistance
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1)

    targetProgressRef.current = clampedProgress
  }, [])

  // Smooth lerp loop running on requestAnimationFrame
  useEffect(() => {
    if (prefersReducedMotion) return

    let isActive = true

    const loop = () => {
      if (!isActive) return

      // Only perform work if container is within or near visible area
      if (isVisibleRef.current) {
        const diff = targetProgressRef.current - currentProgressRef.current

        // If delta is noticeable, interpolate smoothly
        if (Math.abs(diff) > 0.0003) {
          // Linear interpolation with dampening factor 0.12 for butter-smooth scrubbing
          currentProgressRef.current += diff * 0.12

          // Update UI state for indicators and text
          setUiProgress(currentProgressRef.current)

          const video = videoRef.current
          if (video && video.duration && !isSeekingRef.current) {
            const targetTime = currentProgressRef.current * video.duration
            // Avoid micro-seeks that choke the browser video decoder
            if (Math.abs(video.currentTime - targetTime) > 0.025) {
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
      isActive = false
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [prefersReducedMotion])

  // IntersectionObserver to pause rAF work when scrolled completely out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          handleScroll()
        }
      },
      { threshold: 0, rootMargin: '100px 0px 100px 0px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [handleScroll])

  // Passive scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
      // Prime video at start frame
      videoRef.current.currentTime = 0
    }
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    setIsLoaded(true)
  }

  const handleSeeked = () => {
    isSeekingRef.current = false
  }

  const handleVideoError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Smooth scroll jump to a specific milestone
  const scrollToMilestone = (progressTarget) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const absoluteTop = window.scrollY + rect.top
    const scrollDistance = rect.height - window.innerHeight
    const targetScrollY = absoluteTop + progressTarget * scrollDistance

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })
  }

  // Toggle video playback for reduced motion mode
  const toggleReducedMotionPlay = () => {
    if (!videoRef.current) return
    if (isPlayingReduced) {
      videoRef.current.pause()
      setIsPlayingReduced(false)
    } else {
      videoRef.current.play()
      setIsPlayingReduced(true)
    }
  }

  // Determine current active narrative step
  const activeStep =
    NARRATIVE_STEPS.find(
      (step) => uiProgress >= step.range[0] && uiProgress <= step.range[1]
    ) || NARRATIVE_STEPS[0]

  return (
    <section
      id="scroll-animation-section"
      ref={containerRef}
      className="scroll-video-track"
      aria-label="Scroll-driven product presentation"
    >
      <div className="sticky-viewport">
        {/* Background ambient lighting effects */}
        <div className="ambient-glow-sphere ambient-glow-top" aria-hidden="true" />
        <div className="ambient-glow-sphere ambient-glow-bottom" aria-hidden="true" />
        <div className="subtle-grid-overlay" aria-hidden="true" />

        {/* Top Section Header */}
        <div className="hero-top-bar">
          <div className="hero-top-badge">
            <span className="pulse-beacon" />
            <span>SCROLL-DRIVEN PRODUCT ENGINE</span>
          </div>
          <h1 className="hero-main-title">
            Autonomous Commerce, <span className="text-gradient">Frame by Frame</span>
          </h1>
          <p className="hero-subtitle">
            Scroll down to inspect the interactive AI agent in action. Precision
            timelines synchronized directly to your motion.
          </p>
        </div>

        {/* Central Display: Product Frame + Scrubbed Video + Overlays */}
        <div className="product-stage-container">
          {/* Left / Active Narrative Card */}
          <div className="narrative-side narrative-left">
            <div className="narrative-card glass-panel" key={activeStep.id}>
              <div className="card-top-row">
                <span className="step-tag">{activeStep.stepNumber}</span>
                <span className="category-pill">{activeStep.badge}</span>
              </div>
              <h2 className="card-title">{activeStep.title}</h2>
              <p className="card-description">{activeStep.description}</p>
              <div className="card-timeline-mini">
                <div
                  className="card-timeline-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((uiProgress - activeStep.range[0]) /
                          (activeStep.range[1] - activeStep.range[0])) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Central Hardware / Video Chassis */}
          <div className="video-chassis-wrap">
            <div className="chassis-outer-ring">
              <div className="chassis-inner-bezel">
                {/* Loading State Skeleton */}
                {isLoading && (
                  <div className="video-loading-skeleton" aria-live="polite">
                    <div className="loading-spinner-ring" />
                    <div className="loading-shimmer-bar" />
                    <span className="loading-text">Loading neural stream...</span>
                  </div>
                )}

                {/* Error / Fallback State */}
                {hasError && (
                  <div className="video-fallback-box" role="alert">
                    <div className="fallback-icon-wrap">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="fallback-icon"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <h3 className="fallback-title">Video Stream Unavailable</h3>
                    <p className="fallback-msg">
                      The high-definition animation could not be loaded. Please
                      check connectivity or reload.
                    </p>
                    <button
                      type="button"
                      className="fallback-btn"
                      onClick={() => {
                        setHasError(false)
                        setIsLoading(true)
                        if (videoRef.current) {
                          videoRef.current.load()
                        }
                      }}
                    >
                      Retry Loading
                    </button>
                  </div>
                )}

                {/* The Core HTML5 Video Element */}
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className={`scroll-driven-video ${isLoaded ? 'visible' : 'hidden'}`}
                  preload="auto"
                  muted
                  playsInline
                  webkit-playsinline="true"
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlay={handleCanPlay}
                  onSeeked={handleSeeked}
                  onError={handleVideoError}
                  aria-label="RAYA AI product animation"
                />

                {/* Ambient reflection sheen */}
                <div className="glass-sheen-overlay" aria-hidden="true" />
              </div>
            </div>

            {/* Reduced motion override notice / play button */}
            {prefersReducedMotion && (
              <div className="reduced-motion-banner">
                <span>Reduced motion enabled</span>
                <button
                  type="button"
                  className="reduced-motion-btn"
                  onClick={toggleReducedMotionPlay}
                >
                  {isPlayingReduced ? 'Pause Video' : 'Play Video'}
                </button>
              </div>
            )}
          </div>

          {/* Right Metrics / HUD Card */}
          <div className="narrative-side narrative-right">
            <div className="hud-card glass-panel">
              <div className="hud-header">
                <span className="hud-label">ENGINE TELEMETRY</span>
                <span className="hud-status">SYNCED</span>
              </div>
              <div className="hud-metric-row">
                <div className="metric-box">
                  <span className="metric-num">{Math.round(uiProgress * 100)}%</span>
                  <span className="metric-title">Timeline Index</span>
                </div>
                <div className="metric-box">
                  <span className="metric-num">
                    {(uiProgress * (videoDuration || 17.4)).toFixed(1)}s
                  </span>
                  <span className="metric-title">Timestamp</span>
                </div>
              </div>

              <div className="hud-feature-list">
                <div className="hud-feature-item">
                  <span className="hud-dot active" />
                  <span className="hud-text">Frame-Accurate Decoder</span>
                </div>
                <div className="hud-feature-item">
                  <span className="hud-dot active" />
                  <span className="hud-text">Hardware Acceleration</span>
                </div>
                <div className="hud-feature-item">
                  <span className="hud-dot active" />
                  <span className="hud-text">Zero External Dependencies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Control Bar */}
        <div className="scrub-controls-bar glass-panel">
          <div className="scrub-label-wrap">
            <span className="scrub-tag">PROGRESS</span>
            <span className="scrub-percentage">{Math.round(uiProgress * 100)}%</span>
          </div>

          <div
            className="scrub-track-rail"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickPos = (e.clientX - rect.left) / rect.width
              scrollToMilestone(Math.min(Math.max(clickPos, 0), 1))
            }}
            role="slider"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(uiProgress * 100)}
            aria-label="Video animation scrub progress"
            tabIndex={0}
          >
            <div
              className="scrub-track-fill"
              style={{ width: `${uiProgress * 100}%` }}
            />
            <div
              className="scrub-thumb"
              style={{ left: `${uiProgress * 100}%` }}
            />
          </div>

          <div className="scrub-milestone-pills">
            {NARRATIVE_STEPS.map((step) => {
              const isPassed = uiProgress >= step.range[0]
              const isCurrent =
                uiProgress >= step.range[0] && uiProgress <= step.range[1]
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`milestone-pill ${isCurrent ? 'current' : ''} ${
                    isPassed ? 'passed' : ''
                  }`}
                  onClick={() => scrollToMilestone(step.range[0])}
                  title={`Jump to ${step.badge}`}
                >
                  <span className="pill-num">{step.stepNumber}</span>
                  <span className="pill-text">{step.badge}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Scroll invitation indicator (fades when scrolling starts) */}
        <div
          className={`scroll-invitation ${uiProgress > 0.08 ? 'faded' : ''}`}
          aria-hidden="true"
        >
          <span className="scroll-invitation-text">SCROLL TO ADVANCE</span>
          <div className="scroll-mouse-icon">
            <div className="scroll-wheel" />
          </div>
        </div>
      </div>
    </section>
  )
}
