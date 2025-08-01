// This script creates simple placeholder PNG icons
// Run in browser console and save the resulting images

const sizes = [16, 48, 128];

function createIcon(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Background - solid green
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(size * 0.4)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RT', size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
}

// Generate base64 data for each size
sizes.forEach(size => {
  const dataUrl = createIcon(size);
  console.log(`Icon ${size}x${size}:`);
  console.log(dataUrl);
  console.log('---');
});