# 🎨 Obama Morpher

A browser-based image morphing app that transforms ANY uploaded image into Barack Obama's portrait by intelligently rearranging pixels to their optimal positions.

## How It Works

The app uses a color-matching algorithm to find the mathematically optimal way to rearrange your image's pixels:

1. **Image Upload** - Your image is scaled to match Obama's dimensions
2. **Color Analysis** - Analyzes the color of every pixel in both images
3. **Optimal Mapping** - Sorts pixels by color similarity and maps each source pixel to the best target position
4. **Animated Rearrangement** - Pixels physically move from their original positions to their target positions
5. **Final Result** - Your image's pixels form Obama's portrait

The algorithm matches similar-colored pixels together (dark pixels → dark areas, bright pixels → bright areas) to create the best possible reconstruction of Obama using only your image's pixels.

## How to Use

1. Open `index.html` in a web browser (or visit http://localhost:8000)
2. Click "Upload Image" to select any image file
3. Adjust the animation speed (2-15 seconds) if desired
4. Click "Start Morph" - the app will calculate optimal pixel positions (may take a moment)
5. Watch as pixels physically move and rearrange themselves to form Obama!
6. You can manually drag the "Morph Progress" slider to scrub through the animation
7. Click "Reset" to return to your original image
8. Click "Download" to save the morphed result

## Controls

- **Morph Progress** (0-100%): Manually control the pixel rearrangement progress
  - 0% = Pixels in original positions
  - 50% = Pixels halfway to their target positions
  - 100% = Pixels fully rearranged into Obama's portrait
  - Can be adjusted during or after animation
- **Animation Speed** (2-15s): Controls how long the pixel movement animation takes
  - Shorter = faster pixel movement
  - Longer = slower, more visible particle paths
- **Start Morph**: Calculates optimal mapping and begins animated rearrangement (button shows "Calculating..." then "Stop Animation")

## Technical Details

- Pure vanilla JavaScript (no dependencies)
- Canvas API for pixel manipulation
- Greedy color-matching algorithm for optimal pixel assignment
- Luminance-based sorting with secondary hue sorting
- Position interpolation for smooth pixel movement
- 60fps animation using requestAnimationFrame
- Responsive design with modern gradient UI

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- FileReader API
- ES6+ JavaScript

## Running the App

### Quick Start
```bash
open index.html
```

### With Local Server
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Example

Upload any image (a landscape, a portrait, anything!) and watch as the pixels rearrange themselves to form Obama's face. The effect is both mesmerizing and hilarious!
