import {
  isHKDCurrency,
  parseCurrencyAmount,
  formatConversion,
} from './utils/currency';

/**
 * Main class for handling currency conversion in GCP Console
 */
class GCPCurrencyConverter {
  private observer: MutationObserver | null = null;
  private processedNodes = new WeakSet<Node>();
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_DELAY = 300; // ms

  constructor() {
    console.log('[GCP Currency Converter] Extension loaded');
  }

  /**
   * Initialize the extension
   */
  public init(): void {
    // Process existing content
    this.processPage();

    // Set up observer for dynamic content
    this.setupMutationObserver();

    console.log('[GCP Currency Converter] Initialized successfully');
  }

  /**
   * Process the entire page for HKD currency values
   */
  private processPage(): void {
    this.processNode(document.body);
  }

  /**
   * Process a single node and its children for HKD currency
   */
  private processNode(node: Node): void {
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
    const text = node.textContent || '';

    // Check if text contains HKD currency
    if (!isHKDCurrency(text)) {
      return;
    }

    // Regular expression to match HKD currency patterns
    // Matches: HK$1,234.56 or 1,234.56 HKD or HKD 1,234.56
    const currencyPattern = /(?:HK\$|HKD)\s*[\d,]+\.?\d*|[\d,]+\.?\d*\s*HKD/gi;
    const matches = text.match(currencyPattern);

    if (!matches || matches.length === 0) {
      return;
    }

    // Replace each currency occurrence
    let newText = text;
    let hasConversion = false;

    for (const match of matches) {
      const amount = parseCurrencyAmount(match);

      if (amount !== null && amount > 0) {
        const converted = formatConversion(amount);
        newText = newText.replace(match, converted);
        hasConversion = true;
      }
    }

    // Update the DOM if conversions were made
    if (hasConversion && node.parentElement) {
      const span = document.createElement('span');
      span.textContent = newText;
      span.setAttribute('data-currency-converted', 'true');
      span.style.color = '#1a73e8'; // Google blue to indicate conversion
      span.title = 'Converted from HKD to USD';

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
    for (const mutation of mutations) {
      // Handle added nodes
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of Array.from(mutation.addedNodes)) {
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
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log('[GCP Currency Converter] Extension destroyed');
  }
}

// Initialize the extension when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const converter = new GCPCurrencyConverter();
    converter.init();
  });
} else {
  // DOM is already ready
  const converter = new GCPCurrencyConverter();
  converter.init();
}
