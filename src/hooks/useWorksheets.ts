/**
 * OOGMATIK - Worksheets Hook
 * Frontend synchronization with API using safeFetch for robustness
 */

import { useState, useEffect, useCallback } from 'react';
import { SavedWorksheet } from '../types.js';
import { AppError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';
import { safeFetch } from '../utils/apiClient.js';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { message: string; code: string };
    message?: string;
    timestamp?: string;
}

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: { message: string; code: string } | null;
}

interface UseWorksheetsOptions {
    userId: string;
    userRole: 'admin' | 'teacher' | 'parent' | 'student';
    page?: number;
    pageSize?: number;
    categoryId?: string;
}

/**
 * Get authorization headers for API calls
 */
export const getAuthHeaders = (userId: string, userRole: string) => ({
    'x-user-id': userId,
    'x-user-role': userRole,
    'x-user-tier': 'pro', // Default to pro for now to avoid strict limits during testing
});

/**
 * Hook: Fetch user's worksheets with pagination
 */
export const useGetUserWorksheets = ({
    userId,
    userRole,
    page = 0,
    pageSize = 20,
    categoryId,
}: UseWorksheetsOptions) => {
    const [state, setState] = useState<ApiState<{ items: SavedWorksheet[]; count: number; page: number; pageSize: number }>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchWorksheets = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const params = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                    ...(categoryId && { categoryId }),
                });

                const result = await safeFetch<ApiResponse<{ items: SavedWorksheet[]; count: number; page: number; pageSize: number }>>(
                    `/api/worksheets?${params}`, 
                    {
                        method: 'GET',
                        headers: getAuthHeaders(userId, userRole),
                    }
                );

                setState({
                    data: result.data,
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                logError('useGetUserWorksheets error', error);
                setState({
                    data: null,
                    loading: false,
                    error: {
                        message: error.userMessage || error.message || 'Çalışma sayfaları yükleme başarısız',
                        code: error.code || 'FETCH_ERROR',
                    },
                });
            }
        };

        if (userId) {
            fetchWorksheets();
        }
    }, [userId, userRole, page, pageSize, categoryId]);

    return state;
};

/**
 * Hook: Fetch single worksheet by ID
 */
export const useGetWorksheet = (
    worksheetId: string,
    userId: string,
    userRole: string
) => {
    const [state, setState] = useState<ApiState<SavedWorksheet>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchWorksheet = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const result = await safeFetch<ApiResponse<SavedWorksheet>>(`/api/worksheets?id=${worksheetId}`, {
                    method: 'GET',
                    headers: getAuthHeaders(userId, userRole),
                });

                setState({
                    data: result.data || null,
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                logError('useGetWorksheet error', error);
                setState({
                    data: null,
                    loading: false,
                    error: {
                        message: error.userMessage || error.message,
                        code: error.code || 'FETCH_ERROR',
                    },
                });
            }
        };

        if (worksheetId && userId) {
            fetchWorksheet();
        }
    }, [worksheetId, userId, userRole]);

    return state;
};

/**
 * Hook: Create new worksheet
 */
export const useCreateWorksheet = (userId: string, userRole: string) => {
    const [state, setState] = useState<ApiState<SavedWorksheet>>({
        data: null,
        loading: false,
        error: null,
    });

    const createWorksheet = useCallback(
        async (worksheetData: Partial<SavedWorksheet>) => {
            try {
                setState({ data: null, loading: true, error: null });

                const result = await safeFetch<ApiResponse<SavedWorksheet>>('/api/worksheets', {
                    method: 'POST',
                    headers: getAuthHeaders(userId, userRole),
                    body: JSON.stringify(worksheetData),
                });

                setState({
                    data: result.data || null,
                    loading: false,
                    error: null,
                });

                return result.data;
            } catch (error: any) {
                logError('useCreateWorksheet error', error);
                const errorState = {
                    message: error.userMessage || error.message,
                    code: error.code || 'CREATE_ERROR',
                };
                setState({
                    data: null,
                    loading: false,
                    error: errorState,
                });
                throw error;
            }
        },
        [userId, userRole]
    );

    return { ...state, createWorksheet };
};

/**
 * Hook: Update worksheet
 */
export const useUpdateWorksheet = (userId: string, userRole: string) => {
    const [state, setState] = useState<ApiState<SavedWorksheet>>({
        data: null,
        loading: false,
        error: null,
    });

    const updateWorksheet = useCallback(
        async (worksheetId: string, updateData: Partial<SavedWorksheet>) => {
            try {
                setState({ data: null, loading: true, error: null });

                const result = await safeFetch<ApiResponse<SavedWorksheet>>(`/api/worksheets?id=${worksheetId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(userId, userRole),
                    body: JSON.stringify(updateData),
                });

                setState({
                    data: result.data || null,
                    loading: false,
                    error: null,
                });

                return result.data;
            } catch (error: any) {
                logError('useUpdateWorksheet error', error);
                const errorState = {
                    message: error.userMessage || error.message,
                    code: error.code || 'UPDATE_ERROR',
                };
                setState({
                    data: null,
                    loading: false,
                    error: errorState,
                });
                throw error;
            }
        },
        [userId, userRole]
    );

    return { ...state, updateWorksheet };
};

/**
 * Hook: Delete worksheet
 */
export const useDeleteWorksheet = (userId: string, userRole: string) => {
    const [state, setState] = useState<{ loading: boolean; error: { message: string; code: string } | null }>({
        loading: false,
        error: null,
    });

    const deleteWorksheet = useCallback(
        async (worksheetId: string) => {
            try {
                setState({ loading: true, error: null });

                await safeFetch<ApiResponse<void>>(`/api/worksheets?id=${worksheetId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(userId, userRole),
                });

                setState({ loading: false, error: null });
                return true;
            } catch (error: any) {
                logError('useDeleteWorksheet error', error);
                const errorState = {
                    message: error.userMessage || error.message,
                    code: error.code || 'DELETE_ERROR',
                };
                setState({
                    loading: false,
                    error: errorState,
                });
                throw error;
            }
        },
        [userId, userRole]
    );

    return { ...state, deleteWorksheet };
};

/**
 * Hook: Share worksheet
 */
export const useShareWorksheet = (userId: string, userRole: string) => {
    const [state, setState] = useState<{ loading: boolean; error: { message: string; code: string } | null }>({
        loading: false,
        error: null,
    });

    const shareWorksheet = useCallback(
        async (worksheetId: string, recipientId: string, ownerName: string) => {
            try {
                setState({ loading: true, error: null });

                await safeFetch<ApiResponse<void>>(`/api/worksheets?id=${worksheetId}&share=true`, {
                    method: 'POST',
                    headers: getAuthHeaders(userId, userRole),
                    body: JSON.stringify({ recipientId, ownerName }),
                });

                setState({ loading: false, error: null });
                return true;
            } catch (error: any) {
                logError('useShareWorksheet error', error);
                const errorState = {
                    message: error.userMessage || error.message,
                    code: error.code || 'SHARE_ERROR',
                };
                setState({
                    loading: false,
                    error: errorState,
                });
                throw error;
            }
        },
        [userId, userRole]
    );

    return { ...state, shareWorksheet };
};

/**
 * Hook: Get worksheets shared with user
 */
export const useGetSharedWorksheets = ({
    userId,
    userRole,
    page = 0,
    pageSize = 20,
}: UseWorksheetsOptions) => {
    const [state, setState] = useState<ApiState<{ items: SavedWorksheet[]; count: number; page: number; pageSize: number }>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchShared = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const params = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                });

                const result = await safeFetch<ApiResponse<{ items: SavedWorksheet[]; count: number; page: number; pageSize: number }>>(
                    `/api/worksheets/shared/with-me?${params}`, 
                    {
                        method: 'GET',
                        headers: getAuthHeaders(userId, userRole),
                    }
                );

                setState({
                    data: result.data,
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                logError('useGetSharedWorksheets error', error);
                setState({
                    data: null,
                    loading: false,
                    error: {
                        message: error.userMessage || error.message,
                        code: error.code || 'FETCH_ERROR',
                    },
                });
            }
        };

        if (userId) {
            fetchShared();
        }
    }, [userId, userRole, page, pageSize]);

    return state;
};

/**
 * Export all hooks
 */
export const worksheetHooks = {
    useGetUserWorksheets,
    useGetWorksheet,
    useCreateWorksheet,
    useUpdateWorksheet,
    useDeleteWorksheet,
    useShareWorksheet,
    useGetSharedWorksheets,
    getAuthHeaders,
};
