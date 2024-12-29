import { useState, useEffect } from 'react'
import ColorSlider from './components/ColorSlider'
import PreviewCanvas from './components/PreviewCanvas'
import ExportButton from './components/ExportButton'
import LayerSelector from './components/LayerSelector'
import { scanAssetDirectories, AssetStructure } from './utils/assetScanner'

interface LayerState {
  style: string;
  color: string;
}

interface Layers {
  [key: string]: LayerState;
}

function App() {
  const [layers, setLayers] = useState<Layers>({});
  const [availableStyles, setAvailableStyles] = useState<AssetStructure>({});
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Watch system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Scan for available assets and initialize layers
  useEffect(() => {
    const initializeLayers = async () => {
      const assetStructure = await scanAssetDirectories();
      setAvailableStyles(assetStructure);

      const initialLayers: Layers = {};
      Object.entries(assetStructure).forEach(([category, styles]) => {
        if (styles.length > 0) {
          initialLayers[category] = {
            style: styles[0],
            color: '#FF0000'
          };
        }
      });
      setLayers(initialLayers);
    };

    initializeLayers();
  }, []);

  const handleColorChange = (layerName: string, color: string) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: { ...prev[layerName], color }
    }));
  };

  const handleStyleChange = (layerName: string, style: string) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: { ...prev[layerName], style }
    }));
  };

  const handleReset = () => {
    const resetLayers: Layers = {};
    Object.entries(availableStyles).forEach(([category, styles]) => {
      if (styles.length > 0) {
        resetLayers[category] = {
          style: styles[0],
          color: '#FF0000'
        };
      }
    });
    setLayers(resetLayers);
  };

  if (Object.keys(layers).length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} p-8 flex items-center justify-center`}>
        <div className="text-xl">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 overflow-hidden`}>
      <div className={`max-w-4xl mx-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 h-[calc(100vh-2rem)]`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Sprite Map Creator</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-8rem)] overflow-hidden">
          <div className="overflow-y-auto pr-2 space-y-2 scrollbar-hide">
            {Object.entries(layers).map(([layerName, layer]) => (
              <div 
                key={layerName} 
                className={`space-y-1 p-2 border rounded-lg ${
                  darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200'
                }`}
              >
                <LayerSelector
                  layerType={layerName}
                  currentStyle={layer.style}
                  availableStyles={availableStyles[layerName] || []}
                  onStyleChange={(style) => handleStyleChange(layerName, style)}
                  darkMode={darkMode}
                />
                <ColorSlider
                  layerName={layerName}
                  color={layer.color}
                  onColorChange={(color) => handleColorChange(layerName, color)}
                  darkMode={darkMode}
                />
              </div>
            ))}
            <button
              onClick={handleReset}
              className={`w-full py-1.5 px-4 rounded text-sm font-medium ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Reset All Layers
            </button>
          </div>
          
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center">
              <PreviewCanvas layers={layers} darkMode={darkMode} />
            </div>
            <ExportButton 
              layers={layers} 
              darkMode={darkMode} 
              className="mt-4" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
