export const shareContent = async (
  title: string,
  text: string,
  url?: string,
  file?: File
): Promise<boolean> => {
  // If we are embedded in Oogmatik App Native Webview
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    console.log('[Share] Native Oogmatik Paylaşım Köprüsü Tetiklendi.');
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'SHARE_CONTENT',
        payload: { title, text, url },
      })
    );
    return true;
  }

  // Fallback to Web Share API
  if (navigator.share) {
    try {
      const shareData: ShareData = { title, text };
      if (url) shareData.url = url;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }

      await navigator.share(shareData);
      console.log('[Share] İçerik başarıyla paylaşıldı (Web Share API)');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[Share] Paylaşım hatası:', error);
      }
      return false;
    }
  } else {
    // Unsupported browser
    console.warn(
      '[Share] Bu tarayıcı Web Share API desteklemiyor. Alternatif kopyalama panosuna yönlendiriliyor.'
    );

    // Fallback: Copy to clipboard if text/url provided
    try {
      const copyText = `${title}\n${text}\n${url || ''}`;
      await navigator.clipboard.writeText(copyText);
      alert('Paylaşım linki panoya kopyalandı.');
      return true;
    } catch (err) {
      console.error('Panoya kopyalanamadı', err);
      return false;
    }
  }
};
