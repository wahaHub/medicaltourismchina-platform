import type { ImgHTMLAttributes } from "react";

import ProgressiveImage from "@/components/ProgressiveImage";
import { getHospitalProgressiveBaseUrl } from "@/utils/hospital-photo-state";

type HospitalProgressiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

const HOSPITAL_RESOLUTION_LEVELS: ("x1" | "x2")[] = ["x1", "x2"];

function getImageExtension(src: string): string {
  try {
    const url = new URL(src);
    return url.pathname.match(/\.(png|jpg|jpeg|webp)$/i)?.[0] ?? ".png";
  } catch {
    return src.match(/\.(png|jpg|jpeg|webp)$/i)?.[0] ?? ".png";
  }
}

const HospitalProgressiveImage = ({
  src,
  alt,
  className,
  ...imgProps
}: HospitalProgressiveImageProps) => {
  const progressiveBaseUrl = getHospitalProgressiveBaseUrl(src);
  const extension = getImageExtension(src);

  if (!progressiveBaseUrl) {
    return <img src={src} alt={alt} className={className} {...imgProps} />;
  }

  return (
    <ProgressiveImage
      baseUrl={progressiveBaseUrl}
      alt={alt}
      resolutionLevels={HOSPITAL_RESOLUTION_LEVELS}
      extension={extension}
      placeholder={`${progressiveBaseUrl}_x1${extension}`}
      fallbackUrl={src}
      className={className}
      imgProps={imgProps}
    />
  );
};

export default HospitalProgressiveImage;
