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
  green: 255,
  blue: 0,
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
