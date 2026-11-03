// Free Pexels stock photos (pexels.com), checked by hand.
// Replace with the client's own photos before going live.
export function pexelsUrl(photoId: string, width = 900) {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}
