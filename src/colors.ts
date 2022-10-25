export interface RGBColor {
  type: "RGB";
  red: number;
  blue: number;
  green: number;
}

export interface HSVColor {
  type: "HSV";
  hue: number;
  saturation: number;
  value: number;
}

export type Color = RGBColor | HSVColor;
export const RED: Color = {
  type: "RGB",
  red: 255,
  green: 0,
  blue: 0,
};

export const BLUE: Color = {
  type: "RGB",
  red: 0,
  green: 0,
  blue: 255,
};

export const GREEN: Color = {
  type: "RGB",
  red: 0,
  green: 100,
  blue: 0,
};

export const BROWN: Color = {
  type: "RGB",
  red: 150,
  green: 100,
  blue: 40,
};

function toHSV(color: RGBColor): HSVColor {
  const { red, green, blue } = color;
  const { redScaled, greenScaled, blueScaled } = {
    redScaled: red / 255,
    greenScaled: green / 255,
    blueScaled: blue / 255,
  };
  const xMax = Math.max(redScaled, greenScaled, blueScaled);
  const xMin = Math.min(redScaled, greenScaled, blueScaled);

  const chroma = xMax - xMin;

  const lightness = 0.5 * (xMax + xMax);

  const hue = (() => {
    if (chroma === 0) {
      return 0;
    }

    if (xMax === redScaled) {
      return (60 * (greenScaled - blueScaled)) / chroma;
    }

    if (xMax === greenScaled) {
      return 60 * (2 + (blueScaled - redScaled) / chroma);
    }

    // xMax === blueScaled in this case
    return 60 * (4 + (redScaled - greenScaled) / chroma);
  })();

  const sv = xMax === 0 ? 0 : chroma / xMax;

  return { type: "HSV", hue, saturation: sv, value: lightness };
}

export function toRGB(color: HSVColor): RGBColor {
  const { hue, saturation, value } = color;

  const f = (n: number) => {
    const k = (n + hue / 60) % 6;
    return (
      (value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1))) * 255
    );
  };

  const { red, green, blue } = { red: f(5), green: f(3), blue: f(1) };
  return {
    type: "RGB",
    red,
    green,
    blue,
  };
}

export function randomColor(): Color {
  return {
    type: "RGB",
    red: Math.floor(Math.random() * 255),
    blue: Math.floor(Math.random() * 255),
    green: Math.floor(Math.random() * 255),
  };
}

export function toHexString(color: Color): string {
  const rgbColor = color.type === "RGB" ? color : toRGB(color);

  let r = rgbColor.red.toString(16);
  let g = rgbColor.green.toString(16);
  let b = rgbColor.blue.toString(16);

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
        type: "RGB",
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : null;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("converts", () => {
    const res = toHSV(RED);

    expect(res).toStrictEqual<HSVColor>({
      type: "HSV",
      hue: 0,
      saturation: 1,
      value: 1,
    });
  });

  it("converts hsv to rgb", () => {
    const brownHSV = toHSV(BROWN);

    const res = toRGB(brownHSV);

    expect(res).toStrictEqual(BROWN);
  });
}
