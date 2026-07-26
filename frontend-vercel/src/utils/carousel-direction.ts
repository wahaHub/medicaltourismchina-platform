export function getCarouselTransform(
  index: number,
  stepPercent: number,
  isRtl: boolean,
  gapCorrectionPx = 0,
): string {
  if (index === 0) {
    return "translateX(0)";
  }

  const direction = isRtl ? 1 : -1;
  const percentOffset = direction * index * stepPercent;
  const gapOffset = direction * index * gapCorrectionPx;
  const gapOperator = gapOffset < 0 ? "-" : "+";

  return `translateX(calc(${percentOffset}% ${gapOperator} ${Math.abs(gapOffset)}px))`;
}
