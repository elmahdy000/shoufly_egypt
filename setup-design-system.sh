#!/bin/bash

# 🚀 Shoofly Design System Implementation Script
# This script helps with implementing the improved UI/UX components

set -e

echo "🎨 Shoofly Design System Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

echo "✅ Project directory verified"
echo ""

# Options menu
echo "What would you like to do?"
echo "1. Check component imports"
echo "2. List all improved components"
echo "3. Verify design tokens"
echo "4. Run build test"
echo "5. Create new page with components"
echo "6. Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
  1)
    echo "📋 Checking component imports..."
    grep -r "from '@/components/ui/improved-" --include="*.tsx" --include="*.ts" app/ | head -20 || echo "No components found yet"
    ;;
  
  2)
    echo "📦 Improved Components Available:"
    ls -1 components/ui/improved-*.tsx | sed 's|components/ui/||' | sed 's|.tsx||'
    echo ""
    echo "Basic Components:"
    ls -1 components/ui/*.tsx | grep -v "improved-" | grep -v "app-" | sed 's|components/ui/||' | sed 's|.tsx||'
    ;;
  
  3)
    echo "🎨 Design Tokens Verification:"
    if [ -f "lib/design-tokens.ts" ]; then
      echo "✅ Design tokens file found"
      grep "export const" lib/design-tokens.ts | head -10
    else
      echo "❌ Design tokens file not found"
    fi
    ;;
  
  4)
    echo "🔨 Running build test..."
    npm run build 2>&1 | head -50
    ;;
  
  5)
    echo "🆕 Create new improved page"
    read -p "Enter page name (e.g., products): " pageName
    read -p "Enter page path (e.g., app/client): " pagePath
    
    mkdir -p "$pagePath/$pageName"
    
    cat > "$pagePath/$pageName/page.tsx" << 'EOF'
"use client";

import { ImprovedCard } from "@/components/ui/improved-card";
import { ImprovedButton } from "@/components/ui/improved-button";
import { ImprovedLoading } from "@/components/ui/improved-loading";
import { ImprovedAlert } from "@/components/ui/improved-alert";
import { EmptyState } from "@/components/ui/improved-card";

export default function NewPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Your content here */}
        <ImprovedCard>
          <h1 className="text-4xl font-black text-slate-900">صفحة جديدة</h1>
          <p className="text-slate-600 mt-2">ابدأ بإضافة محتواك هنا</p>
        </ImprovedCard>
      </div>
    </div>
  );
}
EOF
    
    echo "✅ Page created at $pagePath/$pageName/page.tsx"
    ;;
  
  6)
    echo "👋 Goodbye!"
    exit 0
    ;;
  
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Done!"
