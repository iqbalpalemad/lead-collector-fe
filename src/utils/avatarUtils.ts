// Avatar utility functions for generating random cartoon characters

// Available DiceBear avatar styles
export const AvatarStyle = {
  ADVENTURER: "adventurer",
  AVATAAARS: "avataaars",
  BIG_EARS: "big-ears",
  BOTTTS: "bottts",
  CROODLES: "croodles",
  FUN_EMOJI: "fun-emoji",
  MICAH: "micah",
  MINIAVS: "miniavs",
  PERSONAS: "personas",
} as const;

export type AvatarStyleType = (typeof AvatarStyle)[keyof typeof AvatarStyle];

// Background colors for light theme
const lightBackgroundColors = [
  "b6e3f4", // Light blue
  "c0aede", // Light purple
  "d1d4f9", // Lavender
  "ffd5dc", // Light pink
  "ffdfbf", // Light orange
  "a8e6cf", // Mint green
  "ffaaa5", // Coral
  "dcedc1", // Light green
  "ffd3b6", // Peach
  "ff8b94", // Salmon
  "b8e0d2", // Sage green
  "d4a5a5", // Dusty rose
  "e8f4fd", // Very light blue
  "f0f8ff", // Alice blue
  "f5f5dc", // Beige
  "fffacd", // Lemon chiffon
  "f0fff0", // Honeydew
  "fff0f5", // Lavender blush
  "faf0e6", // Linen
  "f5f5f5", // Light gray
].join(",");

// Background colors for dark theme
const darkBackgroundColors = [
  "2c3e50", // Dark blue-gray
  "34495e", // Dark slate
  "8e44ad", // Dark purple
  "2980b9", // Dark blue
  "c0392b", // Dark red
  "e67e22", // Dark orange
  "27ae60", // Dark green
  "16a085", // Dark teal
  "d35400", // Dark orange-red
  "7f8c8d", // Dark gray
  "2d3436", // Very dark gray
  "636e72", // Medium gray
  "6c5ce7", // Dark purple-blue
  "00b894", // Dark mint
  "fd79a8", // Dark pink
  "fdcb6e", // Dark yellow
  "e17055", // Dark coral
  "74b9ff", // Dark sky blue
  "a29bfe", // Dark lavender
  "55a3ff", // Dark blue
].join(",");

export const generateRandomAvatar = (
  style: AvatarStyleType = AvatarStyle.BOTTTS,
  seed?: string,
  theme: "light" | "dark" = "light"
): string => {
  // Use provided seed or generate a random one
  const avatarSeed = seed || Math.random().toString(36).substring(7);

  // Select background colors based on theme
  const backgroundColor =
    theme === "dark" ? darkBackgroundColors : lightBackgroundColors;

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${avatarSeed}&backgroundColor=${backgroundColor}`;
};

export const generateAvatarFromUsername = (
  username: string,
  style: AvatarStyleType = AvatarStyle.BOTTTS,
  theme: "light" | "dark" = "light"
): string => {
  // Use username as seed for consistent avatars per user
  return generateRandomAvatar(style, username, theme);
};
