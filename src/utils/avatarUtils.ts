// Avatar utility functions for generating random cartoon characters
export const generateRandomAvatar = (seed?: string): string => {
  // Use provided seed or generate a random one
  const avatarSeed = seed || Math.random().toString(36).substring(7);

  // Using DiceBear's bottts style for cartoon characters
  // You can also use other styles like: 'adventurer', 'avataaars', 'big-ears', 'bottts', 'croodles', 'fun-emoji', 'micah', 'miniavs', 'personas'
  const style = "bottts";

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

export const generateAvatarFromUsername = (username: string): string => {
  // Use username as seed for consistent avatars per user
  return generateRandomAvatar(username);
};
