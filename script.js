// Canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// UI Elements
const imageUpload = document.getElementById('imageUpload');
const uploadBtn = document.getElementById('uploadBtn');
const morphProgress = document.getElementById('morphProgress');
const morphValue = document.getElementById('morphValue');
const animSpeed = document.getElementById('animSpeed');
const speedValue = document.getElementById('speedValue');
const algorithm = document.getElementById('algorithm');
const morphBtn = document.getElementById('morphBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Image state
let sourceImage = null;
let targetImage = null;
let sourceImageData = null;
let targetImageData = null;
let pixelMapping = null;
let animationFrame = null;
let isAnimating = false;

// Load Obama image as target
const obamaImg = new Image();
obamaImg.crossOrigin = 'anonymous';
let obamaLoaded = false;
const statusEl = document.getElementById('status');

obamaImg.onload = () => {
    console.log('Obama target image loaded');
    obamaLoaded = true;
    if (statusEl) {
        statusEl.textContent = '✅ Ready! Upload an image to begin';
        statusEl.style.color = '#4ade80';
    }
};
obamaImg.onerror = () => {
    console.error('Failed to load Obama image');
    if (statusEl) {
        statusEl.textContent = '❌ Error loading target image';
        statusEl.style.color = '#ef4444';
    }
    alert('Error: Could not load target Obama image. Make sure President_Barack_Obama_(cropped).jpg is in the same folder.');
};
obamaImg.src = 'President_Barack_Obama_(cropped).jpg';

// Event Listeners
uploadBtn.addEventListener('click', () => imageUpload.click());
imageUpload.addEventListener('change', handleImageUpload);
morphBtn.addEventListener('click', startMorph);
resetBtn.addEventListener('click', resetImage);
downloadBtn.addEventListener('click', downloadImage);

morphProgress.addEventListener('input', (e) => {
    morphValue.textContent = e.target.value;
    if (sourceImageData && targetImageData && !isAnimating) {
        applyMorph(parseInt(e.target.value) / 100);
    }
});

animSpeed.addEventListener('input', (e) => {
    speedValue.textContent = e.target.value;
});

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }

    if (!obamaLoaded) {
        alert('Please wait for the Obama image to load first!');
        return;
    }

    console.log('Loading uploaded image:', file.name);

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            console.log('Uploaded image loaded successfully');
            sourceImage = img;
            
            // Set canvas size to match Obama image
            canvas.width = obamaImg.width;
            canvas.height = obamaImg.height;
            
            console.log('Canvas size:', canvas.width, 'x', canvas.height);
            
            // Draw source image (scaled to fit)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Store source image data
            sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            console.log('Source image data captured');
            
            // Prepare target image data (draw Obama temporarily)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(obamaImg, 0, 0);
            targetImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            console.log('Target image data captured');
            
            // Reset to source - show the uploaded image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(sourceImageData, 0, 0);
            
            // Reset morph state
            pixelMapping = null;
            morphProgress.value = 0;
            morphValue.textContent = '0';
            
            console.log('✅ Source image loaded and ready to morph!');
        };
        img.onerror = function() {
            console.error('Failed to load uploaded image');
            alert('Error loading image. Please try a different file.');
        };
        img.src = event.target.result;
    };
    reader.onerror = function() {
        console.error('Failed to read file');
        alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Reset to original image
function resetImage() {
    if (sourceImageData) {
        ctx.putImageData(sourceImageData, 0, 0);
        morphProgress.value = 0;
        morphValue.textContent = '0';
    }
}

// Start morphing process
function startMorph() {
    if (!sourceImageData || !targetImageData) {
        alert('Please upload an image first!');
        return;
    }
    
    if (isAnimating) {
        // Stop animation
        cancelAnimationFrame(animationFrame);
        isAnimating = false;
        morphBtn.textContent = 'Start Morph';
        return;
    }
    
    // Calculate optimal pixel mapping if not already done
    if (!pixelMapping) {
        console.log('Calculating optimal pixel mapping...');
        morphBtn.textContent = 'Calculating...';
        morphBtn.disabled = true;
        
        // Use setTimeout to allow UI to update
        setTimeout(() => {
            pixelMapping = calculateOptimalMapping(sourceImageData, targetImageData);
            console.log('Pixel mapping complete!');
            morphBtn.disabled = false;
            morphBtn.textContent = 'Stop Animation';
            
            // Start animated morph
            isAnimating = true;
            animateMorph();
        }, 100);
    } else {
        // Start animated morph
        isAnimating = true;
        morphBtn.textContent = 'Stop Animation';
        animateMorph();
    }
}

// Animate the morph from 0 to 100%
function animateMorph() {
    const duration = parseInt(animSpeed.value) * 1000; // Convert seconds to milliseconds
    const startTime = performance.now();
    
    function animate(currentTime) {
        if (!isAnimating) return;
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Update slider
        morphProgress.value = Math.round(progress * 100);
        morphValue.textContent = Math.round(progress * 100);
        
        // Apply morph
        applyMorph(progress);
        
        if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            morphBtn.textContent = 'Start Morph';
            console.log('Animation complete!');
        }
    }
    
    animationFrame = requestAnimationFrame(animate);
}

// Calculate optimal pixel mapping using color matching
function calculateOptimalMapping(sourceData, targetData) {
    const width = sourceData.width;
    const height = sourceData.height;
    const totalPixels = width * height;
    
    console.log(`Processing ${totalPixels} pixels...`);
    
    // Extract all source pixels with their positions and colors
    const sourcePixels = [];
    for (let i = 0; i < sourceData.data.length; i += 4) {
        const pixelIndex = i / 4;
        sourcePixels.push({
            index: pixelIndex,
            x: pixelIndex % width,
            y: Math.floor(pixelIndex / width),
            r: sourceData.data[i],
            g: sourceData.data[i + 1],
            b: sourceData.data[i + 2]
        });
    }
    
    // Extract all target pixels with their positions and colors
    const targetPixels = [];
    for (let i = 0; i < targetData.data.length; i += 4) {
        const pixelIndex = i / 4;
        targetPixels.push({
            index: pixelIndex,
            x: pixelIndex % width,
            y: Math.floor(pixelIndex / width),
            r: targetData.data[i],
            g: targetData.data[i + 1],
            b: targetData.data[i + 2]
        });
    }
    
    // Sort both by color similarity (using RGB distance)
    // This creates a greedy but fast approximation
    sourcePixels.sort((a, b) => {
        const aVal = a.r * 0.299 + a.g * 0.587 + a.b * 0.114; // luminance
        const bVal = b.r * 0.299 + b.g * 0.587 + b.b * 0.114;
        if (Math.abs(aVal - bVal) > 5) return aVal - bVal;
        // Secondary sort by hue
        return (a.r + a.g * 2 + a.b * 3) - (b.r + b.g * 2 + b.b * 3);
    });
    
    targetPixels.sort((a, b) => {
        const aVal = a.r * 0.299 + a.g * 0.587 + a.b * 0.114;
        const bVal = b.r * 0.299 + b.g * 0.587 + b.b * 0.114;
        if (Math.abs(aVal - bVal) > 5) return aVal - bVal;
        return (a.r + a.g * 2 + a.b * 3) - (b.r + b.g * 2 + b.b * 3);
    });
    
    // Create mapping: for each target position, which source pixel should go there
    const mapping = new Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
        mapping[targetPixels[i].index] = sourcePixels[i];
    }
    
    console.log('Mapping calculation complete');
    return mapping;
}

// Apply morph at given progress (0 to 1)
function applyMorph(progress) {
    if (!pixelMapping) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const newImageData = ctx.createImageData(width, height);
    const data = newImageData.data;
    
    // For each target position, get the mapped source pixel and animate it
    for (let targetIdx = 0; targetIdx < pixelMapping.length; targetIdx++) {
        const sourcePixel = pixelMapping[targetIdx];
        
        // Calculate target position
        const targetX = targetIdx % width;
        const targetY = Math.floor(targetIdx / width);
        
        // Interpolate position from source to target
        const currentX = Math.round(sourcePixel.x * (1 - progress) + targetX * progress);
        const currentY = Math.round(sourcePixel.y * (1 - progress) + targetY * progress);
        
        // Make sure we're within bounds
        if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
            const currentIdx = (currentY * width + currentX) * 4;
            
            // Place the source pixel's color at the interpolated position
            data[currentIdx] = sourcePixel.r;
            data[currentIdx + 1] = sourcePixel.g;
            data[currentIdx + 2] = sourcePixel.b;
            data[currentIdx + 3] = 255;
        }
    }
    
    ctx.putImageData(newImageData, 0, 0);
}

// Download image
function downloadImage() {
    if (!sourceImage) {
        alert('Please upload an image first!');
        return;
    }

    const link = document.createElement('a');
    link.download = 'morphed-to-obama.png';
    link.href = canvas.toDataURL();
    link.click();
}
