export const HOTEL_FALLBACK_IMAGES: string[] = [
  "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/562015580.webp?k=ecaa152c1ee54ca77e23b1bd214238cbc9db80a5aad364c8fbce1f3fe554eaa3&o=",
  "https://media-cdn.tripadvisor.com/media/photo-s/2c/34/cf/7e/tower-building-the-palace.jpg",
  "https://www.thedailystar.net/sites/default/files/styles/big_1/public/images/2024/07/31/luxury-hotels-in-dhaka.jpg",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/370564672.jpg?k=4f37af06c05a6f5dfc7db5e8e71d2eb66cae6eec36af7a4a4cd7a25d65ceb941&o=",
];

export const ROOM_FALLBACK_IMAGES: string[] = [
  "https://s3.amazonaws.com/publichotels/36_public_lobby_bar_night-1691525232101.jpg",
  "https://www.ahotellife.com/wp-content/uploads/2021/06/Olivia-Lopez-publichotels-les8.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBt1lkh8a6PEvfzvVk1pW9UilWFzR72eETh1Wj0ZHtkT7wFh66uXteqwNE&s=10",
  "https://www.uniqhotels.com/media/cache/53/1c/531ce6848a173cef00d04620bc4aeaa0.jpg",
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickImage(images: string[], seed: string): string {
  return images[hashSeed(seed) % images.length];
}

export function hotelFallbackImage(hotelId: string): string {
  return pickImage(HOTEL_FALLBACK_IMAGES, hotelId);
}

export function roomFallbackImage(roomId: string): string {
  return pickImage(ROOM_FALLBACK_IMAGES, roomId);
}
