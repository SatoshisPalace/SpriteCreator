export interface AssetStructure {
  [category: string]: string[];  // e.g., { "PANTS": ["jeans", "shorts"] }
}

export const scanAssetDirectories = async (): Promise<AssetStructure> => {
  try {
    const response = await fetch('/api/scan-assets');
    if (!response.ok) {
      const text = await response.text();
      console.error('Server response:', text);
      throw new Error(`Server responded with ${response.status}: ${text}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error scanning assets:', error);
    return {};
  }
};
