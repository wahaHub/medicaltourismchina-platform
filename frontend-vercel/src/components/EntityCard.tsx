import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const PLACEHOLDER_IMAGE_URL = `${LOW_MEDIA_BASE_URL}/root_assets/surgery_placeholder_x2.png`;

interface EntityCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  onClick?: () => void;
  selected?: boolean;
  fallbackImageUrls?: string[]; // optional chain of fallbacks before placeholder
  usePlaceholderOnFail?: boolean; // control final placeholder fallback
  /** Enable progressive loading: pass base URL (without _x1/_x2 suffix) */
  progressiveBaseUrl?: string;
  /** Resolution levels for progressive loading */
  resolutionLevels?: ('x1' | 'x2' | 'x3')[];
}

// A lightweight card that mimics the visual style used on the Treatment page
// (large thumbnail with title below), suitable for Department/Disease listings.
const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  imageUrl,
  onClick,
  selected = false,
  fallbackImageUrls = [],
  usePlaceholderOnFail = true,
  progressiveBaseUrl,
  resolutionLevels = ['x1', 'x2'],
}) => {
  const [src, setSrc] = useState<string>('');
  const [fallbacks, setFallbacks] = useState<string[]>(fallbackImageUrls);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedLevel, setLoadedLevel] = useState<number>(-1);
  const mountedRef = useRef(true);

  // Generate URL for a specific resolution level
  const getUrlForLevel = useCallback((baseUrl: string, level: string): string => {
    const cleanBase = baseUrl.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');
    return `${cleanBase}_${level}.png`;
  }, []);

  // Preload an image and return a promise
  const preloadImage = useCallback((imgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(imgSrc);
      img.onerror = () => reject(new Error(`Failed to load: ${imgSrc}`));
      img.src = imgSrc;
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let hasLoadedAny = false;

    const loadImages = async () => {
      setIsLoading(true);
      setLoadedLevel(-1);

      // If progressive loading is enabled
      if (progressiveBaseUrl) {
        // Try to load each resolution level in order
        for (let i = 0; i < resolutionLevels.length; i++) {
          if (cancelled) break;

          const level = resolutionLevels[i];
          const url = getUrlForLevel(progressiveBaseUrl, level);

          try {
            await preloadImage(url);
            if (!cancelled && mountedRef.current) {
              setSrc(url);
              setLoadedLevel(i);
              hasLoadedAny = true;
            }
          } catch {
            // Continue to next level if this one fails
            console.debug(`EntityCard: Failed to load ${level} for ${progressiveBaseUrl}`);
          }
        }

        // If no progressive image loaded, fall through to regular fallbacks
        if (!cancelled && mountedRef.current && !hasLoadedAny) {
          // Try the original imageUrl and fallbacks
          const allUrls = [imageUrl, ...fallbackImageUrls].filter(Boolean);
          for (const url of allUrls) {
            if (cancelled) break;
            try {
              await preloadImage(url);
              if (!cancelled && mountedRef.current) {
                setSrc(url);
                hasLoadedAny = true;
                break;
              }
            } catch {
              // Continue to next fallback
            }
          }

          // All failed, use placeholder
          if (!cancelled && mountedRef.current && !hasLoadedAny && usePlaceholderOnFail) {
            setSrc(PLACEHOLDER_IMAGE_URL);
          }
        }
      } else {
        // Regular non-progressive loading - try imageUrl first
        try {
          await preloadImage(imageUrl);
          if (!cancelled && mountedRef.current) {
            setSrc(imageUrl);
            hasLoadedAny = true;
          }
        } catch {
          // Try fallbacks
          const remainingFallbacks = [...fallbackImageUrls];
          while (remainingFallbacks.length > 0 && !cancelled && !hasLoadedAny) {
            const next = remainingFallbacks.shift()!;
            try {
              await preloadImage(next);
              if (!cancelled && mountedRef.current) {
                setSrc(next);
                hasLoadedAny = true;
                break;
              }
            } catch {
              // Continue to next
            }
          }

          // If still no image, use placeholder
          if (!cancelled && mountedRef.current && !hasLoadedAny && usePlaceholderOnFail) {
            setSrc(PLACEHOLDER_IMAGE_URL);
          }
        }
      }

      if (!cancelled && mountedRef.current) {
        setIsLoading(false);
      }
    };

    loadImages();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [imageUrl, progressiveBaseUrl, resolutionLevels, fallbackImageUrls, usePlaceholderOnFail, getUrlForLevel, preloadImage]);

  const handleImgError = () => {
    if (fallbacks.length > 0) {
      const [next, ...rest] = fallbacks;
      setSrc(next);
      setFallbacks(rest);
    } else {
      if (usePlaceholderOnFail) {
        setSrc(PLACEHOLDER_IMAGE_URL);
      }
    }
  };

  return (
    <div
      className={
        `group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer bg-white w-full h-full flex flex-col ` +
        (selected
          ? 'shadow-xl ring-2 ring-emerald-500/70 hover:shadow-2xl'
          : 'shadow-md hover:shadow-xl')
      }
      onClick={onClick}
      aria-selected={selected}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 md:h-52 lg:h-56 overflow-hidden flex-shrink-0 bg-gray-100">
        {src ? (
          <img
            src={src}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              isLoading && loadedLevel < 1 ? 'blur-sm' : ''
            }`}
            onError={handleImgError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5 flex-grow flex flex-col">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2 group-hover:text-teal-600 transition-colors">
          <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
            {title}
          </span>
        </h3>
        {subtitle && (
          <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default EntityCard;
