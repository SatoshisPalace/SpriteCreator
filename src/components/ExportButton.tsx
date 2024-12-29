import { useCallback } from 'react';

interface ExportButtonProps {
  layers: {
    [key: string]: {
      style: string;
      color: string;
    };
  };
  darkMode?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ layers, darkMode, className }) => {
  const createColorizedTexture = useCallback((imageData: ImageData, color: string): ImageData => {
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    // Convert hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Process each pixel
    for (let i = 0; i < newImageData.data.length; i += 4) {
      if (newImageData.data[i + 3] > 0) { // If pixel is not transparent
        // Apply color while preserving luminance
        const luminance = (newImageData.data[i] * 0.299 + 
                         newImageData.data[i + 1] * 0.587 + 
                         newImageData.data[i + 2] * 0.114) / 255;

        newImageData.data[i] = r * luminance;     // Red
        newImageData.data[i + 1] = g * luminance; // Green
        newImageData.data[i + 2] = b * luminance; // Blue
      }
    }

    return newImageData;
  }, []);

  const handleExport = async () => {
    try {
      // Create a canvas for the final sprite map
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size to match sprite sheet
      canvas.width = 576; // 12 frames * 48 pixels
      canvas.height = 180; // 3 rows * 60 pixels

      // Load and process each layer
      const processLayer = async (layerName: string, layerData: { style: string, color: string }) => {
        // Load the sprite sheet image
        const img = new Image();
        img.src = `/assets/${layerName}/${layerData.style}.png`;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Create a temporary canvas for color processing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        
        // Draw the original image
        tempCtx.drawImage(img, 0, 0);
        
        // Get image data and apply color
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const colorizedData = createColorizedTexture(imageData, layerData.color);
        
        // Put the colorized data back
        tempCtx.putImageData(colorizedData, 0, 0);
        
        // Draw the processed layer onto the main canvas
        ctx.drawImage(tempCanvas, 0, 0);
      };

      // Process BASE layer first
      const baseImg = new Image();
      baseImg.src = '/assets/BASE.png';
      await new Promise((resolve) => {
        baseImg.onload = resolve;
      });
      ctx.drawImage(baseImg, 0, 0);

      // Process all other layers in order
      for (const [layerName, layerData] of Object.entries(layers)) {
        await processLayer(layerName, layerData);
      }

      // Create download link
      const link = document.createElement('a');
      link.download = 'sprite-map.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting sprite map:', error);
      alert('Failed to export sprite map. Please try again.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`py-2 px-4 rounded font-medium ${
        darkMode 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${className || ''}`}
    >
      Export Sprite Map
    </button>
  );
};

export default ExportButton;
