import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const DEFAULT_FALLBACK_URL = `${LOW_MEDIA_BASE_URL}/root_assets/surgery_placeholder_x2.png`;

interface ProgressiveImageProps {
  /** Base image URL without resolution suffix (e.g., .../disease/abc - no .png) */
  baseUrl: string;
  alt: string;
  className?: string;
  /** Resolution levels to try in order: x1 (lowest) -> x2 -> x3 (highest) */
  resolutionLevels?: ('x1' | 'x2' | 'x3')[];
  /** File extension (default: .png) */
  extension?: string;
  /** Placeholder image while loading */
  placeholder?: string;
  /** Fallback if all resolutions fail */
  fallbackUrl?: string;
  /** Callback when final high-res image loads */
  onHighResLoaded?: () => void;
  /** Additional props to pass to img element */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

/**
 * ProgressiveImage - Loads images progressively from low to high resolution
 *
 * Example usage:
 * <ProgressiveImage
 *   baseUrl="https://cdn.example.com/low/disease/abc"
 *   alt="Disease image"
 *   className="w-full h-full object-cover"
 * />
 *
 * This will load:
 * 1. First: abc_x1.png (smallest, fastest)
 * 2. Then: abc_x2.png (medium)
 * 3. Finally: abc_x3.png (highest quality)
 */
const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  baseUrl,
  alt,
  className = '',
  resolutionLevels = ['x1', 'x2'],
  extension = '.png',
  placeholder,
  fallbackUrl = DEFAULT_FALLBACK_URL,
  onHighResLoaded,
  imgProps = {},
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [loadedLevel, setLoadedLevel] = useState<number>(-1);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

  // Generate URL for a specific resolution level
  const getUrlForLevel = useCallback((level: string): string => {
    // Remove any existing extension from baseUrl
    const cleanBase = baseUrl.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');
    return `${cleanBase}_${level}${extension}`;
  }, [baseUrl, extension]);

  // Preload an image and return a promise
  const preloadImage = useCallback((src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let loadedAny = false;

    const loadProgressively = async () => {
      setIsLoading(true);
      setHasError(false);
      setLoadedLevel(-1);

      // If baseUrl is empty, go directly to fallback
      if (!baseUrl) {
        if (mountedRef.current) {
          setCurrentSrc(fallbackUrl);
          setIsLoading(false);
        }
        return;
      }

      // Start with placeholder if provided
      if (placeholder && mountedRef.current) {
        setCurrentSrc(placeholder);
      }

      // Try to load each resolution level in order
      for (let i = 0; i < resolutionLevels.length; i++) {
        if (cancelled) break;

        const level = resolutionLevels[i];
        const url = getUrlForLevel(level);

        try {
          await preloadImage(url);
          if (!cancelled && mountedRef.current) {
            setCurrentSrc(url);
            setLoadedLevel(i);
            loadedAny = true;

            // If this is the highest level, call callback
            if (i === resolutionLevels.length - 1 && onHighResLoaded) {
              onHighResLoaded();
            }
          }
        } catch (err) {
          // Continue to next level if this one fails
          console.debug(`Progressive image: Failed to load ${level} for ${baseUrl}`);
        }
      }

      if (!cancelled && mountedRef.current) {
        setIsLoading(false);

        // If no image loaded at all, use fallback
        if (!loadedAny) {
          setCurrentSrc(fallbackUrl);
          setHasError(true);
        }
      }
    };

    loadProgressively();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [baseUrl, resolutionLevels, extension, placeholder, fallbackUrl, getUrlForLevel, preloadImage, onHighResLoaded]);

  // Handle img error (fallback)
  const handleError = useCallback(() => {
    if (currentSrc !== fallbackUrl) {
      setCurrentSrc(fallbackUrl);
      setHasError(true);
    }
  }, [currentSrc, fallbackUrl]);

  return (
    <img
      src={currentSrc || fallbackUrl}
      alt={alt}
      className={`${className} ${isLoading && loadedLevel < 1 ? 'blur-sm' : ''} transition-all duration-300`}
      onError={handleError}
      {...imgProps}
    />
  );
};

export default ProgressiveImage;

/**
 * Hook for progressive image loading logic
 * Use this when you need more control over the loading process
 */
export const useProgressiveImage = (
  baseUrl: string,
  resolutionLevels: ('x1' | 'x2' | 'x3')[] = ['x1', 'x2'],
  extension: string = '.png'
) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [loadedLevel, setLoadedLevel] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProgressively = async () => {
      setIsLoading(true);
      const cleanBase = baseUrl.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');

      for (let i = 0; i < resolutionLevels.length; i++) {
        if (cancelled) break;

        const url = `${cleanBase}_${resolutionLevels[i]}${extension}`;

        try {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = url;
          });

          if (!cancelled) {
            setCurrentSrc(url);
            setLoadedLevel(i);
          }
        } catch {
          // Continue to next level
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    loadProgressively();
    return () => { cancelled = true; };
  }, [baseUrl, resolutionLevels, extension]);

  return { currentSrc, loadedLevel, isLoading };
};
