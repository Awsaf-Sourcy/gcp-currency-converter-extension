# GCP Currency Converter Extension

A browser extension that automatically converts HKD (Hong Kong Dollar) to USD (US Dollar) in the Google Cloud Platform Console.

## Features

- **Automatic Currency Detection**: Detects HKD currency values in various formats (HK$, HKD)
- **Real-time Conversion**: Converts displayed amounts using a static conversion rate
- **Dynamic Content Support**: Uses MutationObserver to handle dynamically loaded content
- **Visual Indicators**: Converted values are highlighted in blue with tooltips
- **Performance Optimized**: Debounced processing to minimize performance impact
- **TypeScript**: Full type safety and modern development experience

## Technology Stack

- **TypeScript**: Type-safe code with modern JavaScript features
- **Webpack**: Module bundling and optimization
- **Manifest V3**: Latest Chrome extension standard
- **Content Scripts**: Lightweight, non-intrusive implementation

## Project Structure

```
gcp-currency-converter-extension/
├── src/
│   ├── content.ts              # Main content script
│   ├── utils/
│   │   └── currency.ts         # Currency conversion utilities
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/
│   ├── manifest.json           # Extension manifest
│   └── icons/                  # Extension icons
├── dist/                       # Built extension (generated)
├── webpack.config.js           # Webpack configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Node.js dependencies
```

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gcp-currency-converter-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate icons (optional)**

   The extension includes placeholder icons. For better-looking icons, run:
   ```bash
   ./generate-icons.sh
   ```

   This requires either `inkscape` or ImageMagick's `convert` command. Alternatively, you can:
   - Convert the SVG manually at https://cloudconvert.com/svg-to-png
   - Use any image editor to create 16x16, 48x48, and 128x128 PNG files

4. **Build the extension**
   ```bash
   npm run build
   ```

   For development with auto-rebuild:
   ```bash
   npm run dev
   ```

### Loading in Chrome/Edge

1. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)

2. Enable "Developer mode" (toggle in top-right corner)

3. Click "Load unpacked"

4. Select the `dist` folder from this project

5. The extension is now installed and active

## Usage

1. Navigate to the Google Cloud Platform Console: https://console.cloud.google.com/

2. The extension automatically detects and converts any HKD currency values to USD

3. Converted values appear in blue with the format: `$XX.XX USD (was HK$YY.YY)`

4. Hover over converted values to see a tooltip confirming the conversion

## Configuration

### Static Conversion Rate

The current conversion rate is set in `src/utils/currency.ts`:

```typescript
export const HKD_TO_USD_RATE = 0.128;  // 1 HKD ≈ 0.128 USD
```

To update the rate, modify this value and rebuild:

```bash
npm run build
```

### Future Enhancements

Planned features for future versions:
- Live conversion rates via API
- Support for multiple currency pairs
- User-configurable conversion rates
- Popup UI for settings
- Storage of user preferences
- Reverse conversion (USD to HKD)

## Development

### Build Commands

- **Production build**: `npm run build`
- **Development build with watch**: `npm run dev`
- **Clean build artifacts**: `npm run clean`

### Code Structure

#### Content Script (`src/content.ts`)
- Main extension logic
- DOM traversal and text node processing
- MutationObserver setup for dynamic content
- Debounced mutation handling

#### Currency Utilities (`src/utils/currency.ts`)
- Conversion rate constant
- Conversion functions
- Currency parsing and formatting
- HKD detection logic

#### Type Definitions (`src/types/index.ts`)
- TypeScript interfaces for type safety
- Currency configuration types
- Conversion result types

## Browser Compatibility

- Chrome (Manifest V3 support required)
- Microsoft Edge (Chromium-based)
- Brave
- Other Chromium-based browsers

## Performance

The extension is optimized for performance:
- Processes only text nodes containing currency indicators
- Uses WeakSet to track processed nodes (prevents reprocessing)
- Debounces mutation events (300ms delay)
- Skips script, style, and already-converted elements

## Troubleshooting

### Extension not working

1. Verify the extension is enabled in `chrome://extensions/`
2. Check that you're on a GCP Console page (`console.cloud.google.com`)
3. Open DevTools Console (F12) and look for `[GCP Currency Converter]` messages
4. Try refreshing the page

### Conversions not appearing

1. Ensure the page contains HKD currency values
2. Check the console for any JavaScript errors
3. Verify the extension has proper permissions

### Icons not displaying

If you see icon errors:
1. Run `./generate-icons.sh` to create proper icons
2. Or manually create PNG files in `public/icons/` (16x16, 48x48, 128x128)
3. Rebuild the extension: `npm run build`
4. Reload the extension in Chrome

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test the extension thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### Version 1.0.0
- Initial release
- Basic HKD to USD conversion
- Static conversion rate
- Content script with MutationObserver
- TypeScript implementation
- Webpack build system
