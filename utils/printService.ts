
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PrintOptions {
    fileName?: string;
    action: 'download' | 'print';
}

export const printService = {
    /**
     * Native Browser Print kullanarak yüksek kaliteli vektörel çıktı alır.
     * PDF indirme işlemi için şimdilik print dialog'u kullanılır (En temiz yöntem).
     * İstenirse client-side jsPDF entegrasyonu @react-pdf/renderer ile tamamen değiştirilebilir.
     */
    generatePdf: async (elementSelector: string = '.worksheet-page', title: string = "Dokuman", options: PrintOptions) => {
        // 1. Tarayıcının yazdırma iletişim kutusunu tetikle (Native Print)
        // Bu yöntem CSS @media print kurallarını kullanır ve vektörel çıktı sağlar.
        
        // UI Temizliği gereksiz, CSS @media print zaten hallediyor.
        
        // Sayfa başlığını geçici olarak değiştir (PDF adı için)
        const originalTitle = document.title;
        document.title = title;

        window.print();

        // Başlığı geri al
        document.title = originalTitle;

        // Not: 'download' aksiyonu için şu an doğrudan bir JS çözümü (jspdf) kullanmıyoruz
        // çünkü html2canvas metinleri rasterize ediyor ve bulanıklaştırıyor.
        // Kullanıcıya "PDF Olarak Kaydet" seçeneğini seçmesi gerektiği bilgisi verilebilir.
        // Eğer download zorunluysa, server-side rendering veya @react-pdf/renderer şart.
        // Şimdilik en iyi kalite için window.print() kullanıyoruz.
    }
};
