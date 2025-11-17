# Testing Guide for GCP Currency Converter Extension

This guide will help you test the browser extension locally.

## Prerequisites

- Chrome, Edge, or another Chromium-based browser
- Access to Google Cloud Platform Console (or ability to create test HTML pages)

## Installation Steps

1. **Build the extension** (if not already built):
   ```bash
   npm run build
   ```

2. **Load the extension in your browser**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project
   - The extension should now appear in your extensions list

## Test Cases

### Test 1: Basic Currency Detection

**Create a test HTML file** to verify the extension works:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Currency Converter Test</title>
</head>
<body>
    <h1>Test Page for GCP Currency Converter</h1>

    <div>
        <h2>Test Cases:</h2>
        <ul>
            <li>Price: HK$100.00</li>
            <li>Cost: HK$1,234.56</li>
            <li>Amount: 999.99 HKD</li>
            <li>Total: HKD 5,000.00</li>
            <li>Budget: HK$10,000</li>
        </ul>
    </div>

    <div id="dynamic-content">
        <h2>Dynamic Content (will be added via JavaScript):</h2>
    </div>

    <script>
        // Test dynamic content loading
        setTimeout(() => {
            const div = document.getElementById('dynamic-content');
            const p = document.createElement('p');
            p.textContent = 'Dynamically added: HK$2,500.75';
            div.appendChild(p);
        }, 2000);
    </script>
</body>
</html>
```

**Save this as `test.html` and open it in your browser.**

**Expected Results:**
- All HKD amounts should be converted to USD
- Converted values should appear in blue text
- Format should be: `$XX.XX USD (was HK$YY.YY)`
- Hovering shows tooltip: "Converted from HKD to USD"
- Dynamically added content (after 2 seconds) should also be converted

### Test 2: Conversion Rate Verification

Using the static rate of `1 HKD = 0.128 USD`:

| Original HKD | Expected USD |
|--------------|--------------|
| HK$100.00    | $12.80 USD   |
| HK$1,234.56  | $158.02 USD  |
| HK$10,000    | $1,280.00 USD|

### Test 3: GCP Console Testing

1. Navigate to `https://console.cloud.google.com/`
2. Go to the Billing section (if you have access)
3. Look for any HKD currency values
4. Verify they are converted to USD automatically

### Test 4: Performance Testing

1. Open DevTools (F12)
2. Go to the Console tab
3. Look for messages: `[GCP Currency Converter] Extension loaded` and `[GCP Currency Converter] Initialized successfully`
4. Check the Performance tab to ensure no significant performance impact

### Test 5: Multiple Formats

The extension should handle these HKD formats:
- `HK$123.45`
- `HKD 123.45`
- `123.45 HKD`
- `HK$1,234,567.89` (with commas)

### Test 6: Edge Cases

Test these scenarios:
- Very small amounts: `HK$0.01` → `$0.00 USD`
- Very large amounts: `HK$1,000,000` → `$128,000.00 USD`
- Zero: `HK$0.00` → Should not convert (amount > 0 check)
- Invalid formats: `HKD` (no number) → Should not convert

## Debugging

### Check Extension Status

1. Go to `chrome://extensions/`
2. Find "GCP Currency Converter"
3. Ensure it's enabled
4. Click "Details" to see permissions and status

### View Console Logs

1. Open DevTools (F12) on any GCP Console page
2. Go to Console tab
3. Filter for `GCP Currency Converter`
4. Look for initialization and conversion messages

### Common Issues

**Extension not working:**
- Verify it's enabled in `chrome://extensions/`
- Check you're on a page with HKD currency
- Refresh the page after loading the extension

**Conversions not appearing:**
- Open DevTools Console and check for errors
- Verify the page contains text matching HKD patterns
- Check if the extension has proper permissions

**Performance issues:**
- Check if debouncing is working (300ms delay)
- Look for excessive MutationObserver calls in Performance tab

## Validation with Zod

The extension uses Zod for runtime validation. Check the console for any Zod validation errors:

```
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    ...
  }
]
```

If you see Zod errors, this indicates a type mismatch in the data being processed.

## Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Static content with HKD is converted
- [ ] Dynamic content is converted (MutationObserver working)
- [ ] Conversion rate is correct
- [ ] Visual styling (blue text) is applied
- [ ] Tooltips appear on hover
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Works on actual GCP Console pages
- [ ] Bundle size warnings are acceptable (~471KB)

## Reporting Issues

If you find bugs:

1. Open DevTools Console (F12)
2. Copy any error messages
3. Note the URL where the issue occurred
4. Describe the expected vs actual behavior
5. Include screenshots if helpful

## Next Steps

After successful testing, you can:

1. Create better icons using `./generate-icons.sh`
2. Adjust the conversion rate in `src/utils/currency.ts`
3. Add support for more currency pairs
4. Implement live conversion rates via API
5. Add user preferences and settings popup
