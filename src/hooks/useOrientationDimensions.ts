export const useOrientationDimensions = (orientation?: string) => {
  const isLandscape = orientation === 'landscape';
  const width = isLandscape ? 1123 : 794; // px for A4 width in landscape/portrait
  const height = isLandscape ? 794 : 1123; // px for A4 height in landscape/portrait
  return { isLandscape, width, height };
};

export default useOrientationDimensions;
