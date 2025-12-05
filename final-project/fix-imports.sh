#!/bin/bash
# 批量修复组件导入

# 修复 react-router-dom -> next/link
find components -name "*.tsx" -exec sed -i '' 's/import { Link } from '\''react-router-dom'\''/import Link from '\''next\/link'\''/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/import { Link, useLocation } from '\''react-router-dom'\''/import Link from '\''next\/link'\''\nimport { usePathname } from '\''next\/navigation'\''/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/import { useNavigate } from '\''react-router-dom'\''/import { useRouter } from '\''next\/navigation'\''/g' {} \;

# 修复相对路径导入
find components -name "*.tsx" -exec sed -i '' "s|from '../../types'|from '@/types'|g" {} \;
find components -name "*.tsx" -exec sed -i '' "s|from '../types'|from '@/types'|g" {} \;
find components -name "*.tsx" -exec sed -i '' "s|from '../../services/api'|from '@/lib/api'|g" {} \;
find components -name "*.tsx" -exec sed -i '' "s|from '../services/api'|from '@/lib/api'|g" {} \;
find components -name "*.tsx" -exec sed -i '' "s|from '../../context/|from '@/context/|g" {} \;
find components -name "*.tsx" -exec sed -i '' "s|from '../context/|from '@/context/|g" {} \;

# 修复 Link 属性 to -> href
find components -name "*.tsx" -exec sed -i '' 's/to={`/href={`/g' {} \;
find components -name "*.tsx" -exec sed -i '' "s/to={\`/href={\`/g" {} \;

echo "修复完成！"
