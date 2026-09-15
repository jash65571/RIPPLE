import { PRODUCT } from '../src/config/product';

if (PRODUCT.releaseMode === 'review') {
  console.log('Review mode confirmed. Public identity checks remain intentionally gated.');
} else {
  const required: Readonly<Record<string, string>> = {
    publisherName: PRODUCT.publisherName,
    supportContact: PRODUCT.supportContact,
    productionUrl: PRODUCT.productionUrl,
  };
  const missing = Object.entries(required).filter(([, value]) => value.trim() === '').map(([field]) => field);
  if (missing.length > 0) throw new Error(`Public release is missing: ${missing.join(', ')}.`);
  const origin = new URL(PRODUCT.productionUrl);
  if (origin.protocol !== 'https:') throw new Error('Public productionUrl must use HTTPS.');
  console.log('Public identity and production URL are configured.');
}
