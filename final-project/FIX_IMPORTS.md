# 修复导入路径指南

## 需要更新的导入模式

所有组件和 context 文件需要更新以下导入：

### 1. 添加 'use client' 指令

所有使用 React hooks 或浏览器 API 的组件需要在文件顶部添加：

```typescript
'use client';
```

### 2. 更新导入路径

#### 旧路径 → 新路径

- `import ... from '../types'` → `import ... from '@/types'`
- `import ... from '../../types'` → `import ... from '@/types'`
- `import ... from '../services/api'` → `import ... from '@/lib/api'`
- `import ... from '../../services/api'` → `import ... from '@/lib/api'`
- `import ... from '../context/...'` → `import ... from '@/context/...'`
- `import ... from '../../context/...'` → `import ... from '@/context/...'`
- `import ... from 'react-router-dom'` → `import ... from 'next/link'` 或 `import { useRouter } from 'next/navigation'`

### 3. React Router → Next.js Navigation

- `import { Link } from 'react-router-dom'` → `import Link from 'next/link'`
- `import { useNavigate } from 'react-router-dom'` → `import { useRouter } from 'next/navigation'`
- `navigate('/path')` → `router.push('/path')`

### 4. 批量更新脚本

你可以使用以下命令批量查找需要更新的文件：

```bash
# 查找所有需要更新的文件
find components context -name "*.tsx" -exec grep -l "from.*\.\./types\|from.*\.\./services\|from.*\.\./context\|react-router-dom" {} \;
```

### 5. 需要更新的文件列表

根据扫描，以下文件需要更新：

- `components/Rating/RatingDisplay.tsx`
- `components/Comment/CommentItem.tsx`
- `components/Comment/CommentForm.tsx`
- `components/Comment/CommentList.tsx`
- `components/SearchFilter/SearchBar.tsx`
- `components/SearchFilter/AnimeFilter.tsx`
- `components/Location/LocationCard.tsx`
- `components/Layout/Navbar.tsx`
- `components/Carousel/AnimeCarousel.tsx`
- `components/Anime/AnimeCard.tsx`
- `components/Itinerary/ItineraryCard.tsx`
- 以及其他所有使用相对路径导入的组件

### 6. 示例更新

**更新前：**
```typescript
import type { Location } from '../../types';
import { favoritesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
```

**更新后：**
```typescript
'use client';

import type { Location } from '@/types';
import { favoritesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
```

## 自动化更新

你可以使用 sed 或类似的工具批量更新：

```bash
# 更新 types 导入
find components context -name "*.tsx" -exec sed -i '' "s|from '../types'|from '@/types'|g" {} \;
find components context -name "*.tsx" -exec sed -i '' "s|from '../../types'|from '@/types'|g" {} \;

# 更新 api 导入
find components context -name "*.tsx" -exec sed -i '' "s|from '../services/api'|from '@/lib/api'|g" {} \;
find components context -name "*.tsx" -exec sed -i '' "s|from '../../services/api'|from '@/lib/api'|g" {} \;

# 更新 context 导入
find components context -name "*.tsx" -exec sed -i '' "s|from '../context/|from '@/context/|g" {} \;
find components context -name "*.tsx" -exec sed -i '' "s|from '../../context/|from '@/context/|g" {} \;
```

**注意：** 使用 sed 前请先备份文件，并仔细检查替换结果。

