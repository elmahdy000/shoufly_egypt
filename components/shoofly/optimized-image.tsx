"use client";

import Image from "next/image";
import { useState } from "react";
import { FiImage } from "react-icons/fi";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle external URLs that don't work with next/image
  const isExternal = src?.startsWith("http") || src?.startsWith("//");
  
  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        <FiImage size={24} />
      </div>
    );
  }

  // For external URLs without optimization
  if (isExternal && !src.includes(window?.location?.hostname || "")) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        style={{ objectFit }}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <div className={`relative ${className} ${isLoading ? "animate-pulse bg-slate-200" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width || 400}
        height={fill ? undefined : height || 300}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={`${className} transition-opacity duration-300`}
        style={{ objectFit }}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        quality={80}
      />
    </div>
  );
}

// Lazy loaded image for below-fold content
export function LazyImage(props: Omit<OptimizedImageProps, "priority">) {
  return <OptimizedImage {...props} priority={false} />;
}
