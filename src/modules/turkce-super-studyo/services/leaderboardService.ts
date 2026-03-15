/**
 * Leaderboard & Badge Service
 * Connects the local Turkish Super Studio points to the global Oogmatik Leaderboard via Supabase/Zustand.
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
}

export const addPointsToGlobalLeaderboard = async (
  userId: string,
  points: number
): Promise<void> => {
  // In a real application, this would mutate a Supabase edge function or call a GraphQL endpoint.
  console.log(
    `[Leaderboard Service] Oogmatik Global Veritabanına +${points} Jeton eklendi. (Kullanıcı: ${userId})`
  );

  // If embedded in a React Native WebView, post the message to the bridge
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'UPDATE_OOGMATIK_SCORE',
        payload: { points },
      })
    );
  }
};

export const awardBadge = async (userId: string, badge: Badge): Promise<void> => {
  console.log(`[Leaderboard Service] Yeni Rozet Kazanıldı: ${badge.name} (${userId})`);

  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'AWARD_BADGE',
        payload: { badge },
      })
    );
  }
};
