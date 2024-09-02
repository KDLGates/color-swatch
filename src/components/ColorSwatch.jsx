import React, { useState, useCallback, useMemo } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

// Color conversion utilities
const rgbToHex = (r, g, b) =>
  "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// Refined color naming function
const getColorName = (r, g, b) => {
  const colorWheel = [
    { name: "Black", color: [0, 0, 0] },
    { name: "White", color: [255, 255, 255] },
    { name: "Red", color: [255, 0, 0] },
    { name: "Rose", color: [255, 0, 127] },
    { name: "Magenta", color: [255, 0, 255] },
    { name: "Violet", color: [127, 0, 255] },
    { name: "Blue", color: [0, 0, 255] },
    { name: "Azure", color: [0, 127, 255] },
    { name: "Cyan", color: [0, 255, 255] },
    { name: "Spring Green", color: [0, 255, 127] },
    { name: "Green", color: [0, 255, 0] },
    { name: "Chartreuse Green", color: [127, 255, 0] },
    { name: "Yellow", color: [255, 255, 0] },
    { name: "Orange", color: [255, 127, 0] },
  ];

  let closestColor = colorWheel[0];
  let minDistance = Infinity;

  for (const colorObj of colorWheel) {
    const [r2, g2, b2] = colorObj.color;
    const distance = Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorObj;
    }
  }

  return closestColor.name;
};

const ColorSwatch = () => {
  const [color, setColor] = useState({ r: 128, g: 128, b: 128 });
  const [savedColors, setSavedColors] = useState([]);

  const handleColorChange = useCallback((channel, value) => {
    setColor((prev) => ({
      ...prev,
      [channel]: Math.max(0, Math.min(255, Number(value))),
    }));
  }, []);

  const hexColor = useMemo(() => rgbToHex(color.r, color.g, color.b), [color]);
  const hslColor = useMemo(() => rgbToHsl(color.r, color.g, color.b), [color]);
  const colorName = useMemo(
    () => getColorName(color.r, color.g, color.b),
    [color]
  );

  const saveColor = useCallback(() => {
    setSavedColors((prev) => [
      ...prev,
      { ...color, hex: hexColor, name: colorName },
    ]);
  }, [color, hexColor, colorName]);

  const removeSavedColor = useCallback((index) => {
    setSavedColors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        RGB Color Swatch
      </h2>

      {["r", "g", "b"].map((channel) => (
        <div key={channel} className="mb-4">
          <Label
            htmlFor={channel}
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {channel.toUpperCase()}
          </Label>
          <div className="flex items-center space-x-4">
            <Input
              id={channel}
              type="number"
              min="0"
              max="255"
              value={color[channel]}
              onChange={(e) => handleColorChange(channel, e.target.value)}
              className="w-20 text-sm"
              aria-label={`${channel.toUpperCase()} value`}
            />
            <Slider
              value={[color[channel]]}
              min={0}
              max={255}
              step={1}
              onValueChange={([value]) => handleColorChange(channel, value)}
              className="flex-grow"
              aria-label={`${channel.toUpperCase()} slider`}
            />
          </div>
        </div>
      ))}
      <div className="mt-6">
        <div
          className="w-full h-32 rounded-md shadow-md mb-4"
          style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
          aria-label="Color swatch display"
        ></div>
        <p className="text-center font-semibold mb-2">Color: {colorName}</p>
        <p className="text-center mb-1">
          RGB: ({color.r}, {color.g}, {color.b})
        </p>
        <p className="text-center mb-1">HEX: {hexColor}</p>
        <p className="text-center mb-4">
          HSL: ({hslColor[0]}°, {hslColor[1]}%, {hslColor[2]}%)
        </p>

        <Button onClick={saveColor} className="w-full mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Save Color
        </Button>
      </div>

      {savedColors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Saved Colors</h3>
          <div className="grid grid-cols-3 gap-2">
            {savedColors.map((savedColor, index) => (
              <div key={index} className="relative">
                <div
                  className="w-full h-16 rounded-md shadow-md"
                  style={{ backgroundColor: savedColor.hex }}
                  title={savedColor.name}
                ></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 p-1"
                  onClick={() => removeSavedColor(index)}
                  aria-label="Remove saved color"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSwatch;
