const RAINBOW_COLORS = [
  // Reds
  '#FF0000', // Pure Red
  '#FF3333', // Light Red
  '#CC0000', // Dark Red
  '#800000', // Maroon
  
  // Oranges
  '#FF8000', // Pure Orange
  '#FFA500', // Standard Orange
  '#FF6600', // Dark Orange
  '#CC4400', // Deep Orange

  // Yellows
  '#FFFF00', // Pure Yellow
  '#FFD700', // Gold
  '#FFC000', // Dark Yellow
  '#CC9900', // Deep Yellow

  // Greens
  '#00FF00', // Pure Green
  '#33CC33', // Light Green
  '#008000', // Dark Green
  '#006400', // Deep Green

  // Cyans
  '#00FFFF', // Pure Cyan
  '#00E5EE', // Light Cyan
  '#00CED1', // Dark Cyan
  '#008B8B', // Deep Cyan

  // Blues
  '#0000FF', // Pure Blue
  '#4169E1', // Royal Blue
  '#000080', // Navy Blue
  '#191970', // Midnight Blue

  // Purples
  '#8000FF', // Pure Purple
  '#9932CC', // Dark Orchid
  '#800080', // Purple
  '#4B0082', // Indigo

  // Pinks
  '#FF00FF', // Pure Pink
  '#FF69B4', // Hot Pink
  '#C71585', // Medium Violet Red
  '#8B008B', // Dark Magenta

  // Browns
  '#8B4513', // Saddle Brown
  '#A0522D', // Sienna
  '#6B4423', // Deep Brown
  '#3D2B1F', // Dark Brown

  // Grays
  '#FFFFFF', // White
  '#C0C0C0', // Silver
  '#808080', // Gray
  '#000000', // Black
];

interface ColorSliderProps {
  layerName: string;
  color: string;
  onColorChange: (color: string) => void;
  darkMode?: boolean;
}

const ColorSlider: React.FC<ColorSliderProps> = ({ layerName, color, onColorChange, darkMode }) => {
  // Find the closest color index
  const findClosestColorIndex = (targetColor: string): number => {
    const getRGB = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    });

    const target = getRGB(targetColor);
    let minDistance = Infinity;
    let closestIndex = 0;

    RAINBOW_COLORS.forEach((color, index) => {
      const current = getRGB(color);
      const distance = Math.sqrt(
        Math.pow(current.r - target.r, 2) +
        Math.pow(current.g - target.g, 2) +
        Math.pow(current.b - target.b, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const currentIndex = findClosestColorIndex(color);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onColorChange(RAINBOW_COLORS[index]);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <style>
          {`
            .color-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #000000;
              cursor: pointer;
              border: 2px solid ${darkMode ? '#ffffff' : '#000000'};
              margin-top: -8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .color-slider::-moz-range-thumb {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #000000;
              cursor: pointer;
              border: 2px solid ${darkMode ? '#ffffff' : '#000000'};
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .color-slider::-webkit-slider-runnable-track {
              height: 8px;
              border-radius: 4px;
              background: linear-gradient(to right, ${RAINBOW_COLORS.join(', ')});
            }

            .color-slider::-moz-range-track {
              height: 8px;
              border-radius: 4px;
              background: linear-gradient(to right, ${RAINBOW_COLORS.join(', ')});
            }
          `}
        </style>
        <input
          type="range"
          min="0"
          max={RAINBOW_COLORS.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="color-slider w-full h-8 appearance-none rounded cursor-pointer"
        />
      </div>
      <div 
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
          darkMode ? 'border-gray-600' : 'border-gray-300'
        }`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default ColorSlider;
