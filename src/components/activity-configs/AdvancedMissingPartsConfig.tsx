import React, { useState } from 'react';
import { GeneratorOptions } from '../../types';
import { 
  Settings, 
  Type, 
  Palette, 
  Layout, 
  Brain, 
  Eye, 
  Clock, 
  Target, 
  BookOpen, 
  Zap, 
  Award,
  Sliders,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Hash,
  Minus,
  Underline,
  List,
  Columns,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

/**
 * Eksik Parçaları Tamamlama - Ultra Gelişmiş Ayar Paneli
 * Premium SaaS kalitesinde, ultra özelleştirilebilir etkinlik ayarları
 */
export const AdvancedMissingPartsConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'visual' | 'advanced' | 'pedagogical' | 'layout'>('basic');

  const difficultyLevels = [
    { value: 'çok kolay', label: 'Başlangıç', color: 'green', description: 'Temel kelimeler, basit cümleler' },
    { value: 'kolay', label: 'Temel', color: 'blue', description: 'Günlük kelime dağarcığı' },
    { value: 'orta', label: 'Orta', color: 'yellow', description: 'Akademik kelimeler dahil' },
    { value: 'zor', label: 'İleri', color: 'orange', description: 'Karmaşık yapılar' },
    { value: 'uzman', label: 'Uzman', color: 'red', description: 'Üst düzey zorluk' }
  ];

  const blankTypes = [
    { value: 'word', label: 'Tek Kelime', icon: Type },
    { value: 'phrase', label: 'Kelime Grubu', icon: Minus },
    { value: 'sentence', label: 'Cümle', icon: AlignLeft },
    { value: 'number', label: 'Sayı', icon: Hash }
  ];

  const blankStyles = [
    { value: 'underline', label: 'Alt Çizgi', style: 'border-b-2 border-solid' },
    { value: 'dashed', label: 'Kesikli', style: 'border-b-2 border-dashed' },
    { value: 'solid', label: 'Dolu Çizgi', style: 'border-b-4 border-solid' },
    { value: 'dotted', label: 'Noktalı', style: 'border-b-2 border-dotted' }
  ];

  const BasicSettings = () => (
    <div className="space-y-6">
      {/* Tema Seçimi */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <label className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-3">
          <BookOpen className="w-4 h-4" />
          Metin Teması
        </label>
        <input
          type="text"
          value={options.topic || ''}
          onChange={(e) => onChange('topic', e.target.value)}
          placeholder="Örn: Uzay yolculuğu, Deniz altı dünyası, Tarih..."
          className="w-full p-3 bg-white border-2 border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Zorluk Seviyesi */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-4">
          <Target className="w-4 h-4" />
          Zorluk Seviyesi
        </label>
        <div className="grid grid-cols-1 gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange('difficulty', level.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                options.difficulty === level.value
                  ? `border-${level.color}-500 bg-${level.color}-50`
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900">{level.label}</span>
                <div className={`w-3 h-3 rounded-full bg-${level.color}-500`} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Boşluk Türü */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-4">
          <Type className="w-4 h-4" />
          Boşluk Türü
        </label>
        <div className="grid grid-cols-2 gap-3">
          {blankTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => onChange('blankType', type.value)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  options.blankType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Icon className="w-5 h-5 text-zinc-600" />
                <span className="text-sm font-medium text-zinc-900">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Boşluk Sayısı */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-4">
          <Hash className="w-4 h-4" />
          Boşluk Sayısı: <span className="text-blue-600">{options.blankCount || 10}</span>
        </label>
        <input
          type="range"
          min="5"
          max="25"
          value={options.blankCount || 10}
          onChange={(e) => onChange('blankCount', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>5 (Az)</span>
          <span>25 (Çok)</span>
        </div>
      </div>
    </div>
  );

  const VisualSettings = () => (
    <div className="space-y-6">
      {/* Boşluk Stili */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-4">
          <Underline className="w-4 h-4" />
          Boşluk Stili
        </label>
        <div className="grid grid-cols-2 gap-3">
          {blankStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => onChange('blankStyle', style.value)}
              className={`p-3 rounded-xl border-2 transition-all ${
                options.blankStyle === style.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="text-sm font-medium text-zinc-900 mb-2">{style.label}</div>
              <div className={`w-full h-2 ${style.style} border-zinc-400`} />
            </button>
          ))}
        </div>
      </div>

      {/* Görsel Ayarlar */}
      <div className="space-y-3">
        {[
          { key: 'compactLayout', label: 'Kompakt Düzen', icon: Layout, desc: 'A4 sayfasına maksimum içerik' },
          { key: 'syllableColoring', label: 'Hece Renklendirme', icon: Palette, desc: 'Okumayı kolaylaştırır' },
          { key: 'useIcons', label: 'Görsel İkonlar', icon: Eye, desc: 'Anlama desteği' },
          { key: 'showVisualHints', label: 'Görsel İpuçları', icon: Zap, desc: 'Zeka ipuçları' }
        ].map((setting) => {
          const Icon = setting.icon;
          return (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                  <Icon className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{setting.label}</p>
                  <p className="text-xs text-zinc-500">{setting.desc}</p>
                </div>
              </div>
              <button
                onClick={() => onChange(setting.key, !options[setting.key])}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  options[setting.key] ? 'bg-blue-500' : 'bg-zinc-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  options[setting.key] ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const AdvancedSettings = () => (
    <div className="space-y-6">
      {/* Zorluk Detayları */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
        <label className="flex items-center gap-2 text-sm font-bold text-purple-900 mb-4">
          <Brain className="w-4 h-4" />
          Zorluk Detayları
        </label>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700">Anlamsal Karmaşıklık</label>
            <select
              value={options.semanticComplexity || 'medium'}
              onChange={(e) => onChange('semanticComplexity', e.target.value)}
              className="w-full p-2 border border-zinc-200 rounded-lg text-sm"
            >
              <option value="low">Düşük (Basit anlam)</option>
              <option value="medium">Orta (Günlük dil)</option>
              <option value="high">Yüksek (Akademik)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-700">Cümle Yapısı</label>
            <select
              value={options.sentenceComplexity || 'simple'}
              onChange={(e) => onChange('sentenceComplexity', e.target.value)}
              className="w-full p-2 border border-zinc-200 rounded-lg text-sm"
            >
              <option value="simple">Basit (Yan cümleler)</option>
              <option value="compound">Birleşik (Bağlaçlı)</option>
              <option value="complex">Karmaşık (İç içe)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Çeldiriciler */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Target className="w-4 h-4" />
            Çeldiriciler
          </label>
          <button
            onClick={() => onChange('includeDistractors', !options.includeDistractors)}
            className={`w-12 h-6 rounded-full transition-all relative ${
              options.includeDistractors ? 'bg-purple-500' : 'bg-zinc-300'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              options.includeDistractors ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
        {options.includeDistractors && (
          <div>
            <label className="text-xs font-medium text-zinc-700">Çeldirici Sayısı: {options.distractorCount || 4}</label>
            <input
              type="range"
              min="2"
              max="8"
              value={options.distractorCount || 4}
              onChange={(e) => onChange('distractorCount', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );

  const PedagogicalSettings = () => (
    <div className="space-y-6">
      {/* Pedagojik Destek */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
        <label className="flex items-center gap-2 text-sm font-bold text-green-900 mb-4">
          <Award className="w-4 h-4" />
          Pedagojik Destek
        </label>
        <div className="space-y-3">
          {[
            { key: 'showInstructions', label: 'Talimatları Göster', icon: BookOpen },
            { key: 'showExamples', label: 'Örnekler Göster', icon: Eye },
            { key: 'includeTimer', label: 'Sayaç Ekle', icon: Clock },
            { key: 'showProgress', label: 'İlerleme Göster', icon: Target }
          ].map((setting) => {
            const Icon = setting.icon;
            return (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-zinc-900">{setting.label}</span>
                </div>
                <button
                  onClick={() => onChange(setting.key, !options[setting.key])}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    options[setting.key] ? 'bg-green-500' : 'bg-zinc-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    options[setting.key] ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const LayoutSettings = () => (
    <div className="space-y-6">
      {/* A4 Optimizasyon */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
        <label className="flex items-center gap-2 text-sm font-bold text-orange-900 mb-4">
          <Layout className="w-4 h-4" />
          A4 Optimizasyon
        </label>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700">Font Boyutu</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'small', label: 'Küçük' },
                { value: 'medium', label: 'Orta' },
                { value: 'large', label: 'Büyük' }
              ].map((size) => (
                <button
                  key={size.value}
                  onClick={() => onChange('fontSize', size.value)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    options.fontSize === size.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-zinc-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-zinc-700">Satır Aralığı</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'tight', label: 'Sıkı' },
                { value: 'normal', label: 'Normal' },
                { value: 'relaxed', label: 'Geniş' }
              ].map((spacing) => (
                <button
                  key={spacing.value}
                  onClick={() => onChange('lineHeight', spacing.value)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    options.lineHeight === spacing.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-zinc-200'
                  }`}
                >
                  {spacing.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700">Sayfa Düzeni</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChange('columnLayout', 'single')}
                className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  options.columnLayout === 'single'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-zinc-200'
                }`}
              >
                <AlignLeft className="w-3 h-3" />
                Tek Sütun
              </button>
              <button
                onClick={() => onChange('columnLayout', 'two-column')}
                className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  options.columnLayout === 'two-column'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-zinc-200'
                }`}
              >
                <Columns className="w-3 h-3" />
                İki Sütun
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Temel', icon: Settings },
    { id: 'visual', label: 'Görsel', icon: Palette },
    { id: 'advanced', label: 'Gelişmiş', icon: Sliders },
    { id: 'pedagogical', label: 'Pedagojik', icon: Award },
    { id: 'layout', label: 'Düzen', icon: Layout }
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex bg-zinc-100 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'basic' && <BasicSettings />}
        {activeTab === 'visual' && <VisualSettings />}
        {activeTab === 'advanced' && <AdvancedSettings />}
        {activeTab === 'pedagogical' && <PedagogicalSettings />}
        {activeTab === 'layout' && <LayoutSettings />}
      </div>

      {/* Preview Info */}
      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <p className="text-xs font-medium text-blue-900">
            Ultra özelleştirilmiş etkinlik A4 formatında optimize edilecek
          </p>
        </div>
      </div>
    </div>
  );
};
