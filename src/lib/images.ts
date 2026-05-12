const PRODUCT_FALLBACK = 'https://picsum.photos/seed/product/100/100';

export function resolveProductImageUrl(image?: string | null, fallback: string = PRODUCT_FALLBACK) {
  if (!image) {
    return fallback;
  }

  if (image.startsWith('data:')) {
    return image;
  }

  if (image.startsWith('http://localhost:3000/uploads/')) {
    return image.replace('http://localhost:3000', '');
  }

  if (image.startsWith('http') || image.startsWith('/uploads/')) {
    return image;
  }

  return `/uploads/${image.replace(/^\/+/, '')}`;
}
