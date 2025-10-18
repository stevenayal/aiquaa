# All Pairs - Migration to Labs

## Summary

The All Pairs Generator module has been moved from `/tools/allpairs` to `/labs/allpairs` to align with AIQUAA's organizational structure.

## Changes Made

### 1. Frontend Pages
- **From**: `apps/frontend/src/app/tools/allpairs/`
- **To**: `apps/frontend/src/app/labs/allpairs/`

### 2. API Routes
- **From**:
  - `POST /api/tools/allpairs/generate`
  - `POST /api/tools/allpairs/convert`
- **To**:
  - `POST /api/labs/allpairs/generate`
  - `POST /api/labs/allpairs/convert`

### 3. Documentation Updates
- ✅ `CLAUDE.md` - Updated location and paths
- ✅ `docs/tools/allpairs.md` - Updated API endpoints
- ✅ `docs/tools/ALLPAIRS_IMPLEMENTATION.md` - Updated all references
- ✅ `apps/frontend/e2e/allpairs.spec.ts` - Updated test paths

### 4. Code Updates
- ✅ `apps/frontend/src/app/labs/allpairs/page.tsx` - Updated API fetch URLs
- ✅ `apps/frontend/src/app/labs/allpairs/components/JsonYamlTab.tsx` - Updated API fetch URLs
- ✅ `apps/frontend/src/app/api/labs/allpairs/generate/route.ts` - Updated comments
- ✅ `apps/frontend/src/app/api/labs/allpairs/convert/route.ts` - Updated comments

## Updated File Structure

```
apps/frontend/src/
├── app/
│   ├── labs/
│   │   └── allpairs/              ← NEW LOCATION
│   │       ├── page.tsx
│   │       └── components/
│   │           ├── EditorTab.tsx
│   │           ├── JsonYamlTab.tsx
│   │           ├── ExamplesTab.tsx
│   │           ├── HelpTab.tsx
│   │           └── ResultsTable.tsx
│   │
│   └── api/
│       └── labs/
│           └── allpairs/          ← NEW API LOCATION
│               ├── generate/route.ts
│               └── convert/route.ts
```

## Access Points

### User Interface
- **Old URL**: `http://localhost:3001/tools/allpairs` ❌
- **New URL**: `http://localhost:3001/labs/allpairs` ✅

### API Endpoints
- **Old**:
  - `POST /api/tools/allpairs/generate` ❌
  - `POST /api/tools/allpairs/convert` ❌
- **New**:
  - `POST /api/labs/allpairs/generate` ✅
  - `POST /api/labs/allpairs/convert` ✅

## Testing

All tests have been updated to reflect the new location:

```bash
# E2E tests now navigate to /labs/allpairs
pnpm --filter @aiquaa/frontend e2e -- allpairs

# Unit tests remain unchanged (core package)
cd packages/allpairs-core && pnpm test:cov
```

## Migration Date

October 18, 2025

## Breaking Changes

⚠️ **For API consumers**: If you have external integrations calling the old API endpoints, update them to use the new `/api/labs/allpairs/*` paths.

## Verification Checklist

- [x] Core package builds successfully
- [x] Frontend pages moved to labs
- [x] API routes moved to labs
- [x] All internal API calls updated
- [x] E2E tests updated
- [x] Documentation updated
- [x] CLAUDE.md updated
- [x] No broken links or references

## Notes

- The core package (`@aiquaa/allpairs-core`) remains unchanged
- Example datasets in `packages/allpairs-examples` remain unchanged
- All functionality remains identical; only the URL paths have changed
- The module is now properly organized within the Labs section alongside other AIQUAA tools

## Next Steps

1. Update main Labs navigation to include All Pairs link
2. Test in development environment: `pnpm dev`
3. Verify `/labs/allpairs` is accessible
4. Run E2E tests to confirm: `pnpm e2e`
5. Deploy to production
