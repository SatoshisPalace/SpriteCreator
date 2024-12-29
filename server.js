import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Cache for asset structure
let assetStructureCache = null;
let lastScanTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

// API endpoint to scan assets directory
app.get('/api/scan-assets', async (req, res) => {
  try {
    const currentTime = Date.now();
    
    // Return cached result if valid
    if (assetStructureCache && (currentTime - lastScanTime) < CACHE_DURATION) {
      return res.json(assetStructureCache);
    }
    
    const assetsDir = path.join(__dirname, 'public', 'assets');
    console.log('Scanning directory:', assetsDir);
    
    // Check if assets directory exists
    try {
      await fs.access(assetsDir);
    } catch (error) {
      console.log('Creating assets directory');
      await fs.mkdir(assetsDir, { recursive: true });
    }
    
    const items = await fs.readdir(assetsDir);
    console.log('Found items:', items);
    
    const assetStructure = {};
    
    // Scan each subdirectory
    for (const item of items) {
      const itemPath = path.join(assetsDir, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory() && item !== 'BASE') {
        const styles = await fs.readdir(itemPath);
        // Remove .png extension from style names
        assetStructure[item] = styles
          .filter(style => style.endsWith('.png'))
          .map(style => style.replace('.png', ''));
        console.log(`Found styles for ${item}:`, assetStructure[item]);
      }
    }
    
    // Update cache
    assetStructureCache = assetStructure;
    lastScanTime = currentTime;
    
    res.json(assetStructure);
  } catch (error) {
    console.error('Error scanning assets:', error);
    res.status(500).json({ 
      error: 'Failed to scan assets', 
      details: error.message,
      stack: error.stack 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message,
    stack: err.stack 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
