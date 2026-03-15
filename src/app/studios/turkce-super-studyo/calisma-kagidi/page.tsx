'use client';
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { FasikulDocument } from '../../../../modules/turkce-super-studyo/pdf/FasikulDocument';
import {
  compilePersonalizedFasikul,
  CompiledFasikul,
} from '../../../../modules/turkce-super-studyo/ai/fasikulCompiler';
import { shareContent } from '../../../../modules/turkce-super-studyo/utils/shareUtils';
import { Download, Share2, Loader2, FileText, Smartphone } from 'lucide-react';
import { useTurkceSessionStore } from '../../../../modules/turkce-super-studyo/store/useTurkceSessionStore';

export default function CalismaKagidiStüdyosu() {
  const [fasikul, setFasikul] = useState<CompiledFasikul | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Oogmatik Zustand'dan gelen mock telemetry datası.
  // Gerçekte useTurkceSessionStore üzerinden alınır.
  const currentSession = useTurkceSessionStore((state) => state.currentSession);
  const studentName = 'Ali Yılmaz'; // Oogmatik Global Store'dan alınacak

  useEffect(() => {
    // Component yüklendiğinde otomatik derle
    handleCompile();
  }, []);

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const data = await compilePersonalizedFasikul({
        studentId: currentSession?.userId || 'ogrenci-1',
        recentSessions: currentSession ? [currentSession] : [],
        gradeLevel: 2, // Oogmatik Global Profil'den alınacak
      });
      setFasikul(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleShare = async () => {
    if (!fasikul) return;

    // In a real scenario, you'd upload the PDF Blob to Supabase Storage
    // and share the public CDN link via Web Share API.
    const mockPdfUrl = 'https://oogmatik.com/fasikul/ahmet-yilmaz-123.pdf';

    await shareContent(
      `${fasikul.title} - Oogmatik Çalışma Kağıdı`,
      `${studentName} için yapay zeka tarafından özel olarak hazırlanan disleksi dostu çalışma kağıdını inceleyin.`,
      mockPdfUrl
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-teal-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="text-teal-500" />
            Çalışma Kağıdı Stüdyosu
          </h1>
          <p className="text-gray-600 font-medium mt-2">
            Öğrencinin son performans verilerine göre AI tarafından derlenmiş fiziksel fasikülünüz
            hazır.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Panel: Önizleme */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-4 shadow-sm border-2 border-gray-100 flex flex-col h-full min-h-[600px] overflow-hidden">
          {isCompiling || !fasikul ? (
            <div className="flex-1 flex flex-col items-center justify-center text-teal-600">
              <Loader2 size={64} className="animate-spin mb-6" />
              <h2 className="text-2xl font-bold mb-2">Fasikül Derleniyor...</h2>
              <p className="text-gray-500 font-medium text-center px-4">
                Yapay zeka {studentName} adlı öğrencinin son okuma ve anlama hatalarını analiz edip,{' '}
                <br /> ona en uygun soruları ve okuma metnini seçerek kişiselleştirilmiş bir PDF
                üretiyor.
              </p>
            </div>
          ) : (
            <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
              {/* @react-pdf/renderer Viewer */}
              <PDFViewer width="100%" height="100%" className="rounded-2xl border-none">
                <FasikulDocument
                  studentName={studentName}
                  passage={fasikul.passage}
                  questions={fasikul.questions}
                />
              </PDFViewer>
            </div>
          )}
        </div>

        {/* Sağ Panel: Aksiyonlar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">İndir & Paylaş</h3>

            <div className="space-y-4">
              {fasikul && !isCompiling ? (
                <PDFDownloadLink
                  document={
                    <FasikulDocument
                      studentName={studentName}
                      passage={fasikul.passage}
                      questions={fasikul.questions}
                    />
                  }
                  fileName={`Oogmatik_Fasikul_${studentName.replace(/\s+/g, '_')}.pdf`}
                  className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-3"
                >
                  <Download size={24} />
                  PDF Olarak İndir
                </PDFDownloadLink>
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-gray-200 text-gray-500 rounded-2xl font-bold text-lg cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Download size={24} />
                  PDF Olarak İndir
                </button>
              )}

              <button
                onClick={handleShare}
                disabled={isCompiling || !fasikul}
                className="w-full py-4 bg-white text-indigo-700 border-2 border-indigo-200 rounded-2xl font-bold text-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Share2 size={24} />
                Veliye Gönder (WhatsApp/Mail)
              </button>
            </div>
          </div>

          <div className="bg-teal-50 rounded-3xl p-6 border-2 border-teal-100">
            <div className="flex items-center gap-3 mb-4 text-teal-800">
              <Smartphone size={24} />
              <h3 className="text-lg font-bold">Mobil Uygulama Köprüsü</h3>
            </div>
            <p className="text-teal-700 font-medium text-sm leading-relaxed mb-4">
              Öğretmenler bu sayfayı tablet veya akıllı tahtadan açtıklarında, indirdikleri bu özel
              çalışma kağıtlarını yazıcıdan alarak fiziksel bir deneyim (Hybrid Learning)
              yaratabilirler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
