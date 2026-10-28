import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface SlideItem {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  title: string;
  caption: string;
  badge: string;
}

const SLIDES: SlideItem[] = [
  {
    id: "interview",
    type: "image",
    src: "/slideshow/slide_interview.png",
    alt: "JSS Placement Interview Drive",
    title: "Campus Placements & Interviews",
    caption: "Students receiving offers from top recruitment partners",
    badge: "Placements 2025–26",
  },
  {
    id: "nba",
    type: "image",
    src: "/slideshow/slide_nba_banner.png",
    alt: "JSS University Noida Campus & NBA Accredited Programmes",
    title: "JSS University Noida",
    caption: "5 B.Tech Programmes NBA Accredited · Legacy of Excellence",
    badge: "NBA Accredited",
  },
  {
    id: "lab",
    type: "image",
    src: "/slideshow/slide_lab_robotics.jpg",
    alt: "Robotics and Advanced Hardware Lab",
    title: "Innovation & Robotics Labs",
    caption: "Hands-on engineering, smart systems, and applied research",
    badge: "Research & Labs",
  },
  {
    id: "video",
    type: "video",
    src: "/slideshow/slide_jss_vid.mp4",
    alt: "Life and Vibrance at JSS University",
    title: "Campus Life & Energy",
    caption: "Academic vigor, innovation hubs, and vibrant student culture",
    badge: "Campus Highlights",
  },
];

export const HeroSlideshow: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentSlide = SLIDES[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Handle slide transitions for images
  useEffect(() => {
    if (isPaused) return;

    if (currentSlide.type === "image") {
      const timer = setTimeout(() => {
        nextSlide();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isPaused, currentSlide.type, nextSlide]);

  // Handle video playback synchronization
  useEffect(() => {
    if (currentSlide.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPaused) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented or interrupted
        });
        setIsVideoPlaying(true);
      }
    }
  }, [currentIndex, currentSlide.type, isPaused]);

  const togglePause = () => {
    setIsPaused((prev) => {
      const nextState = !prev;
      if (currentSlide.type === "video" && videoRef.current) {
        if (nextState) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        } else {
          videoRef.current.play().catch(() => {});
          setIsVideoPlaying(true);
        }
      }
      return nextState;
    });
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[1.22/1] min-h-[280px] sm:min-h-[350px] lg:min-h-[390px] rounded-[18px] overflow-hidden border border-[#d2d2d7] bg-[#f5f5f7] shadow-[0_6px_28px_rgba(0,0,0,0.08)] group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Campus recruitment and university highlights slideshow"
      role="region"
    >
      {/* Slides display */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            {slide.type === "image" ? (
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover object-center"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            ) : (
              <video
                ref={isActive ? videoRef : undefined}
                src={slide.src}
                className="w-full h-full object-cover object-center"
                playsInline
                muted={isMuted}
                autoPlay={isActive && !isPaused}
                onEnded={nextSlide}
                aria-label={slide.alt}
              />
            )}

            {/* Gradient overlay for readable typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Top Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium bg-black/45 backdrop-blur-md text-white border border-white/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#248a3d] mr-2 animate-pulse" />
                {slide.badge}
              </span>
            </div>

            {/* Caption & Titles */}
            <div className="absolute bottom-11 left-5 right-5 z-20 text-white pointer-events-none text-left">
              <p className="text-[17px] sm:text-[20px] font-semibold tracking-tight drop-shadow-sm leading-snug">
                {slide.title}
              </p>
              <p className="text-[13px] sm:text-[14px] text-white/90 line-clamp-1 mt-1 font-normal drop-shadow-sm">
                {slide.caption}
              </p>
            </div>
          </div>
        );
      })}

      {/* Media controls (pause/play & sound) in top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        {currentSlide.type === "video" && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="p-2 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={togglePause}
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          className="p-2 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-colors"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

      {/* Prev / Next navigation arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/15 opacity-0 group-hover:opacity-100 hover:bg-black/65 transition-all focus:opacity-100"
      >
        <ChevronLeft className="w-4.5 h-4.5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/15 opacity-0 group-hover:opacity-100 hover:bg-black/65 transition-all focus:opacity-100"
      >
        <ChevronRight className="w-4.5 h-4.5" />
      </button>

      {/* Bottom pagination pill dots */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              aria-current={isActive ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

