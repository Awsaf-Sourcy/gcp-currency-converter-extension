import {
  parseCurrencyAmount,
  formatConversion,
} from './utils/currency';

/**
 * Main class for handling currency conversion in GCP Console
 */
class GCPCurrencyConverter {
  private observer: MutationObserver | null = null;
  private processedNodes = new WeakSet<Node>();
  private originalTexts = new WeakMap<Node, string>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_DELAY = 300; // ms
  private isEnabled = false;
  private toggleButton: HTMLElement | null = null;

  constructor() {
    console.log('[GCP Currency Converter] Extension loaded');
  }

  /**
   * Initialize the extension
   */
  public init(): void {
    // Create toggle UI
    this.createToggleUI();

    // Set up observer for dynamic content
    this.setupMutationObserver();

    console.log('[GCP Currency Converter] Initialized successfully');
  }

  /**
   * Create toggle UI
   */
  private createToggleUI(): void {
    const container = document.createElement('div');
    container.id = 'gcp-currency-converter-toggle';
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: white;
      border: 2px solid #1a73e8;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-family: 'Google Sans', Arial, sans-serif;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const label = document.createElement('span');
    label.textContent = 'HKD → USD';
    label.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: #202124;
    `;

    const toggleSwitch = document.createElement('label');
    toggleSwitch.style.cssText = `
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      cursor: pointer;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.cssText = 'opacity: 0; width: 0; height: 0;';

    const slider = document.createElement('span');
    slider.style.cssText = `
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    `;

    const sliderButton = document.createElement('span');
    sliderButton.style.cssText = `
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    `;

    slider.appendChild(sliderButton);
    toggleSwitch.appendChild(checkbox);
    toggleSwitch.appendChild(slider);

    container.appendChild(label);
    container.appendChild(toggleSwitch);

    document.body.appendChild(container);
    this.toggleButton = container;

    // Single event listener for both conversion and styling
    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;

      // Update toggle styling
      if (isChecked) {
        slider.style.backgroundColor = '#1a73e8';
        sliderButton.style.transform = 'translateX(20px)';
      } else {
        slider.style.backgroundColor = '#ccc';
        sliderButton.style.transform = 'translateX(0)';
      }

      // Trigger conversion
      this.toggleConversion(isChecked);
    });
  }

  /**
   * Toggle conversion on/off
   */
  private toggleConversion(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[GCP Currency Converter] Conversion ${enabled ? 'enabled' : 'disabled'}`);

    if (enabled) {
      // Enable conversion - process the page
      this.processPage();
    } else {
      // Disable conversion - restore original values
      this.restorePage();
    }
  }

  /**
   * Process the entire page for currency values
   */
  private processPage(): void {
    this.processNode(document.body);
  }

  /**
   * Restore original values
   */
  private restorePage(): void {
    const convertedElements = document.querySelectorAll('[data-currency-converted="true"]');
    convertedElements.forEach((element) => {
      const originalText = this.originalTexts.get(element);
      if (originalText && element.parentElement) {
        const textNode = document.createTextNode(originalText);
        element.parentElement.replaceChild(textNode, element);
      }
    });

    // Clear all tracking data structures
    this.processedNodes = new WeakSet<Node>();
    this.originalTexts = new WeakMap<Node, string>();
  }

  /**
   * Process a single node and its children for currency
   */
  private processNode(node: Node): void {
    if (!this.isEnabled) {
      return;
    }

    // Skip if already processed
    if (this.processedNodes.has(node)) {
      return;
    }

    // Mark as processed
    this.processedNodes.add(node);

    // Process text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      this.processTextNode(node);
      return;
    }

    // Skip script, style, and noscript elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
        return;
      }

      // Skip elements we've already converted
      if (element.hasAttribute('data-currency-converted')) {
        return;
      }
    }

    // Process child nodes
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      this.processNode(child);
    }
  }

  /**
   * Process a text node for currency conversion
   */
  private processTextNode(node: Node): void {
    if (!this.isEnabled) {
      return;
    }

    const text = node.textContent || '';

    // Look for any $ sign (generic detection)
    if (!text.includes('$')) {
      return;
    }

    // Regular expression to match currency patterns
    // Matches: $1,234.56 or $1.23K or $1M or $1B
    // Improved pattern to handle edge cases like $0.50, $ 123
    const currencyPattern = /\$\s*[\d,]*\.?\d+[KMB]?/gi;
    const matches = Array.from(text.matchAll(currencyPattern));

    if (matches.length === 0) {
      return;
    }

    // Build new text by replacing each match
    let newText = '';
    let lastIndex = 0;
    let hasConversion = false;

    for (const match of matches) {
      const matchText = match[0];
      const matchIndex = match.index!;
      const amount = parseCurrencyAmount(matchText);

      // Add text before this match
      newText += text.substring(lastIndex, matchIndex);

      if (amount !== null && amount > 0) {
        // Add converted value
        const converted = formatConversion(amount);
        newText += converted;
        hasConversion = true;
      } else {
        // Keep original if conversion failed
        newText += matchText;
      }

      lastIndex = matchIndex + matchText.length;
    }

    // Add remaining text after last match
    newText += text.substring(lastIndex);

    // Update the DOM if conversions were made
    if (hasConversion && node.parentElement) {
      const span = document.createElement('span');
      span.textContent = newText;
      span.setAttribute('data-currency-converted', 'true');
      span.style.color = '#1a73e8'; // Google blue to indicate conversion
      span.title = 'Converted from HKD to USD';

      // Store original text for restoration (only on span)
      this.originalTexts.set(span, text);

      node.parentElement.replaceChild(span, node);
    }
  }

  /**
   * Set up MutationObserver to handle dynamically loaded content
   */
  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      // Debounce processing to avoid excessive operations
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        this.handleMutations(mutations);
        this.debounceTimer = null;
      }, this.DEBOUNCE_DELAY);
    });

    // Observe the entire document for changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * Handle mutations detected by the observer
   */
  private handleMutations(mutations: MutationRecord[]): void {
    if (!this.isEnabled) {
      return;
    }

    for (const mutation of mutations) {
      // Skip mutations to our toggle button
      if (mutation.target === this.toggleButton ||
          (mutation.target as Element)?.closest?.('#gcp-currency-converter-toggle')) {
        continue;
      }

      // Handle added nodes
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of Array.from(mutation.addedNodes)) {
          // Skip our toggle button
          if (node === this.toggleButton ||
              (node as Element)?.id === 'gcp-currency-converter-toggle') {
            continue;
          }
          this.processNode(node);
        }
      }

      // Handle text changes
      if (mutation.type === 'characterData' && mutation.target) {
        // Remove from processed set to allow reprocessing
        this.processedNodes.delete(mutation.target);
        this.processNode(mutation.target);
      }
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    // Disconnect mutation observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear debounce timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Restore original values if conversion is enabled
    if (this.isEnabled) {
      this.restorePage();
    }

    // Remove toggle button from DOM
    if (this.toggleButton && this.toggleButton.parentElement) {
      this.toggleButton.parentElement.removeChild(this.toggleButton);
      this.toggleButton = null;
    }

    // Reset state
    this.isEnabled = false;

    console.log('[GCP Currency Converter] Extension destroyed');
  }
}

// Declare global interface for TypeScript
declare global {
  interface Window {
    gcpCurrencyConverter?: GCPCurrencyConverter;
  }
}

// Initialize the extension when the DOM is ready
function initializeExtension(): void {
  // Destroy existing instance if present
  if (window.gcpCurrencyConverter) {
    window.gcpCurrencyConverter.destroy();
  }

  // Create new instance and store globally
  const converter = new GCPCurrencyConverter();
  converter.init();
  window.gcpCurrencyConverter = converter;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  // DOM is already ready
  initializeExtension();
}
