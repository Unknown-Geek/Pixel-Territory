// Utility for generating and managing player colors

// Generate a bright, vibrant color that's visually distinct
export const generateRandomColor = () => {
  // Using HSL for better control over saturation and lightness
  const hue = Math.floor(Math.random() * 360); // 0-359 degrees
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-99%
  const lightness = 40 + Math.floor(Math.random() * 20); // 40-59%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Generate a color that's visually distinct from existing colors
export const generateUniqueColor = (existingColors = []) => {
  if (existingColors.length === 0) {
    return generateRandomColor();
  }

  let bestColor = generateRandomColor();
  let maxDistance = 0;

  // Try several colors and pick the one with max distance from existing colors
  for (let i = 0; i < 20; i++) {
    const candidate = generateRandomColor();
    let minDistanceToExisting = Infinity;

    // Find the minimum distance to any existing color
    for (const color of existingColors) {
      const distance = colorDistance(candidate, color);
      minDistanceToExisting = Math.min(minDistanceToExisting, distance);
    }

    // If this candidate is more distinct than our current best, use it
    if (minDistanceToExisting > maxDistance) {
      maxDistance = minDistanceToExisting;
      bestColor = candidate;
    }
  }

  return bestColor;
};

// Calculate perceived color distance (approximate)
const colorDistance = (color1, color2) => {
  // Convert to RGB for distance calculation
  const rgb1 = colorToRgb(color1);
  const rgb2 = colorToRgb(color2);

  // Simple Euclidean distance in RGB space
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );
};

// Helper function to convert any CSS color to RGB
const colorToRgb = (color) => {
  // For this demo, we'll use a simplified approach
  // A proper implementation would handle all CSS color formats

  // If it's already an RGB or HSL value, extract components
  if (color.startsWith("rgb")) {
    const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      };
    }
  } else if (color.startsWith("hsl")) {
    // Simplified HSL to RGB conversion
    const match = color.match(/(\d+),\s*(\d+)%,\s*(\d+)%/);
    if (match) {
      const h = parseInt(match[1], 10) / 360;
      const s = parseInt(match[2], 10) / 100;
      const l = parseInt(match[3], 10) / 100;

      // Simple HSL to RGB conversion
      const rgb = hslToRgb(h, s, l);
      return {
        r: Math.round(rgb.r * 255),
        g: Math.round(rgb.g * 255),
        b: Math.round(rgb.b * 255),
      };
    }
  } else if (color.startsWith("#")) {
    // Handle hex colors
    const hex = color.substring(1);
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  // Default to black if color can't be parsed
  return { r: 0, g: 0, b: 0 };
};

// HSL to RGB conversion
const hslToRgb = (h, s, l) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r, g, b };
};
