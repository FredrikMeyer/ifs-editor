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

export interface HSLColor {
  type: "HSL";
  hue: number;
  saturation: number;
  lightness: number;
}

export type Color = RGBColor | HSVColor | HSLColor;
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

export const WHITE: Color = {
  type: "RGB",
  red: 255,
  green: 255,
  blue: 255,
};

function getHue({
  red,
  green,
  blue,
  chroma,
  value,
}: {
  red: number;
  green: number;
  blue: number;
  chroma: number;
  value: number;
}): number {
  if (chroma === 0) {
    return 0;
  }

  if (value === red) {
    return (60 * (green - blue)) / chroma;
  }

  if (value === green) {
    return 60 * (2 + (blue - red) / chroma);
  }

  // value === blueScaled in this case
  return 60 * (4 + (red - green) / chroma);
}

export function toHSV(color: Color): HSVColor {
  if (color.type === "HSV") return color;

  if (color.type === "HSL") {
    const { hue, saturation, lightness } = color;
    const value = lightness + saturation * Math.min(lightness, 1 - lightness);
    return {
      type: "HSV",
      hue,
      value,
      saturation: value === 0 ? 0 : 2 * (1 - lightness / value),
    };
  }

  const { red, green, blue } = color;
  const { redScaled, greenScaled, blueScaled } = {
    redScaled: red / 255,
    greenScaled: green / 255,
    blueScaled: blue / 255,
  };
  const xMax = Math.max(redScaled, greenScaled, blueScaled);
  const xMin = Math.min(redScaled, greenScaled, blueScaled);

  const V = xMax;
  const chroma = xMax - xMin;

  const hue = getHue({
    red: redScaled,
    green: greenScaled,
    blue: blueScaled,
    chroma,
    value: V,
  });

  const sv = V === 0 ? 0 : chroma / V;
  return { type: "HSV", hue, saturation: sv, value: V };
}

export function toHSL(color: Color): HSLColor {
  if (color.type === "HSL") return color;

  if (color.type === "HSV") {
    const { hue, saturation, value } = color;
    const lightness = value * (1 - saturation / 2);
    return {
      type: "HSL",
      hue,
      lightness,
      saturation:
        lightness === 0 || lightness === 1
          ? 0
          : (value - lightness) / Math.min(lightness, 1 - lightness),
    };
  }
  const { red, green, blue } = color;

  const { redScaled, greenScaled, blueScaled } = {
    redScaled: red / 255,
    greenScaled: green / 255,
    blueScaled: blue / 255,
  };
  const xMax = Math.max(redScaled, greenScaled, blueScaled);
  const xMin = Math.min(redScaled, greenScaled, blueScaled);

  const V = xMax;
  const chroma = xMax - xMin;

  const lightness = 0.5 * (xMax + xMin);

  const hue = getHue({
    red: redScaled,
    blue: blueScaled,
    green: greenScaled,
    chroma,
    value: V,
  });

  const sl =
    lightness === 0 || lightness === 1
      ? 0
      : (2 * (V - lightness)) / (1 - Math.abs(2 * lightness - 1));
  return { type: "HSL", hue, saturation: sl, lightness };
}

export function toRGB(color: Color): RGBColor {
  if (color.type === "RGB") return color;

  if (color.type === "HSV") {
    const { hue, saturation, value } = color;

    const f = (n: number) => {
      const k = (n + hue / 60) % 6;
      return value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1));
    };

    const { red, green, blue } = {
      red: f(5) * 255,
      green: f(3) * 255,
      blue: f(1) * 255,
    };
    return {
      type: "RGB",
      red,
      green,
      blue,
    };
  }

  // We're dealing with HSL
  const { hue, saturation, lightness } = color;

  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const a = saturation * Math.min(lightness, 1 - lightness);

    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };

  return {
    type: "RGB",
    red: f(0) * 255,
    green: f(8) * 255,
    blue: f(4) * 255,
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

  it("converts rgb to hsv", () => {
    const brownHSV = toHSV(BROWN);

    const res = toRGB(brownHSV);

    expect(res).toStrictEqual(BROWN);

    expect(res.type).toEqual("RGB");
  });

  it("converts hsl to rgb and back", () => {
    const hsl: HSLColor = {
      type: "HSL",
      hue: 45,
      saturation: 1,
      lightness: 0.5,
    };

    const rgb = toRGB(hsl);
    const res = toHSL(rgb);

    expect(res).toStrictEqual(hsl);
  });

  it("max lightness HSL is pure white", () => {
    const hsl: HSLColor = {
      type: "HSL",
      hue: 44,
      saturation: 0.8,
      lightness: 1,
    };

    const rgb = toRGB(hsl);

    expect(rgb).toEqual(WHITE);
  });

  it("max value HSV is pure red", () => {
    const hsl: HSVColor = {
      type: "HSV",
      hue: 0,
      saturation: 1,
      value: 1,
    };

    const rgb = toRGB(hsl);

    expect(rgb).toEqual(RED);
  });

  it("converts rgb to hsl and back", () => {
    const brownHSL = toHSL(BROWN);

    const res = toRGB(brownHSL);

    const { red, green, blue } = res;
    expect(red).toBeCloseTo(BROWN.red);
    expect(green).toBeCloseTo(BROWN.green);
    expect(blue).toBeCloseTo(BROWN.blue);

    expect(res.type).toEqual("RGB");
  });

  it("converts hsl to hsv and back", () => {
    const hsl: HSLColor = {
      type: "HSL",
      hue: 100,
      saturation: 0.8,
      lightness: 0.5,
    };

    const hsv = toHSV(hsl);
    const res = toHSL(hsv);
    expect(res).toStrictEqual(hsl);
  });

  it("converts in a cycle", () => {
    const brownHSV = toHSV(BROWN);
    const hsl = toHSL(brownHSV);
    const rgb = toRGB(hsl);

    const { red, green, blue } = rgb;
    expect(red).toBeCloseTo(BROWN.red);
    expect(green).toBeCloseTo(BROWN.green);
    expect(blue).toBeCloseTo(BROWN.blue);
  });
}
