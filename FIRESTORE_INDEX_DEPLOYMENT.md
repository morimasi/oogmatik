# Firestore Index Deployment Guide

## Problem Fixed
The `getUserWorksheets` function was failing with a Firestore index error:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Solution
Updated `firestore.indexes.json` with the correct composite indexes for the application's Firestore queries.

## Required Indexes

### Index 1: User Worksheets with Category Filter (PRIMARY)
**Required for**: `getUserWorksheets()` function in `src/services/worksheetService.ts`
- Collection: `saved_worksheets`
- Fields:
  - `userId` (ASCENDING)
  - `sharedWith` (ASCENDING)
  - `category.id` (ASCENDING)
  - `createdAt` (DESCENDING)

### Index 2: Shared Worksheets
**Required for**: `getSharedWorksheets()` function
- Collection: `saved_worksheets`
- Fields:
  - `sharedWith` (ASCENDING)
  - `createdAt` (DESCENDING)

### Index 3: Student Worksheets
**Required for**: Student-specific worksheet queries
- Collection: `saved_worksheets`
- Fields:
  - `studentId` (ASCENDING)
  - `createdAt` (DESCENDING)

## Deployment Instructions

### Option 1: Automatic Deployment via Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Deploy the indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

4. **Monitor the deployment**:
   ```bash
   firebase firestore:indexes
   ```

   The indexes will be in "Building" state initially. Wait for them to reach "Enabled" state.

### Option 2: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ooggen-08916543-87358`
3. Navigate to: **Firestore Database** → **Indexes** → **Composite**
4. Click **Create Index** for each of the three indexes listed above
5. Wait for indexes to build (typically 2-5 minutes per index)

### Option 3: Use the Error Link (Quick Fix for Index 1)

If you see the error in browser console, click the provided link:
```
https://console.firebase.google.com/v1/r/project/ooggen-08916543-87358/firestore/indexes?create_composite=...
```

This will auto-populate the first index. You'll still need to manually create indexes 2 and 3.

## Verification

After deploying indexes, verify they are active:

1. **Via Firebase Console**:
   - Go to Firestore → Indexes → Composite
   - Check status is "Enabled" for all 3 indexes

2. **Via Firebase CLI**:
   ```bash
   firebase firestore:indexes
   ```

3. **Via Application Testing**:
   - Open the application
   - Navigate to ProfileView or SavedWorksheetsView
   - Check browser console for errors
   - The query should now execute without index errors

## Build Time Estimates

- Index 1 (4 fields): 2-5 minutes
- Index 2 (2 fields): 1-2 minutes
- Index 3 (2 fields): 1-2 minutes

**Total estimated time**: 4-9 minutes

## Cost Impact

- **Index Creation**: FREE
- **Index Storage**: ~$0.18/GB/month (typically <$1/month for all indexes)
- **Performance Benefit**: Queries run in O(log n) instead of O(n)
- **Read Operations Saved**: Significantly reduces document reads for filtered queries

## Troubleshooting

### If indexes fail to build:
1. Check Firestore database exists and has data
2. Verify field names match exactly (case-sensitive)
3. Check for conflicting index configurations
4. Review Firebase Console error messages

### If query still fails after index creation:
1. Wait 5-10 minutes for index propagation
2. Clear browser cache
3. Check index status is "Enabled" not "Building"
4. Verify the query in code matches the index fields exactly

## Additional Resources

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- See `src/database/firestore-indexes.ts` for complete index configuration and query examples
