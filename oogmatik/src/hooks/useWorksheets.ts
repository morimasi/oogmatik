/**
 * OOGMATIK - Worksheets API Integration Hooks
 * Custom React hooks for API communication with worksheets
 */

import { useState, useCallback, useEffect } from 'react';
import { SavedWorksheet } from '../types';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
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
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'x-user-role': userRole,
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

                const response = await fetch(`/api/worksheets?${params}`, {
                    method: 'GET',
                    headers: getAuthHeaders(userId, userRole),
                });

                const json: ApiResponse<any> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Failed to fetch worksheets');
                }

                setState({
                    data: json.data,
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                setState({
                    data: null,
                    loading: false,
                    error: {
                        message: error.message || 'Çalışma sayfaları yükleme başarısız',
                        code: 'FETCH_ERROR',
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

                const response = await fetch(`/api/worksheets?id=${worksheetId}`, {
                    method: 'GET',
                    headers: getAuthHeaders(userId, userRole),
                });

                const json: ApiResponse<SavedWorksheet> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Çalışma sayfası yükleme başarısız');
                }

                setState({
                    data: json.data || null,
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                setState({
                    data: null,
                    loading: false,
                    error: {
                        message: error.message,
                        code: 'FETCH_ERROR',
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

                const response = await fetch('/api/worksheets', {
                    method: 'POST',
                    headers: getAuthHeaders(userId, userRole),
                    body: JSON.stringify(worksheetData),
                });

                const json: ApiResponse<SavedWorksheet> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Çalışma sayfası oluşturma başarısız');
                }

                setState({
                    data: json.data || null,
                    loading: false,
                    error: null,
                });

                return json.data;
            } catch (error: any) {
                const errorState = {
                    message: error.message,
                    code: 'CREATE_ERROR',
                };
                setState({
                    data: null,
                    loading: false,
                    error: errorState,
                });
                throw errorState;
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

                const response = await fetch(`/api/worksheets?id=${worksheetId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(userId, userRole),
                    body: JSON.stringify(updateData),
                });

                const json: ApiResponse<SavedWorksheet> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Çalışma sayfası güncelleme başarısız');
                }

                setState({
                    data: json.data || null,
                    loading: false,
                    error: null,
                });

                return json.data;
            } catch (error: any) {
                const errorState = {
                    message: error.message,
                    code: 'UPDATE_ERROR',
                };
                setState({
                    data: null,
                    loading: false,
                    error: errorState,
                });
                throw errorState;
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

                const response = await fetch(`/api/worksheets?id=${worksheetId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(userId, userRole),
                });

                const json: ApiResponse<void> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Çalışma sayfası silme başarısız');
                }

                setState({ loading: false, error: null });
                return true;
            } catch (error: any) {
                const errorState = {
                    message: error.message,
                    code: 'DELETE_ERROR',
                };
                setState({
                    loading: false,
                    error: errorState,
                });
                throw errorState;
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

                const response = await fetch(`/api/worksheets?id=${worksheetId}&share=true`, {
                    method: 'POST',
                    headers: getAuthHeaders(userId, userRole),
                    body: JSON.stringify({ recipientId, ownerName }),
                });

                const json: ApiResponse<void> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Çalışma paylaşma başarısız');
                }

                setState({ loading: false, error: null });
                return true;
            } catch (error: any) {
                const errorState = {
                    message: error.message,
                    code: 'SHARE_ERROR',
                };
                setState({
                    loading: false,
                    error: errorState,
                });
                throw errorState;
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

                const response = await fetch(`/api/worksheets/shared/with-me?${params}`, {
                    method: 'GET',
                    headers: getAuthHeaders(userId, userRole),
                });

                const json: ApiResponse<any> = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error?.message || 'Paylaşılan çalışmalar yükleme başarısız');
                }

                setState({
                    data: json.data,
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                setState({
                    data: null,
                    loading: false,
                    error: {
                        message: error.message,
                        code: 'FETCH_ERROR',
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
