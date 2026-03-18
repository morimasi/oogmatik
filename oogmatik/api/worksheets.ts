/**
 * OOGMATIK - Worksheets API
 * CRUD operations with permission validation
 * 
 * Vercel API endpoint routes:
 * POST   /api/worksheets          - createWorksheet
 * GET    /api/worksheets          - getUserWorksheets
 * GET    /api/worksheets?id=:id   - getWorksheet
 * PUT    /api/worksheets?id=:id   - updateWorksheet
 * DELETE /api/worksheets?id=:id   - deleteWorksheet
 * POST   /api/worksheets?id=:id/share - shareWorksheet
 * GET    /api/worksheets/shared/with-me - getSharedWithMe
 */

import { worksheetService } from '../services/worksheetService.js';
import { permissionService } from '../middleware/permissionValidator.js';
import { validateSaveWorksheetRequest } from '../utils/schemas.js';
import { AppError, toAppError } from '../utils/AppError.js';
import { logError } from '../utils/errorHandler.js';
import { hasPermission } from '../services/rbac.js';

type ResponseBody = {
    success?: boolean;
    error?: { message: string; code: string };
    data?: any;
    message?: string;
    timestamp?: string;
};

/**
 * Main API handler - routes requests to appropriate handler
 */
export default async function handler(req: any, res: any): Promise<void> {
    res.setHeader('Content-Type', 'application/json');

    try {
        const { method, query } = req;
        const worksheetId = query.id as string;

        // Route to appropriate handler
        if (method === 'POST' && !query.share) {
            return await createWorksheet(req, res);
        } else if (method === 'GET' && !worksheetId) {
            return await getUserWorksheets(req, res);
        } else if (method === 'GET' && worksheetId) {
            return await getWorksheet(req, res);
        } else if (method === 'PUT' && worksheetId) {
            return await updateWorksheet(req, res);
        } else if (method === 'DELETE' && worksheetId) {
            return await deleteWorksheet(req, res);
        } else if (method === 'POST' && query.share) {
            return await shareWorksheet(req, res);
        } else {
            return res.status(404).json({
                error: { message: 'Endpoint bulunamadı', code: 'NOT_FOUND' }
            });
        }
    } catch (error) {
        const appError = toAppError(error);
        return res.status(appError.httpStatus).json({
            error: { message: appError.userMessage, code: appError.code }
        });
    }
}

/**
 * POST /api/worksheets - Create worksheet
 * Permission: create:worksheet
 */
const createWorksheet = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'create:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Validate input
        const { name, activityType, data, icon, category, styleSettings, studentProfile, studentId } = req.body;

        try {
            validateSaveWorksheetRequest({
                name,
                activityType,
                worksheetData: data,
                icon,
                category,
            });
        } catch (error) {
            const appError = toAppError(error);
            return res.status(appError.httpStatus).json({
                error: {
                    message: appError.userMessage,
                    code: appError.code,
                }
            });
        }

        // 4. Save worksheet
        const worksheet = await worksheetService.saveWorksheet(
            user.userId,
            name,
            activityType,
            data,
            icon,
            category,
            styleSettings,
            studentProfile,
            studentId
        );

        return res.status(201).json({
            success: true,
            data: worksheet,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'createWorksheet API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};

/**
 * GET /api/worksheets - Get user's worksheets
 * Permission: read:worksheet
 */
const getUserWorksheets = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'read:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Parse query parameters
        const page = parseInt((req.query.page as string) || '0');
        const pageSize = parseInt((req.query.pageSize as string) || '20');
        const categoryId = req.query.categoryId as string;

        // 4. Fetch worksheets
        const result = await worksheetService.getUserWorksheets(
            user.userId,
            page,
            pageSize,
            categoryId
        );

        return res.status(200).json({
            success: true,
            data: {
                items: result.items,
                count: result.count,
                page,
                pageSize,
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'getUserWorksheets API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};

/**
 * GET /api/worksheets/:id - Get single worksheet
 * Permission: read:worksheet
 */
const getWorksheet = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'read:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Get worksheet
        const worksheetId = req.query.id as string;
        const worksheet = await worksheetService.getWorksheetById(worksheetId, user.userId);

        return res.status(200).json({
            success: true,
            data: worksheet,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'getWorksheet API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};

/**
 * PUT /api/worksheets/:id - Update worksheet
 * Permission: update:worksheet
 * Owner check: Must be worksheet owner
 */
const updateWorksheet = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'update:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Update worksheet
        const worksheetId = req.query.id as string;
        const updateData = req.body;

        const updated = await worksheetService.updateWorksheet(
            worksheetId,
            user.userId,
            updateData
        );

        return res.status(200).json({
            success: true,
            data: updated,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'updateWorksheet API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};

/**
 * DELETE /api/worksheets/:id - Delete worksheet
 * Permission: delete:worksheet
 * Owner check: Must be worksheet owner
 */
const deleteWorksheet = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'delete:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Delete worksheet
        const worksheetId = req.query.id as string;
        await worksheetService.deleteWorksheet(worksheetId, user.userId);

        return res.status(200).json({
            success: true,
            message: 'Çalışma başarıyla silindi',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'deleteWorksheet API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};

/**
 * POST /api/worksheets/:id/share - Share worksheet
 * Permission: share:worksheet
 * Owner check: Must be worksheet owner
 */
const shareWorksheet = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'share:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Share worksheet
        const worksheetId = req.query.id as string;
        const { recipientId, ownerName } = req.body;

        await worksheetService.shareWorksheet(
            worksheetId,
            user.userId,
            ownerName,
            recipientId
        );

        return res.status(200).json({
            success: true,
            message: 'Çalışma başarıyla paylaşıldı',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'shareWorksheet API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};

/**
 * GET /api/worksheets/shared/with-me - Get worksheets shared with user
 * Permission: read:worksheet
 */
const getSharedWithMe = async (req: any, res: any): Promise<void> => {
    try {
        // 1. Authenticate
        let user;
        try {
            user = permissionService.authenticate(req);
        } catch (error) {
            return res.status(401).json({
                error: { message: 'Kimlik doğrulama gereklidir', code: 'AUTH_ERROR' }
            });
        }

        // 2. Check permission
        if (!hasPermission(user.role, 'read:worksheet')) {
            return res.status(403).json({
                error: { message: 'Bu işlem için izniniz yok', code: 'PERMISSION_DENIED' }
            });
        }

        // 3. Get shared worksheets
        const page = parseInt((req.query.page as string) || '0');
        const pageSize = parseInt((req.query.pageSize as string) || '20');

        const result = await worksheetService.getSharedWithMe(user.userId, page, pageSize);

        return res.status(200).json({
            success: true,
            data: {
                items: result.items,
                count: result.count,
                page,
                pageSize,
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'getSharedWithMe API',
            path: req.url,
            method: req.method,
        });

        return res.status(appError.httpStatus).json({
            error: {
                message: appError.userMessage,
                code: appError.code,
            }
        });
    }
};
