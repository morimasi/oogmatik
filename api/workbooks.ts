/**
 * OOGMATIK — Workbooks API Endpoint
 *
 * Main API endpoint for workbook CRUD operations
 *
 * @route /api/workbooks
 * @methods GET, POST, PUT, DELETE
 * @version 2.0.0
 * @author Bora Demir (Yazılım Mühendisi)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { AppError, ValidationError } from '../src/utils/AppError.js';
import { logError } from '../src/utils/errorHandler.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
import {
  createWorkbook,
  getWorkbookById,
  listWorkbooks,
  updateWorkbook,
  deleteWorkbook,
  restoreWorkbook,
  duplicateWorkbook,
  getWorkbookStats,
} from '../src/services/workbook/workbookService.js';
import type {
  CreateWorkbookPayload,
  UpdateWorkbookPayload,
  WorkbookListQuery,
} from '../src/types/workbook.js';

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimiter = new RateLimiter(60 * 60 * 1000); // 1 saat cleanup interval

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createWorkbookSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  templateId: z.string().optional(),
  templateType: z.enum([
    'academic-standard',
    'dyslexia-friendly',
    'dyscalculia-support',
    'adhd-focus',
    'exam-prep',
    'skill-practice',
    'assessment-portfolio',
    'bep-aligned',
    'creative-journal',
    'progress-tracker',
    'multi-subject',
    'custom',
  ]),
  assignedStudentId: z.string().optional(),
  settings: z.object({}).passthrough().optional(),
});

const updateWorkbookSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  pages: z.array(z.object({}).passthrough()).optional(),
  settings: z.object({}).passthrough().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  category: z.string().optional(),
});

const listWorkbooksQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'archived', 'deleted']).optional(),
  templateType: z.string().optional(),
  assignedStudentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'usageCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user ID from request headers (Firebase Auth token)
 */
function getUserIdFromRequest(req: VercelRequest): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      'Kimlik doğrulama gerekli',
      'UNAUTHORIZED',
      401
    );
  }

  // TODO: Firebase Auth token verification
  // const token = authHeader.split('Bearer ')[1];
  // const decodedToken = await admin.auth().verifyIdToken(token);
  // return decodedToken.uid;

  // Stub — geliştirme için
  return 'user-123';
}

/**
 * CORS headers
 */
function setCORSHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  setCORSHeaders(res);

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // User ID
    const userId = getUserIdFromRequest(req);

    // Rate limiting (using userId and assuming 'free' tier)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
    await rateLimiter.enforceLimit(userId, 'free', 'worksheetSave', 1);

    // Route based on method
    switch (req.method) {
      case 'GET':
        return await handleGET(req, res, userId);
      case 'POST':
        return await handlePOST(req, res, userId);
      case 'PUT':
        return await handlePUT(req, res, userId);
      case 'DELETE':
        return await handleDELETE(req, res, userId);
      default:
        throw new AppError(
          'Method not allowed',
          'METHOD_NOT_ALLOWED',
          405
        );
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.httpStatus).json({
        success: false,
        error: {
          message: error.userMessage,
          code: error.code,
        },
        timestamp: new Date().toISOString(),
      });
    }

    logError(error instanceof Error ? error : new Error(String(error)));
    return res.status(500).json({
      success: false,
      error: {
        message: 'Bir hata oluştu',
        code: 'INTERNAL_SERVER_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================

async function handleGET(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
): Promise<void> {
  const { id, action } = req.query;

  // GET /api/workbooks?id=xxx — Tek workbook
  if (id && typeof id === 'string') {
    const workbook = await getWorkbookById(id, userId);
    return res.status(200).json({
      success: true,
      data: workbook,
      timestamp: new Date().toISOString(),
    });
  }

  // GET /api/workbooks?action=stats — İstatistikler
  if (action === 'stats') {
    const stats = await getWorkbookStats(userId);
    return res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  }

  // GET /api/workbooks — Liste
  const queryParams: WorkbookListQuery = {
    status: req.query.status as any,
    templateType: req.query.templateType as any,
    assignedStudentId: req.query.assignedStudentId as string,
    sortBy: req.query.sortBy as any,
    sortOrder: req.query.sortOrder as any,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  // Validation
  listWorkbooksQuerySchema.parse(queryParams);

  const result = await listWorkbooks(userId, queryParams);
  return res.status(200).json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// POST HANDLER
// ============================================================================

async function handlePOST(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
): Promise<void> {
  const { action } = req.query;

  // POST /api/workbooks?action=duplicate&id=xxx
  if (action === 'duplicate') {
    const { id, newTitle } = req.body;
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Workbook ID gerekli', { code: 'MISSING_WORKBOOK_ID' });
    }

    const duplicated = await duplicateWorkbook(id, userId, newTitle);
    return res.status(201).json({
      success: true,
      data: duplicated,
      timestamp: new Date().toISOString(),
    });
  }

  // POST /api/workbooks?action=restore&id=xxx
  if (action === 'restore') {
    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Workbook ID gerekli', { code: 'MISSING_WORKBOOK_ID' });
    }

    const restored = await restoreWorkbook(id, userId);
    return res.status(200).json({
      success: true,
      data: restored,
      timestamp: new Date().toISOString(),
    });
  }

  // POST /api/workbooks — Yeni workbook oluştur
  const payload: CreateWorkbookPayload = req.body;

  // Validation
  createWorkbookSchema.parse(payload);

  const workbook = await createWorkbook(userId, payload);
  return res.status(201).json({
    success: true,
    data: workbook,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// PUT HANDLER
// ============================================================================

async function handlePUT(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    throw new ValidationError('Workbook ID gerekli', { code: 'MISSING_WORKBOOK_ID' });
  }

  const payload: UpdateWorkbookPayload = req.body;

  // Validation
  updateWorkbookSchema.parse(payload);

  const updated = await updateWorkbook(id, userId, payload);
  return res.status(200).json({
    success: true,
    data: updated,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// DELETE HANDLER
// ============================================================================

async function handleDELETE(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    throw new ValidationError('Workbook ID gerekli', { code: 'MISSING_WORKBOOK_ID' });
  }

  await deleteWorkbook(id, userId);
  return res.status(200).json({
    success: true,
    message: 'Workbook silindi (30 gün içinde geri yüklenebilir)',
    timestamp: new Date().toISOString(),
  });
}
