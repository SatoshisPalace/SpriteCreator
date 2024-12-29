import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { hexToRgb, matchesGreyShade, calculateColorShade, getGreyLevel } from '../utils/colorMapping';

interface PreviewCanvasProps {
  layers: {
    [key: string]: {
      style: string;
      color: string;
    };
  };
  darkMode?: boolean;
}

type Direction = 'forward' | 'left' | 'right' | 'back';

class SpritePreviewScene extends Phaser.Scene {
  private sprites: { [key: string]: { [direction in Direction]: Phaser.GameObjects.Sprite } } = {};
  private textures: { [key: string]: HTMLCanvasElement } = {};
  private layers: PreviewCanvasProps['layers'];
  private colorCache: { [key: string]: ImageData } = {};
  private animationPrefix: { [key in Direction]: string } = {
    forward: 'walk-down',
    left: 'walk-left',
    right: 'walk-right',
    back: 'walk-up'
  };

  constructor(layers: PreviewCanvasProps['layers']) {
    super({ key: 'SpritePreviewScene' });
    this.layers = layers;
  }

  preload() {
    console.log('Starting to load assets...');
    
    const spritesheetConfig = {
      frameWidth: 48,
      frameHeight: 60
    };

    // Load base sprite
    this.load.spritesheet('BASE', '/assets/BASE.png', spritesheetConfig);

    // Load all layer variations
    Object.entries(this.layers).forEach(([layerName, layer]) => {
      const assetPath = `/assets/${layerName}/${layer.style}.png`;
      console.log(`Loading asset: ${assetPath}`);
      this.load.spritesheet(`${layerName}.${layer.style}`, assetPath, spritesheetConfig);
    });
  }

  create() {
    const directions: Direction[] = ['forward', 'left', 'right', 'back'];
    const frameRates = { forward: 8, left: 8, right: 8, back: 8 };
    const positions = {
      forward: { x: 144, y: 270 },
      left: { x: 144, y: 90 },
      right: { x: 432, y: 90 },
      back: { x: 432, y: 270 }
    };
    
    // Define frame sequences for ping-pong style animation
    const frameSequences = {
      forward: [0, 1, 2, 1],
      left: [3, 4, 5, 4],
      right: [6, 7, 8, 7],
      back: [9, 10, 11, 10]
    };

    // Initialize sprite containers
    this.sprites['BASE'] = {};

    // Create base sprites and animations for each direction
    directions.forEach(dir => {
      // Create base sprite for this direction
      this.sprites['BASE'][dir] = this.add.sprite(positions[dir].x, positions[dir].y, 'BASE');
      this.sprites['BASE'][dir].setOrigin(0.5, 0.5);
      this.sprites['BASE'][dir].setScale(3); // Make sprites even larger

      // Create animation for base
      this.anims.create({
        key: `BASE-${this.animationPrefix[dir]}`,
        frames: this.anims.generateFrameNumbers('BASE', {
          frames: frameSequences[dir]
        }),
        frameRate: frameRates[dir],
        repeat: -1
      });

      // Start the animation immediately
      this.sprites['BASE'][dir].play(`BASE-${this.animationPrefix[dir]}`);
    });

    // Create layer sprites and their animations
    Object.entries(this.layers).forEach(([layerName, layer]) => {
      const spriteKey = `${layerName}.${layer.style}`;
      this.sprites[layerName] = {};
      
      // Create a new texture with color replacement
      this.createColorizedTexture(layerName, layer.style, layer.color);
      
      // Create sprites and animations for each direction
      directions.forEach(dir => {
        // Create sprite for this direction
        this.sprites[layerName][dir] = this.add.sprite(
          positions[dir].x,
          positions[dir].y,
          `${spriteKey}-colored`
        );
        this.sprites[layerName][dir].setOrigin(0.5, 0.5);
        this.sprites[layerName][dir].setScale(3); // Make sprites even larger

        // Create animation
        this.anims.create({
          key: `${spriteKey}-${this.animationPrefix[dir]}`,
          frames: this.anims.generateFrameNumbers(`${spriteKey}-colored`, {
            frames: frameSequences[dir]
          }),
          frameRate: frameRates[dir],
          repeat: -1
        });

        // Start the animation immediately
        this.sprites[layerName][dir].play(`${spriteKey}-${this.animationPrefix[dir]}`);
      });
    });

    // Add direction labels
    const labelStyle = { 
      fontSize: '18px',
      color: '#666666'
    };
    this.add.text(144, 30, 'Left', labelStyle).setOrigin(0.5);
    this.add.text(432, 30, 'Right', labelStyle).setOrigin(0.5);
    this.add.text(144, 330, 'Forward', labelStyle).setOrigin(0.5);
    this.add.text(432, 330, 'Back', labelStyle).setOrigin(0.5);
  }

  updateColors(newLayers: PreviewCanvasProps['layers']) {
    Object.entries(newLayers).forEach(([layerName, layer]) => {
      if (this.sprites[layerName]) {
        const spriteKey = `${layerName}.${layer.style}`;
        this.createColorizedTexture(layerName, layer.style, layer.color);
        
        // Update all direction sprites
        Object.values(this.sprites[layerName]).forEach(sprite => {
          const currentAnim = sprite.anims.currentAnim;
          sprite.setTexture(`${spriteKey}-colored`);
          if (currentAnim) {
            sprite.play(currentAnim.key);
          }
        });
      }
    });
  }

  private createColorizedTexture(layerName: string, style: string, color: string) {
    const spriteKey = `${layerName}.${style}`;
    const colorizedKey = `${spriteKey}-colored`;
    const cacheKey = `${spriteKey}-${color}`;
    
    // Check if we have this color variation cached
    if (this.colorCache[cacheKey]) {
      const cachedImageData = this.colorCache[cacheKey];
      const canvas = document.createElement('canvas');
      canvas.width = cachedImageData.width;
      canvas.height = cachedImageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(cachedImageData, 0, 0);
      
      if (this.textures.exists(colorizedKey)) {
        this.textures.remove(colorizedKey);
      }
      
      this.textures.addSpriteSheet(colorizedKey, canvas, {
        frameWidth: 48,
        frameHeight: 60
      });
      
      this.textures[colorizedKey] = canvas;
      return;
    }
    
    // Create new colorized texture
    const originalTexture = this.textures.get(spriteKey);
    const canvas = document.createElement('canvas');
    canvas.width = originalTexture.source[0].width;
    canvas.height = originalTexture.source[0].height;
    const ctx = canvas.getContext('2d')!;
    
    ctx.drawImage(
      originalTexture.getSourceImage() as HTMLImageElement,
      0, 0
    );
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const targetColor = hexToRgb(color);
    
    for (let i = 0; i < pixels.length; i += 4) {
      const a = pixels[i + 3];
      if (a === 0) continue;
      
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Skip black pixels
      if (r === 0 && g === 0 && b === 0) continue;
      
      const shadeIndex = matchesGreyShade({ r, g, b });
      if (shadeIndex !== -1) {
        const greyLevel = getGreyLevel(shadeIndex);
        const newColor = calculateColorShade(targetColor, greyLevel);
        pixels[i] = newColor.r;
        pixels[i + 1] = newColor.g;
        pixels[i + 2] = newColor.b;
      }
    }
    
    // Cache the result
    this.colorCache[cacheKey] = imageData;
    
    ctx.putImageData(imageData, 0, 0);
    
    if (this.textures.exists(colorizedKey)) {
      this.textures.remove(colorizedKey);
    }
    
    this.textures.addSpriteSheet(colorizedKey, canvas, {
      frameWidth: 48,
      frameHeight: 60
    });
    
    this.textures[colorizedKey] = canvas;
  }

  destroy() {
    Object.values(this.textures).forEach(canvas => {
      canvas.remove();
    });
    this.colorCache = {};
    super.destroy();
  }
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ layers, darkMode = false }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<SpritePreviewScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 576,  // Increased canvas width further
        height: 360, // Increased canvas height further
        parent: 'phaser-container',
        scene: new SpritePreviewScene(layers),
        transparent: true,
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        backgroundColor: darkMode ? 'rgba(17, 24, 39, 0)' : 'rgba(0, 0, 0, 0)',
        callbacks: {
          postBoot: () => {
            setIsLoading(false);
          }
        }
      };

      gameRef.current = new Phaser.Game(config);
      sceneRef.current = gameRef.current.scene.getScene('SpritePreviewScene') as SpritePreviewScene;
    } else if (sceneRef.current) {
      sceneRef.current.updateColors(layers);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [layers, darkMode]);

  return (
    <div className={`relative w-full flex-1 min-h-[360px] flex items-center justify-center ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg`}>
      <div id="phaser-container" className="w-[576px] h-[360px]" />
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center ${
          darkMode ? 'bg-gray-800 bg-opacity-75' : 'bg-gray-50 bg-opacity-75'
        }`}>
          <div className="text-lg">Loading sprites...</div>
        </div>
      )}
    </div>
  );
};

export default PreviewCanvas;
