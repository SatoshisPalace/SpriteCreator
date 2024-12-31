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
      <div className={`min-h-screen bg-gradient-to-br from-[#FCF5D8] via-[#F4860A]/20 to-[#814E33] p-4 overflow-hidden`}>
        <div className="text-2xl">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-gradient-to-br from-[#FCF5D8] via-[#F4860A]/20 to-[#814E33] p-4 overflow-hidden`}>
      <div className={`h-full mx-auto backdrop-blur-xl ${darkMode ? 'bg-[#814E33]/20 text-[#FCF5D8]' : 'bg-[#FCF5D8]/30'} rounded-2xl shadow-2xl p-4 border ${darkMode ? 'border-[#F4860A]/30' : 'border-[#814E33]/20'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1" /> {/* Spacer */}
          <img src="/assets/rune-realm-transparent.png" alt="Rune Realm Logo" className="h-40 w-auto" />
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                darkMode 
                  ? 'bg-[#F4860A]/30 hover:bg-[#F4860A]/40 text-[#FCF5D8]' 
                  : 'bg-[#814E33]/20 hover:bg-[#814E33]/30 text-[#F4860A]'
              } shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-11rem)]">
          <div className="grid grid-cols-1 auto-rows-min gap-2 content-start h-full overflow-hidden">
            <div className="h-full overflow-y-auto pr-2 space-y-2">
              {Object.entries(layers).map(([layerName, layer]) => (
                <div 
                  key={layerName} 
                  className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-[#814E33]/20 border-[#F4860A]/30' : 'bg-[#FCF5D8]/40 border-[#814E33]/20'
                  } border shadow-lg hover:bg-opacity-30`}
                >
                  <h3 className={`text-sm font-semibold ${darkMode ? 'text-[#FCF5D8]' : 'text-[#814E33]'} mb-2`}>
                    {layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                  </h3>
                  <div className="space-y-2">
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
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col h-full gap-3">
            <div className={`flex-1 flex flex-col p-4 rounded-xl backdrop-blur-md ${
              darkMode ? 'bg-[#814E33]/20' : 'bg-[#FCF5D8]/40'
            } border ${darkMode ? 'border-[#F4860A]/30' : 'border-[#814E33]/20'} shadow-lg`}>
              <div className="text-center mb-4">
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${darkMode ? 'from-[#FCF5D8] to-[#F4860A]' : 'from-[#814E33] to-[#F4860A]'} bg-clip-text text-transparent`}>
                  Character Designer
                </h1>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <PreviewCanvas layers={layers} darkMode={darkMode} />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-[#F4860A]/30 hover:bg-[#F4860A]/40 text-[#FCF5D8]' 
                    : 'bg-[#814E33]/20 hover:bg-[#814E33]/30 text-[#814E33]'
                } backdrop-blur-md shadow-lg hover:shadow-xl border ${darkMode ? 'border-[#F4860A]/30' : 'border-[#814E33]/20'}`}
              >
                Reset All Layers
              </button>
              <ExportButton 
                layers={layers} 
                darkMode={darkMode} 
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-[#814E33]/30 hover:bg-[#814E33]/40 text-[#FCF5D8]' 
                    : 'bg-[#F4860A]/20 hover:bg-[#F4860A]/30 text-[#814E33]'
                } backdrop-blur-md shadow-lg hover:shadow-xl border ${darkMode ? 'border-[#F4860A]/30' : 'border-[#814E33]/20'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
