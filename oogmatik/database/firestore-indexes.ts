/**
 * OOGMATIK - Firestore Indexes Configuration
 * Required composite indexes for optimal query performance
 */

/**
 * Firestore Indexes JSON Configuration
 * 
 * To apply these indexes:
 * 1. Copy the 'indexes' array content
 * 2. Go to Firebase Console > Firestore > Indexes
 * 3. Create composite indexes matching this configuration
 * 4. Or use Firebase CLI: firebase firestore:indexes
 */

export const FIRESTORE_INDEXES = {
    "indexes": [
        /**
         * Index 1: User Worksheets Query
         * Query: Get user's own worksheets with category filter and pagination
         * Fields: userId, sharedWith, category.id, createdAt
         */
        {
            "collectionGroup": "saved_worksheets",
            "queryScope": "COLLECTION",
            "fields": [
                {
                    "fieldPath": "userId",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "sharedWith",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "category.id",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "createdAt",
                    "order": "DESCENDING"
                }
            ]
        },

        /**
         * Index 2: Shared With Me
         * Query: Get worksheets shared with user, ordered by creation date
         * Fields: sharedWith, createdAt
         */
        {
            "collectionGroup": "saved_worksheets",
            "queryScope": "COLLECTION",
            "fields": [
                {
                    "fieldPath": "sharedWith",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "createdAt",
                    "order": "DESCENDING"
                }
            ]
        },

        /**
         * Index 3: Student Worksheets
         * Query: Get all worksheets for a student
         * Fields: studentId, createdAt
         */
        {
            "collectionGroup": "saved_worksheets",
            "queryScope": "COLLECTION",
            "fields": [
                {
                    "fieldPath": "studentId",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "createdAt",
                    "order": "DESCENDING"
                }
            ]
        },

        /**
         * Index 4: Activity Type and Date Range
         * Query: Get worksheets by activity type within date range
         * Fields: activityType, createdAt
         */
        {
            "collectionGroup": "saved_worksheets",
            "queryScope": "COLLECTION",
            "fields": [
                {
                    "fieldPath": "activityType",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "createdAt",
                    "order": "DESCENDING"
                }
            ]
        },

        /**
         * Index 5: User Activity Type
         * Query: Get user's worksheets by activity type
         * Fields: userId, activityType, createdAt
         */
        {
            "collectionGroup": "saved_worksheets",
            "queryScope": "COLLECTION",
            "fields": [
                {
                    "fieldPath": "userId",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "activityType",
                    "order": "ASCENDING"
                },
                {
                    "fieldPath": "createdAt",
                    "order": "DESCENDING"
                }
            ]
        }
    ]
};

/**
 * Query Performance Guidelines
 * 
 * Before Index:  O(n) - Full collection scan
 * After Index:   O(log n) - Binary search on index
 * 
 * Example performance improvements:
 * - 1M documents: 1000ms → 10ms
 * - 100K documents: 100ms → 1ms
 */

/**
 * Single Field Indexes (Auto-created by Firestore)
 * 
 * These don't need manual creation:
 * - saved_worksheets.userId (ascending)
 * - saved_worksheets.sharedWith (ascending)
 * - saved_worksheets.studentId (ascending)
 * - saved_worksheets.createdAt (descending)
 * - saved_worksheets.activityType (ascending)
 */

/**
 * Firestore Index Management Service
 */
export const firebaseIndexManager = {
    /**
     * Get all required indexes
     */
    getRequiredIndexes: () => {
        return FIRESTORE_INDEXES.indexes;
    },

    /**
     * Get index creation SQL equivalent (for documentation)
     */
    getIndexSql: () => {
        return `
            -- Index 1: User Worksheets with Category Filter
            CREATE INDEX idx_user_shared_category_date
            ON saved_worksheets(userId, sharedWith, category_id, createdAt DESC);

            -- Index 2: Shared With User
            CREATE INDEX idx_shared_with_date
            ON saved_worksheets(sharedWith, createdAt DESC);

            -- Index 3: Student Worksheets
            CREATE INDEX idx_student_date
            ON saved_worksheets(studentId, createdAt DESC);

            -- Index 4: Activity Type Date Range
            CREATE INDEX idx_activity_date
            ON saved_worksheets(activityType, createdAt DESC);

            -- Index 5: User Activity Type
            CREATE INDEX idx_user_activity_date
            ON saved_worksheets(userId, activityType, createdAt DESC);
        `;
    },

    /**
     * Manual index setup instructions
     */
    getSetupInstructions: () => {
        return `
        === Firestore Indexes Setup ===

        1. Using Firebase Console:
           - Go to https://console.firebase.google.com/
           - Select your project
           - Navigate to Firestore > Indexes > Composite Indexes
           - Click "Create Index"
           - Create each index from FIRESTORE_INDEXES configuration

        2. Using Firebase CLI:
           - Install: npm install -g firebase-tools
           - Run: firebase firestore:indexes
           - Deploy: firebase deploy --only firestore:indexes

        3. Using Firestore Emulator (Development):
           - The indexes are auto-created in the emulator
           - No manual setup needed

        === Index Details ===

        Index 1: User Worksheets Query
        - Collection: saved_worksheets
        - Fields: userId (↑), sharedWith (↑), category.id (↑), createdAt (↓)
        - Purpose: Fast user-specific worksheet queries with filtering

        Index 2: Shared With Me
        - Collection: saved_worksheets
        - Fields: sharedWith (↑), createdAt (↓)
        - Purpose: Get worksheets shared with specific user

        Index 3: Student Worksheets
        - Collection: saved_worksheets
        - Fields: studentId (↑), createdAt (↓)
        - Purpose: Get all worksheets for a student

        Index 4: Activity Type Date Range
        - Collection: saved_worksheets
        - Fields: activityType (↑), createdAt (↓)
        - Purpose: Filter worksheets by type with date sorting

        Index 5: User Activity Type
        - Collection: saved_worksheets
        - Fields: userId (↑), activityType (↑), createdAt (↓)
        - Purpose: Get user's worksheets filtered by type

        === Firebase CLI Setup ===

        1. Create firestore.indexes.json in project root:
        {\n  "indexes": [\n    { /* index config */ }\n  ]\n}

        2. Run: firebase deploy --only firestore:indexes

        3. Monitor deployment: firebase firestore:indexes
        `;
    },

    /**
     * Query optimization examples
     */
    getQueryExamples: () => {
        return {
            getUserWorksheets: {
                description: 'Get user worksheets with category filter',
                query: `
                    collection(db, 'saved_worksheets'),
                    where('userId', '==', userId),
                    where('sharedWith', '==', null),
                    where('category.id', '==', categoryId),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                `,
                index: 'Index 1',
                performance: 'O(log n)',
            },
            getSharedWithMe: {
                description: 'Get worksheets shared with user',
                query: `
                    collection(db, 'saved_worksheets'),
                    where('sharedWith', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                `,
                index: 'Index 2',
                performance: 'O(log n)',
            },
            getStudentWorksheets: {
                description: 'Get all worksheets for student',
                query: `
                    collection(db, 'saved_worksheets'),
                    where('studentId', '==', studentId),
                    orderBy('createdAt', 'desc')
                `,
                index: 'Index 3',
                performance: 'O(log n)',
            },
            getUserActivityWorksheets: {
                description: 'Get user worksheets of specific activity type',
                query: `
                    collection(db, 'saved_worksheets'),
                    where('userId', '==', userId),
                    where('activityType', '==', activityType),
                    orderBy('createdAt', 'desc')
                `,
                index: 'Index 5',
                performance: 'O(log n)',
            },
        };
    },
};

/**
 * Index creation checklist
 */
export const indexCreationChecklist = [
    {
        name: 'Index 1: User Worksheets Query',
        status: 'pending',
        fields: ['userId', 'sharedWith', 'category.id', 'createdAt'],
        estimatedTime: '2-5 minutes',
        note: 'Most important - used for main worksheet listing',
    },
    {
        name: 'Index 2: Shared With Me',
        status: 'pending',
        fields: ['sharedWith', 'createdAt'],
        estimatedTime: '1-2 minutes',
        note: 'Used for shared worksheet listing',
    },
    {
        name: 'Index 3: Student Worksheets',
        status: 'pending',
        fields: ['studentId', 'createdAt'],
        estimatedTime: '1-2 minutes',
        note: 'Used for student-specific worksheets',
    },
    {
        name: 'Index 4: Activity Type Date Range',
        status: 'pending',
        fields: ['activityType', 'createdAt'],
        estimatedTime: '1-2 minutes',
        note: 'Optional but improves activity filtering',
    },
    {
        name: 'Index 5: User Activity Type',
        status: 'pending',
        fields: ['userId', 'activityType', 'createdAt'],
        estimatedTime: '2-3 minutes',
        note: 'Optional but improves user activity filtering',
    },
];

/**
 * Cost estimation
 * 
 * Firestore charges for:
 * 1. Index creation: FREE
 * 2. Index storage: Depends on data size (usually <$1/month per index)
 * 3. Index writes: Counted in document writes
 * 
 * Benefits:
 * - Reduced read operations (fewer docs scanned)
 * - Better user experience (faster queries)
 * - Scalability (handles millions of docs efficiently)
 */

/**
 * Monitoring index performance
 */
export const monitorIndexPerformance = {
    /**
     * To check index stats in Firebase Console:
     * 1. Go to Firestore > Indexes > Composite Indexes
     * 2. Click on each index to see:
     *    - State (Enabled/Building)
     *    - Size (in MB)
     *    - Document count
     *    - Last updated
     */
    getMonitoringInstructions: () => {
        return `
        === Monitoring Firestore Index Performance ===

        1. Firebase Console:
           - Firestore > Indexes > Composite Indexes
           - View index state and size
           - Monitor build progress

        2. Firebase Emulator (Development):
           - Emulator automatically creates and maintains indexes
           - No performance concerns in dev

        3. Production Monitoring:
           - Google Cloud Console > Firestore > Metrics
           - Monitor query latency
           - Check index usage
           - Track storage costs

        4. Query Analytics:
           - Enable Firestore analytics to see:
             - Query execution time
             - Documents read
             - Index usage
             - Slow queries

        5. Optimization Signals:
           - Query time < 100ms: Optimal
           - Query time 100-500ms: Acceptable
           - Query time > 500ms: Needs optimization
        `;
    },
};
