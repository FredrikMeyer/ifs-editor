export interface Color {
  red: number;
  blue: number;
  green: number;
}

export const RED: Color = {
  red: 255,
  green: 0,
  blue: 0,
};

export const BLUE: Color = {
  red: 0,
  green: 0,
  blue: 255,
};

export const GREEN: Color = {
  red: 0,
  green: 100,
  blue: 0,
};

export const BROWN: Color = {
  red: 150,
  green: 100,
  blue: 40,
};

export function randomColor(): Color {
  return {
    red: Math.floor(Math.random() * 255),
    blue: Math.floor(Math.random() * 255),
    green: Math.floor(Math.random() * 255),
  };
}

export function toHexString(color: Color): string {
  let r = color.red.toString(16);
  let g = color.green.toString(16);
  let b = color.blue.toString(16);

  if (r.length < 2) {
    r = "0" + r;
  }

  if (g.length < 2) {
    g = "0" + g;
  }

  if (b.length < 2) {
    b = "0" + b;
  }

  return "#" + r + g + b;
}

// https://stackoverflow.com/a/5624139/1013553
export function hexToColor(s: string): Color | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : null;
}
