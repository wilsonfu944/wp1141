'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // 如果是前导页（首页），不显示导航栏
  if (pathname === '/') {
    return null;
  }
  
  return <Navbar />;
}

