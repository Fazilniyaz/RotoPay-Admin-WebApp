# RotaPay Architecture Documentation

## System Overview

RotaPay is a professional workforce management SaaS platform built with Next.js 14+, featuring real-time shift tracking, earnings management, and comprehensive analytics.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    RotaPay Frontend                         │
│                     (Next.js 14)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Components Layer                  │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Pages: Auth, Dashboard, Shifts, Clock, etc.    │ │  │
│  │  ├─────────────────────────────────────────────────┤ │  │
│  │  │ Components: UI, Layout, Dashboard Widgets      │ │  │
│  │  ├─────────────────────────────────────────────────┤ │  │
│  │  │ Hooks: useAuth, useMediaQuery, etc.            │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        State Management & API Layer                 │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Zustand Auth Store (user, tokens, auth state) │ │  │
│  │  ├─────────────────────────────────────────────────┤ │  │
│  │  │ Axios Instance (centralized HTTP client)       │ │  │
│  │  │  - Auto token refresh                          │ │  │
│  │  │  - Error handling & retry logic                │ │  │
│  │  │  - Request/response interceptors               │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Client-Side Infrastructure                  │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Theme System (next-themes, light/dark/system)  │ │  │
│  │  ├─────────────────────────────────────────────────┤ │  │
│  │  │ Notifications (sonner toast)                   │ │  │
│  │  ├─────────────────────────────────────────────────┤ │  │
│  │  │ Forms (react-hook-form + Zod validation)       │ │  │
│  │  ├─────────────────────────────────────────────────┤ │  │
│  │  │ Animations (Framer Motion, CSS transitions)    │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Backend REST API                          │
│  (Node.js, Python, Go, etc. - Not included)                │
├─────────────────────────────────────────────────────────────┤
│  Auth Endpoints: /api/auth/login, register, refresh, etc.  │
│  Data Endpoints: /api/shifts, employers, clock-sessions    │
│  Analytics: /api/reports, statistics                       │
│  User: /api/user/profile, settings, preferences            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  (PostgreSQL, MySQL, MongoDB, etc.)                         │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Authentication System

**Location**: `store/authStore.ts`, `hooks/useAuth.ts`, `lib/axios.ts`

**Responsibilities**:
- User login/logout state management
- Token storage and refresh
- Automatic token refresh via interceptors
- Session validation and expiration

**Flow**:
```
User Login
    ↓
POST /api/auth/login (email, password)
    ↓
Receive accessToken + refreshToken
    ↓
Store in auth store + localStorage
    ↓
Make authenticated requests with Authorization header
    ↓
On 401: Automatically refresh token
    ↓
Retry failed request with new token
```

**Key Functions**:
- `login(email, password)` - Authenticate user
- `register(email, password, displayName)` - Create account
- `refresh()` - Get new access token
- `logout()` - Clear tokens and session
- `verifyEmail(token)` - Verify email address
- `resetPassword(token, password)` - Reset user password

### 2. Centralized API Client

**Location**: `lib/axios.ts`

**Purpose**: Single source of truth for all HTTP communication

**Features**:
- Automatic token injection in headers
- Automatic token refresh on 401
- Error standardization
- Request/response logging
- Concurrent request deduplication
- Base URL configuration via env var

**Critical Implementation**:
```typescript
// Every API call MUST use this instance
import api from '@/lib/axios';

// Auto-configured with:
// - Base URL from NEXT_PUBLIC_API_URL
// - Authorization header injection
// - Token refresh interceptor
// - Error handling

const response = await api.post('/api/shifts', { data });
```

### 3. State Management

**Location**: `store/authStore.ts`

**Technology**: Zustand

**State Structure**:
```typescript
{
  user: {
    id: string;
    email: string;
    displayName: string;
    profilePicture?: string;
    emailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Actions**:
- `setUser(user)` - Update user info
- `setTokens(accessToken, refreshToken)` - Store tokens
- `clearAuth()` - Clear all auth state
- `setLoading(loading)` - Toggle loading state
- `setError(error)` - Set error message

### 4. Page Structure

#### Auth Pages (Unauthenticated)
- `/auth/login` - Email/password + Google OAuth
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Reset password with token
- `/auth/verify-email` - Email verification

#### Dashboard Pages (Authenticated)
- `/dashboard` - Main dashboard with widgets
- `/dashboard/shifts` - Shift management
- `/dashboard/clock` - Clock in/out
- `/dashboard/employers` - Employer CRUD
- `/dashboard/calendar` - Calendar view
- `/dashboard/reports` - Analytics & reports
- `/dashboard/notifications` - Notification center
- `/dashboard/settings` - User preferences

### 5. Component Hierarchy

```
Root Layout (app/layout.tsx)
  ├── Providers
  │   ├── GoogleOAuthProvider
  │   ├── ThemeProvider (next-themes)
  │   └── ToasterProvider (sonner)
  │
  ├── Auth Pages
  │   └── Centered card layout
  │
  └── Dashboard Pages
      └── DashboardLayout
          ├── DesktopSidebar (260px fixed, 1024px+)
          ├── Main Content
          │   └── Page-specific components
          └── MobileBottomNav (64px sticky, <1024px)
```

### 6. Routing & Protection

**Authentication Guard**:
- Check `authStore.isAuthenticated` on component mount
- Redirect to `/auth/login` if not authenticated
- Preserve original URL for post-login redirect

**Implementation**:
```typescript
// In authenticated pages
export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated } = authStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated]);
  
  // Render protected content
}
```

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  emailVerified: boolean;
  pinEnabled: boolean;
  createdAt: Date;
}
```

### Shift
```typescript
{
  id: string;
  userId: string;
  employerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  breakDuration: number;
  earnings: number;
  isManualEntry: boolean;
  confirmed: boolean;
  notes?: string;
}
```

### Employer
```typescript
{
  id: string;
  userId: string;
  store: string;
  employerName: string;
  hourlyPayRate: number;
  currency: string; // default: GBP
  notes?: string;
  isActive: boolean;
  createdAt: Date;
}
```

## Theme System

**Technology**: `next-themes`

**Features**:
- Light, Dark, and System (auto-detect) modes
- localStorage persistence
- Smooth transitions
- Respects OS preference on first visit

**Usage**:
```typescript
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  // Toggle cycles: light → dark → system → light
  const toggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };
}
```

**CSS Variables**:
All colors defined as CSS variables in `globals.css`:
- `--primary`, `--primary-foreground`
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`
- `--destructive`, `--success`, `--warning`

## Form Handling

**Technology**: `react-hook-form` + `Zod`

**Pattern**:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    // Call API
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## Error Handling

**Global Error Strategy**:
1. Catch errors at component level
2. Display user-friendly toast notifications
3. Log technical errors to console (dev) / monitoring (prod)
4. Retry failed requests automatically (if appropriate)

**Error Types**:
- `401 Unauthorized` - Refresh token, retry once
- `422 Validation` - Display field-level errors
- `429 Rate Limit` - Show retry message
- `5xx Server Error` - Show generic error + retry button
- Network errors - Show offline message + retry

## Performance Optimization

### Code Splitting
- Each route is automatically code-split
- Only necessary code loaded per page
- Dynamic imports for heavy components

### Caching Strategy
- Static pages: Cache at build time
- API responses: Cache in browser memory
- Images: Optimized by Next.js

### Animations
- CSS transitions for theme switching (200ms)
- Framer Motion for complex animations
- Hardware acceleration via transforms

### Bundle Analysis
```bash
pnpm build --analyze
```

## Security Considerations

### Token Management
- Access tokens: In-memory (cleared on refresh)
- Refresh tokens: localStorage (persisted)
- HTTPOnly cookies: When backend supports

### CORS Configuration
- Frontend URL: Configured on backend
- Allow credentials: true
- Allowed methods: GET, POST, PUT, DELETE, PATCH

### Input Validation
- Frontend: Zod schemas for type safety
- Backend: Always validate again (never trust client)

### Environment Variables
- Never commit secrets to git
- Use `.env.local` for local dev (gitignored)
- Use environment variable sections on Vercel

## Testing Strategy

### Unit Tests
- Test utility functions
- Test custom hooks
- Test state management

### Integration Tests
- Test form submission flows
- Test auth redirect logic
- Test API integration

### E2E Tests
- Test complete user journeys
- Test theme switching
- Test responsive layouts

### Running Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Deployment Architecture

### Local Development
- Dev server on port 3000
- Hot module replacement enabled
- Full debug logging

### Production Build
- Optimized bundle (~150KB gzipped)
- Static site generation where possible
- Minified code and CSS

### Vercel Deployment
- Automatic HTTPS
- Global CDN
- Automatic deployments on git push
- Environment variable management
- Serverless functions for API routes

## Monitoring & Observability

### Logging
- Development: Console logs with [v0] prefix
- Production: Structured logging to service

### Error Tracking
- Sentry integration (when configured)
- User session tracking
- Performance monitoring

### Metrics
- Core Web Vitals (LCP, FID, CLS)
- API response times
- Error rates
- User engagement

## Scalability Considerations

### Frontend Scaling
- Code splitting minimizes initial load
- Lazy loading for routes and components
- Image optimization for mobile
- Service worker for offline support (future)

### Backend Scaling
- Stateless design allows horizontal scaling
- Token refresh logic is idempotent
- API calls can be cached/memoized

### Database Scaling
- Indexes on frequently queried fields
- Connection pooling for performance
- Archive old data (shifts older than N years)

## Development Workflow

### Adding a New Feature

1. **Create Page**
   ```typescript
   // app/dashboard/new-feature/page.tsx
   'use client';
   
   import { DashboardLayout } from '@/components/layout/DashboardLayout';
   
   export default function NewFeaturePage() {
     return (
       <DashboardLayout>
         <div className="space-y-6">
           {/* Feature content */}
         </div>
       </DashboardLayout>
     );
   }
   ```

2. **Add Navigation Item**
   - Edit `components/layout/DesktopSidebar.tsx`
   - Edit `components/layout/MobileBottomNav.tsx`

3. **Create Components**
   - Create feature-specific components in `components/dashboard/`

4. **Connect API**
   - Add functions to `hooks/useAuth.ts` or create new hook
   - Use centralized axios instance

5. **Test**
   - Test in development
   - Check responsive design
   - Verify dark mode

### Git Workflow
```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request
# Merge after review
```

## Maintenance & Updates

### Regular Updates
```bash
# Check for outdated packages
pnpm outdated

# Update minor/patch versions
pnpm update

# Security audit
pnpm audit fix
```

### Breaking Changes
- Document migration steps
- Create release notes
- Update documentation
- Test thoroughly before deployment

---

For more details, see README.md, IMPLEMENTATION.md, and DEPLOYMENT.md
