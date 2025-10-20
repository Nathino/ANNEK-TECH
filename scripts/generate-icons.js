import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple PNG icon generator using Canvas API
async function generatePNGIcon(size) {
  try {
    const { createCanvas } = await import('canvas');
    
    const canvasElement = createCanvas(size, size);
    const ctx = canvasElement.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    
    // Draw rounded rectangle background
    const cornerRadius = size * 0.2;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, cornerRadius);
    ctx.fill();
    
    // Add "AT" text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AT', size / 2, size / 2);
    
    return canvasElement.toBuffer('image/png');
  } catch (error) {
    throw new Error(`Canvas not available: ${error.message}`);
  }
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate missing icons
async function generateAllIcons() {
  for (const size of iconSizes) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    // Check if icon already exists
    if (fs.existsSync(filepath)) {
      console.log(`${filename} already exists, skipping...`);
      continue;
    }
    
    try {
      const pngBuffer = await generatePNGIcon(size);
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`Generated ${filename}`);
    } catch (error) {
      console.error(`Failed to generate ${filename}: ${error.message}`);
    }
  }
  
  console.log('PWA icons generation completed!');
}

// Run the generation
generateAllIcons().catch(console.error);
