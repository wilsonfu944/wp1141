// 头像颜色选项
export const AVATAR_COLORS = [
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

/**
 * 根据名字生成头像颜色
 * 使用名字的哈希值来选择颜色，确保同一用户总是得到相同的颜色
 */
export function getAvatarColorForName(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * 生成头像 SVG 数据 URL
 */
export function generateAvatarSVG(name: string, color: string): string {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${color}" rx="50"/><text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text></svg>`;
  
  // 使用 encodeURIComponent 替代 btoa，避免浏览器兼容性问题
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * 获取用户头像 URL
 * 如果用户有自定义头像图片，使用图片；否则使用生成的头像
 */
export function getUserAvatarUrl(
  user: { name?: string; image?: string; avatarColor?: string } | null | undefined
): string {
  if (!user) return generateAvatarSVG('U', AVATAR_COLORS[0]);
  
  // 如果有自定义图片，使用图片（向后兼容）
  if (user.image) {
    return user.image;
  }
  
  // 否则使用生成的头像
  const name = user.name || 'U';
  const color = user.avatarColor || getAvatarColorForName(name);
  return generateAvatarSVG(name, color);
}

/**
 * 获取用户头像颜色
 */
export function getUserAvatarColor(
  user: { name?: string; avatarColor?: string } | null | undefined
): string {
  if (!user) return AVATAR_COLORS[0];
  return user.avatarColor || getAvatarColorForName(user.name || 'U');
}

