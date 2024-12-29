interface LayerSelectorProps {
  layerType: string;  // e.g., "PANTS", "SHIRT"
  currentStyle: string; // e.g., "STYLE1", "STYLE2"
  availableStyles: string[];
  onStyleChange: (style: string) => void;
  darkMode?: boolean;
}

const LayerSelector: React.FC<LayerSelectorProps> = ({
  layerType,
  currentStyle,
  availableStyles,
  onStyleChange,
  darkMode,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-xs font-medium capitalize min-w-[60px] truncate">
        {layerType.toLowerCase()}:
      </label>
      <select
        value={currentStyle}
        onChange={(e) => onStyleChange(e.target.value)}
        className={`flex-1 py-1 px-2 text-sm border rounded ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-200'
        }`}
      >
        {availableStyles.map((style) => (
          <option key={style} value={style}>
            {style}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LayerSelector;
