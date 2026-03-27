export interface HeceSesSettings {
    focusEvents: ('heceleme' | 'yumusama' | 'sertlesme' | 'ses-dusmesi')[];
    wordCount: number;
    syllableHighlight: boolean; // Hece sınırlarını [ ] içinde gösterme
    multisensorySupport: boolean; // İşitsel vurgu ipucu (büyük harf vb.)
}
