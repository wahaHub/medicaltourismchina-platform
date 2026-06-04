import type { ImgHTMLAttributes } from "react";

import ProgressiveImage from "@/components/ProgressiveImage";
import { getHospitalProgressiveBaseUrl } from "@/utils/hospital-photo-state";

type HospitalProgressiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

const HOSPITAL_RESOLUTION_LEVELS: ("x1" | "x2")[] = ["x1", "x2"];
const HOSPITAL_PROGRESSIVE_EXTENSION = ".webp";

const HospitalProgressiveImage = ({
  src,
  alt,
  className,
  ...imgProps
}: HospitalProgressiveImageProps) => {
  const progressiveBaseUrl = getHospitalProgressiveBaseUrl(src);

  if (!progressiveBaseUrl) {
    return <img src={src} alt={alt} className={className} {...imgProps} />;
  }

  return (
    <ProgressiveImage
      baseUrl={progressiveBaseUrl}
      alt={alt}
      resolutionLevels={HOSPITAL_RESOLUTION_LEVELS}
      extension={HOSPITAL_PROGRESSIVE_EXTENSION}
      placeholder={`${progressiveBaseUrl}_x1${HOSPITAL_PROGRESSIVE_EXTENSION}`}
      fallbackUrl={src}
      className={className}
      imgProps={imgProps}
    />
  );
};

export default HospitalProgressiveImage;
