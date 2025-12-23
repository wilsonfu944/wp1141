import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const HASHTAG_REGEX = /#\w+/g;
const MENTION_REGEX = /@\w+/g;

/**
 * Calculate character count for post content
 * - URLs count as 23 characters each
 * - Hashtags and mentions don't count
 */
export function calculateCharCount(text: string): number {
  let count = text.length;
  
  // Subtract hashtags and mentions
  const hashtags = text.match(HASHTAG_REGEX) || [];
  const mentions = text.match(MENTION_REGEX) || [];
  
  hashtags.forEach(tag => {
    count -= tag.length;
  });
  
  mentions.forEach(mention => {
    count -= mention.length;
  });
  
  // Adjust for URLs (each URL counts as 23 chars)
  const urls = text.match(URL_REGEX) || [];
  urls.forEach(url => {
    count = count - url.length + 23;
  });
  
  return count;
}

/**
 * Convert URLs in text to clickable links
 */
export function linkifyText(text: string): string {
  return text.replace(URL_REGEX, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });
}

/**
 * Validate userID format
 * - 3-15 characters
 * - Alphanumeric and underscore only
 */
export function validateUserId(userId: string): boolean {
  const regex = /^[a-zA-Z0-9_]{3,15}$/;
  return regex.test(userId);
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}d`;
  } else {
    // Format as "Oct 23" or "Oct 23, 2023" if different year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    if (year === now.getFullYear()) {
      return `${month} ${day}`;
    } else {
      return `${month} ${day}, ${year}`;
    }
  }
}






