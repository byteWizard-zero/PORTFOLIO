export function hexToRgb(hex: string): { r: number; g: number; b: number } {

  let cleanHex = hex.trim().replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }

  if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`hexToRgb: invalid hex color "${hex}" — falling back to black`);
    }
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}
