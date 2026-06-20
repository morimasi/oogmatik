import { useState, useEffect, useCallback } from 'react';
import { SavedWorksheet } from '../../../types';
import { worksheetService } from '../../../services/worksheetService';
import { auth } from '../../../services/firebaseClient';
import { logError } from '../../../utils/logger';

export const useSharedWorksheets = () => {
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchWorksheets = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) {
            setWorksheets([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { items } = await worksheetService.getSharedWithMe(user.uid, 0, 50);
            setWorksheets(items);
            setError(null);
        } catch (err) {
            logError('Error fetching shared worksheets:', { error: err instanceof Error ? err.message : String(err) });
            setError(err instanceof Error ? err : new Error('Bilinmeyen bir hata oluştu'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorksheets();
    }, [fetchWorksheets]);

    return {
        worksheets,
        loading,
        error,
        refresh: fetchWorksheets
    };
};
