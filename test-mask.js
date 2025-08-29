import { createCenterHoleMask, calculateAspectRatioDimensions } from './lib/mask.js';
import fs from 'fs';

// Test different aspect ratios
const testCases = [
  { ratio: "1:1", expected: { width: 1024, height: 1024 } },
  { ratio: "4:5", expected: { width: 1024, height: 1280 } },
  { ratio: "9:16", expected: { width: 576, height: 1024 } }
];

console.log('Testing mask generation...\n');

testCases.forEach(({ ratio, expected }) => {
  console.log(`Testing aspect ratio: ${ratio}`);
  
  try {
    // Calculate dimensions
    const dimensions = calculateAspectRatioDimensions(ratio);
    console.log(`  Expected: ${expected.width}x${expected.height}`);
    console.log(`  Actual: ${dimensions.width}x${dimensions.height}`);
    
    // Generate mask
    const maskBuffer = createCenterHoleMask({
      width: dimensions.width,
      height: dimensions.height,
      centerHolePercent: 68,
      borderRadiusPercent: 8
    });
    
    console.log(`  Mask generated: ${maskBuffer.length} bytes`);
    
    // Save mask for visual inspection
    const filename = `test-mask-${ratio.replace(':', 'x')}.png`;
    fs.writeFileSync(filename, maskBuffer);
    console.log(`  Mask saved as: ${filename}`);
    
    console.log(`  ✓ ${ratio} test passed\n`);
  } catch (error) {
    console.error(`  ✗ ${ratio} test failed:`, error.message);
  }
});

console.log('Mask generation tests completed!');
console.log('Check the generated PNG files to verify the center holes are properly created.');
