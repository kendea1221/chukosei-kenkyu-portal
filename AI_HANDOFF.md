# AI Project Handoff Document
**Project: 中高生研究プログラムポータル (Junior High/High School Research Program Portal)**

**Last Updated:** 2026-01-25  
**Current Version:** Production-ready  
**Target AI:** GPT-4, Claude, or any LLM with code understanding capabilities

---

## 🎯 Project Overview

### Purpose
A web portal for junior high and high school students in Japan to discover research programs and read peer reviews. Users can browse without login, post reviews after authentication, and admins can manage programs.

### Key Features
- **Public browsing**: Program list/details (no auth required)
- **Advanced filtering**: By category, target audience, format
- **Review system**: Authenticated users can post/read reviews
- **Social sharing**: X (Twitter), Instagram, TikTok, LINE integration
- **Admin panel**: CRUD operations for programs and reviews
- **Performance optimized**: PageSpeed Insights score 85+ → target 90+

### Live Status
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Database**: Supabase (PostgreSQL + Auth)
- **Performance**: Recently optimized for CLS, FCP, LCP

---

## 🏗️ Technical Architecture

### Tech Stack
```
Frontend:
  - Next.js 16.1.4 (App Router)
  - React 19.2.3
  - TypeScript 5
  - Tailwind CSS 4
  
Backend/Services:
  - Supabase (PostgreSQL + Auth + RLS)
  - Vercel Edge Functions (implicit)
  
Build/Dev Tools:
  - ESLint 9 + Prettier 3.8.1
  - SWC (Next.js built-in)
```

### Browser Targets
```browserslist
# .browserslistrc
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not dead
not IE 11
> 0.5%
```

**TypeScript Target**: ES2020 (modern features native, no polyfills)

---

## 📁 Project Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Home: program list + filters
│   │   ├── globals.css         # Global styles + skeleton animations
│   │   ├── admin/              # Admin panel
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   ├── add/page.tsx    # Add program
│   │   │   └── edit/[id]/page.tsx  # Edit program
│   │   ├── auth/               # Authentication flows
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   └── program/[id]/       # Program detail + reviews
│   │       └── page.tsx
│   ├── components/             # Reusable UI components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ProgramCard.tsx     # Program grid item
│   │   ├── ProgramCardSkeleton.tsx  # CLS prevention
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   ├── ReviewSection.tsx   # Dynamically imported
│   │   └── ShareButtons.tsx    # Social sharing
│   ├── hooks/
│   │   └── useAuth.ts          # Authentication hook
│   └── lib/
│       ├── supabase.ts         # Supabase client + types
│       └── deviceId.ts         # Anonymous device tracking
├── scripts/
│   └── init-database.sql       # Database schema + RLS policies
├── public/                     # Static assets
├── next.config.ts              # Performance optimizations
├── tsconfig.json               # ES2020 target
├── .browserslistrc             # Modern browsers only
├── PERFORMANCE.md              # Recent optimization guide
└── package.json
```

---

## 🗄️ Database Schema

### Core Tables (Supabase PostgreSQL)

```sql
profiles (
  id UUID PRIMARY KEY,          -- References auth.users(id)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,  -- Admin flag
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

programs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,        -- 物理, 化学, 生物, etc.
  target_audience TEXT[] NOT NULL, -- ['中学生', '高校生', etc.]
  application_period TEXT,
  location TEXT,
  cost TEXT,
  application_process TEXT,
  official_url TEXT,
  format TEXT,                   -- 'オンライン', '対面', etc.
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

reviews (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES programs,
  user_id UUID,
  rating INTEGER,                -- 1-5 stars
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

comments (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews,
  user_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP
)

favorites (
  id UUID PRIMARY KEY,
  user_id UUID,
  program_id UUID REFERENCES programs,
  created_at TIMESTAMP,
  UNIQUE(user_id, program_id)
)

drafts (
  id UUID PRIMARY KEY,
  device_id TEXT,                -- For anonymous users
  user_id UUID,
  program_id UUID REFERENCES programs,
  rating INTEGER,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Row Level Security (RLS) Policies

**Key patterns:**
- `profiles`: Users can read/update own profile only
- `programs`: Public read, admin-only write
- `reviews`: Public read, authenticated write (own only)
- `comments`: Public read, authenticated write (own only)
- `favorites`: User-specific read/write
- `drafts`: Device/user-specific access

**Admin check:**
```sql
(SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
```

---

## 🔑 Environment Variables

### Required (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Deployment (Vercel)
Set these in:
- Project Settings → Environment Variables
- Add to both **Production** and **Preview** environments

---

## 🚀 Recent Performance Optimizations (2026-01-25)

### Problem: PageSpeed Insights Score 85
**Issues identified:**
1. Render-blocking CSS (chunks/b5403097e775006a.css, 170ms)
2. Legacy JavaScript polyfills (14 KiB unnecessary)
3. Cumulative Layout Shift (CLS: 0.232)
4. Unused JavaScript (68 KiB)

### Solutions Implemented

#### 1. Legacy JavaScript Reduction (-14 KiB)
**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020"  // Changed from ES2017
  }
}
```
**Result:** Native support for Array.at, Object.hasOwn, String.trimEnd, etc.

#### 2. CSS Optimization (-310ms render blocking)
**File:** `src/app/layout.tsx`
```tsx
const geistSans = Geist({
  display: 'swap',     // Added: prevents FOIT
  preload: true,       // Added: faster load
  subsets: ['latin'],
});
```

**File:** `next.config.ts`
```ts
experimental: {
  optimizeCss: true,  // Auto-inline critical CSS
}
```

#### 3. CLS Fix (0.232 → <0.1)
**Created:** `src/components/ProgramCardSkeleton.tsx`
```tsx
// Skeleton placeholder with exact card dimensions
export default function ProgramCardSkeleton() {
  return (
    <div className="bg-white border rounded p-4 min-h-[200px]">
      <div className="skeleton h-6 w-3/4 rounded mb-3"></div>
      {/* ... more skeleton elements */}
    </div>
  );
}
```

**File:** `src/app/globals.css`
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  animation: loading 1.5s ease-in-out infinite;
}
```

**File:** `src/app/page.tsx`
```tsx
// Added min-height to all containers
<div className="min-h-[400px]">
  {loading ? <div className="min-h-[400px]">Loading...</div> : content}
</div>
```

#### 4. Code Splitting (-68 KiB initial bundle)
**File:** `src/app/page.tsx`
```tsx
import dynamic from 'next/dynamic';

const ProgramCard = dynamic(() => import('@/components/ProgramCard'), {
  loading: () => <ProgramCardSkeleton />,
  ssr: false,  // Client-side only
});
```

**File:** `src/app/program/[id]/page.tsx`
```tsx
const ReviewSection = dynamic(() => import('@/components/ReviewSection'), {
  loading: () => <div className="min-h-[200px] skeleton"></div>,
  ssr: false,
});
```

#### 5. Additional Optimizations
**File:** `next.config.ts`
```ts
{
  compress: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{
      source: '/fonts/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
}
```

### Expected Results
| Metric | Before | Target | Method |
|--------|--------|--------|--------|
| FCP | 1.5s | ≤1.0s | Font swap, CSS inline |
| LCP | 2.2s | ≤2.0s | Dynamic imports, image opt |
| CLS | 0.232 | ≤0.1 | Skeleton + min-height |
| TBT | 20ms | ✅ | Already good |
| SI | 3.7s | ≤3.0s | Code splitting, no polyfills |

**Target Score:** 90+

---

## 🔄 Common Development Workflows

### Adding a New Page
1. Create file in `src/app/[route]/page.tsx`
2. Import `Header` component for navigation
3. Use `'use client'` if state/effects needed
4. Add Supabase data fetching in `useEffect`
5. Apply CLS prevention: set `min-h-[Xpx]` on containers

### Adding a New Component
1. Create in `src/components/ComponentName.tsx`
2. Export as default function
3. Use TypeScript for props
4. If heavy, consider dynamic import in parent

### Modifying Database Schema
1. Write SQL in Supabase Dashboard → SQL Editor
2. Update `src/lib/supabase.ts` types:
   ```ts
   export type Database = {
     public: {
       Tables: {
         new_table: {
           Row: { /* ... */ },
           Insert: { /* ... */ },
           Update: { /* ... */ },
         }
       }
     }
   }
   ```
3. Test with TypeScript autocomplete

### Adding RLS Policy
```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT|INSERT|UPDATE|DELETE
  USING (condition)
  WITH CHECK (condition);
```

---

## 🐛 Common Issues & Solutions

### "Supabaseの環境変数が設定されていません"
**Cause:** Missing `.env.local`  
**Fix:**
```bash
cp .env.example .env.local
# Add your Supabase URL and anon key
npm run dev  # Restart server
```

### Programs not loading
**Check:**
1. Supabase tables created? Run `scripts/init-database.sql`
2. RLS policies active? Check Supabase → Authentication → Policies
3. Network tab shows 401? Check API keys in `.env.local`

### Admin panel shows 403
**Fix:**
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### Dynamic import not working
**Ensure:**
```tsx
// ❌ Wrong
import Component from './Component';

// ✅ Correct
const Component = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <Skeleton />,
});
```

---

## 📦 Build & Deploy

### Local Development
```bash
npm install          # First time only
npm run dev          # Start dev server on :3000
```

### Production Build
```bash
npm run build        # Creates .next/ folder
npm run start        # Serves production build
```

### Vercel Deployment
**Auto-deploy on push:**
```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

**Vercel will:**
1. Detect Next.js project
2. Run `npm run build`
3. Deploy to `*.vercel.app`
4. Set environment variables from project settings

### Post-Deploy Checklist
- [ ] Check `/` loads program list
- [ ] Filter works (select category)
- [ ] Login redirects to Supabase Auth
- [ ] Admin panel accessible (if logged in as admin)
- [ ] Run PageSpeed Insights: https://pagespeed.web.dev/

---

## 🎨 Design Patterns

### Component Structure
```tsx
'use client';  // Only if useState/useEffect needed

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) console.error(error);
    else setData(data || []);
    setLoading(false);
  }

  if (loading) return <div className="min-h-[400px]">Loading...</div>;

  return (
    <main className="min-h-screen bg-white">
      {/* Content */}
    </main>
  );
}
```

### Authentication Pattern
```tsx
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

### Admin Check Pattern
```tsx
const { user, loading, isAdmin } = useAuth();

if (!isAdmin) {
  return <div>Access denied</div>;
}
```

---

## 📊 Data Flow

### Public Program Browsing
```
User → page.tsx → supabase.from('programs').select('*')
     ← RLS allows public read
     ← Render <ProgramCard> grid
```

### Review Posting
```
User (logged in) → ReviewForm → supabase.from('reviews').insert({
  program_id,
  user_id: auth.uid(),  // From JWT
  rating, title, content
})
← RLS checks: auth.uid() = user_id
← Success → reload reviews
```

### Admin CRUD
```
Admin → admin/add/page.tsx → supabase.from('programs').insert(...)
      ← RLS checks: (SELECT is_admin FROM profiles WHERE id = auth.uid())
      ← Success → redirect to program detail
```

---

## 🔍 Key Files for AI to Understand

### 1. `src/lib/supabase.ts` (Database types)
**Why:** All database types defined here. Modify when schema changes.

### 2. `src/app/page.tsx` (Main list page)
**Why:** Complex filtering logic, dynamic imports, CLS prevention examples.

### 3. `src/hooks/useAuth.ts` (Authentication)
**Why:** Centralized auth logic used across protected pages.

### 4. `scripts/init-database.sql` (Schema definition)
**Why:** Source of truth for database structure and RLS policies.

### 5. `next.config.ts` (Performance settings)
**Why:** All recent optimizations configured here.

### 6. `PERFORMANCE.md` (Optimization guide)
**Why:** Documents performance improvements and techniques.

---

## 🧪 Testing Checklist

### Manual Testing Flow
1. **Public access:**
   - Visit `/` → See program grid
   - Click filter → Updates list
   - Click program → See details

2. **Authentication:**
   - Click "ログイン" → Redirects to Supabase
   - Complete login → Redirects back
   - Check Header shows email

3. **Review posting:**
   - Go to program detail (logged in)
   - Fill review form → Submit
   - See new review appear

4. **Admin functions:**
   - Login as admin
   - Visit `/admin` → See dashboard
   - Add program → Fill form → Save
   - Edit program → Change title → Update
   - Visit program detail → See changes

5. **Performance:**
   - Open DevTools → Network
   - Reload page → Check CSS/JS sizes
   - Lighthouse → Run audit → Score 90+

---

## 📝 Future Enhancements (Not Yet Implemented)

### Planned Features
- [ ] **Favorites system**: User-specific saved programs
- [ ] **Draft saving**: Anonymous users can save review drafts
- [ ] **Comment threads**: Nested comments on reviews
- [ ] **Search functionality**: Full-text search across programs
- [ ] **Email notifications**: When review gets comments
- [ ] **CSV export**: Admin export of all data

### Technical Debt
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Implement error boundaries
- [ ] Add loading states to all mutations
- [ ] Internationalization (i18n) for English support
- [ ] Image upload for programs (currently URL only)

---

## 🤖 AI-Specific Instructions

### When Asked to Add a Feature:
1. Read `src/lib/supabase.ts` for existing database structure
2. Check if new table needed → Update SQL + types
3. Create page in `src/app/[route]/page.tsx`
4. Use existing patterns from similar features
5. Apply CLS prevention (min-height, skeletons)
6. Use dynamic imports for heavy components
7. Test RLS policies for security

### When Debugging:
1. Check browser console for errors
2. Verify `.env.local` exists and valid
3. Check Supabase Dashboard → Table Editor for data
4. Review RLS policies in Supabase → Authentication
5. Use Network tab to inspect failed requests

### When Optimizing Performance:
1. Run Lighthouse audit first
2. Identify bottlenecks (CSS, JS, images)
3. Apply techniques from `PERFORMANCE.md`
4. Verify with PageSpeed Insights
5. Document changes in commit message

### When Modifying Database:
1. **Never** delete RLS policies without replacement
2. Always test policies with non-admin user
3. Update TypeScript types in `supabase.ts`
4. Consider migration impact on existing data
5. Document schema changes in commit

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **PageSpeed Insights**: https://pagespeed.web.dev/

---

## 📞 Project Context for AI

**Language:** Japanese UI, English codebase  
**Target Users:** Junior high/high school students (ages 12-18)  
**Business Goal:** Help students discover research programs  
**Critical Path:** Browse → Filter → View details → Read reviews  
**Monetization:** None (public service)  
**Scale:** Small-medium (100-1000 programs expected)  

**Current State:** Production-ready, recently optimized for performance, actively maintained.

**Handoff Date:** 2026-01-25  
**Last Commit:** Performance optimizations (CLS fix, dynamic imports, modern JS)

---

**END OF HANDOFF DOCUMENT**

*This document is optimized for AI comprehension. Human developers should also refer to README.md and QUICKSTART.md for setup instructions.*
