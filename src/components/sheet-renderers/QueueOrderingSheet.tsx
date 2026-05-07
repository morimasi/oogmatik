/**
 * Queue Ordering (Sıralama) Activity Sheet Component
 * Ultra-professional premium customizable A4 worksheet
 * Advanced settings: difficulty, theme, icon style, layout, visual density
 */

import React from 'react';

interface QueueOrderingSheetProps {
  data: any;
  settings: {
    showAnswers?: boolean;
    theme?: 'indigo' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
    iconStyle?: 'emoji' | 'avatar' | 'geometric' | 'minimal';
    layout?: 'grid' | 'list' | 'compact';
    visualDensity?: 'comfortable' | 'compact' | 'ultra-compact';
    showVisualClues?: boolean;
    showPositionNumbers?: boolean;
    showScenario?: boolean;
    highlightKeywords?: boolean;
    fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
    cardStyle?: 'flat' | 'elevated' | 'outlined';
    headerStyle?: 'gradient' | 'solid' | 'minimal';
  };
}

export const QueueOrderingSheet: React.FC<QueueOrderingSheetProps> = ({ data, settings }) => {
  // Safety check for undefined data
  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>İçerik yüklenemedi. Lütfen tekrar deneyin.</p>
      </div>
    );
  }

  const { problems, title, instruction, locationType, difficulty } = data;

  // Ultra-premium theme configuration
  const themes = {
    indigo: { primary: 'indigo', accent: 'purple', gradient: 'from-indigo-500 to-purple-600', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', text: 'text-indigo-900' },
    blue: { primary: 'blue', accent: 'cyan', gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-900' },
    purple: { primary: 'purple', accent: 'fuchsia', gradient: 'from-purple-500 to-fuchsia-600', bg: 'from-purple-50 to-fuchsia-50', border: 'border-purple-200', text: 'text-purple-900' },
    emerald: { primary: 'emerald', accent: 'teal', gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', text: 'text-emerald-900' },
    amber: { primary: 'amber', accent: 'orange', gradient: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-900' },
    rose: { primary: 'rose', accent: 'pink', gradient: 'from-rose-500 to-pink-600', bg: 'from-rose-50 to-pink-50', border: 'border-rose-200', text: 'text-rose-900' },
  };

  const theme = themes[settings?.theme || 'indigo'];
  const iconStyle = settings?.iconStyle || 'emoji';
  const layout = settings?.layout || 'grid';
  const visualDensity = settings?.visualDensity || 'comfortable';
  const fontSize = settings?.fontSize || 'medium';
  const cardStyle = settings?.cardStyle || 'elevated';
  const headerStyle = settings?.headerStyle || 'gradient';

  // Font size mapping
  const fontSizeMap = {
    small: { title: 'text-xl', subtitle: 'text-xs', body: 'text-sm', label: 'text-[10px]' },
    medium: { title: 'text-2xl', subtitle: 'text-sm', body: 'text-sm', label: 'text-xs' },
    large: { title: 'text-3xl', subtitle: 'text-base', body: 'text-base', label: 'text-sm' },
    xlarge: { title: 'text-4xl', subtitle: 'text-lg', body: 'text-lg', label: 'text-base' },
  };

  const sizes = fontSizeMap[fontSize];

  // Visual density spacing
  const spacingMap = {
    comfortable: { section: 'space-y-8', card: 'p-6', gap: 'gap-4' },
    compact: { section: 'space-y-6', card: 'p-5', gap: 'gap-3' },
    'ultra-compact': { section: 'space-y-4', card: 'p-4', gap: 'gap-2' },
  };

  const spacing = spacingMap[visualDensity];

  // Card style
  const cardStyles = {
    flat: 'bg-white shadow-sm',
    elevated: 'bg-white shadow-lg border-2',
    outlined: 'bg-gradient-to-br from-white to-gray-50 shadow-xl border-3',
  };

  if (!problems || problems.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>İçerik bulunamadı. Lütfen farklı bir aktivite seçin.</p>
      </div>
    );
  }

  return (
    <div className="queue-ordering-sheet font-['Lexend'] p-6">
      {/* Premium Header */}
      <div className={`mb-6 pb-4 border-b-2 ${theme.border}`}>
        {headerStyle === 'gradient' ? (
          <div className={`bg-gradient-to-r ${theme.gradient} -m-6 p-6 mb-6 -mx-6`}>
            <h1 className={`${sizes.title} font-black text-white uppercase tracking-tight drop-shadow-sm`}>
              {title || 'Sıra Alma Becerisi'}
            </h1>
            {instruction && (
              <p className={`${sizes.subtitle} font-medium text-white/90 mt-2`}>
                {instruction}
              </p>
            )}
          </div>
        ) : headerStyle === 'solid' ? (
          <>
            <h1 className={`${sizes.title} font-black ${theme.text} uppercase tracking-tight`}>
              {title || 'Sıra Alma Becerisi'}
            </h1>
            {instruction && (
              <p className={`${sizes.subtitle} font-medium text-gray-600 mt-2`}>
                {instruction}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className={`${sizes.title} font-black text-gray-900 uppercase tracking-tight border-l-4 ${theme.border} pl-4`}>
              {title || 'Sıra Alma Becerisi'}
            </h1>
            {instruction && (
              <p className={`${sizes.subtitle} font-medium text-gray-600 mt-2 ml-5`}>
                {instruction}
              </p>
            )}
          </>
        )}
      </div>

      {/* Premium Instructions with Icon */}
      {settings?.showScenario !== false && (
        <div className={`mb-4 px-5 py-4 bg-gradient-to-r ${theme.bg} border-l-4 ${theme.border.replace('200', '500')} rounded-r-lg shadow-sm`}>
          <p className={`${fontSizeMap[fontSize].body} font-bold ${theme.text} flex items-center gap-2`}>
            <i className="fa-solid fa-lightbulb text-lg"></i>
            {locationType === 'school' && 'Okul ve sınıf ortamında sıralama kurallarını öğren!'}
            {locationType === 'bus' && 'Otobüs durağında sıra bekleme kurallarını öğren!'}
            {locationType === 'market' && 'Markette sıra bekleme etikini öğren!'}
            {locationType === 'hospital' && 'Hastanede sıralama sistemini öğren!'}
            {!['school', 'bus', 'market', 'hospital'].includes(locationType) && 'Sıralama ipuçlarını kullanarak soruları cevaplayın.'}
          </p>
        </div>
      )}

      {/* Premium Difficulty Badge */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
          difficulty === 'easy' ? 'bg-green-100 text-green-700 border-2 border-green-200' :
          difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' :
          difficulty === 'hard' ? 'bg-orange-100 text-orange-700 border-2 border-orange-200' :
          'bg-red-100 text-red-700 border-2 border-red-200'
        }`}>
          <i className={`fa-solid ${
            difficulty === 'easy' ? 'fa-star' :
            difficulty === 'medium' ? 'fa-star fa-star-half-stroke' :
            difficulty === 'hard' ? 'fa-star fa-star fa-star' :
            'fa-skull-crossbones'} mr-1`}
          ></i>
          {difficulty === 'easy' ? 'Kolay' :
           difficulty === 'medium' ? 'Orta' :
           difficulty === 'hard' ? 'Zor' :
           'Uzman'}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
          <i className="fa-solid fa-list-ol mr-1"></i>
          {problems.length} Soru
        </span>
        {locationType && (
          <span className={`px-3 py-1 bg-gradient-to-r ${theme.gradient} text-white rounded-full text-xs font-bold shadow-sm`}>
            <i className={`fa-solid ${
              locationType === 'school' ? 'fa-school' :
              locationType === 'bus' ? 'fa-bus' :
              locationType === 'market' ? 'fa-cart-shopping' :
              locationType === 'hospital' ? 'fa-hospital' :
              'fa-location-dot'} mr-1`}
            ></i>
            {locationType === 'school' ? 'Okul' :
             locationType === 'bus' ? 'Otobüs' :
             locationType === 'market' ? 'Market' :
             locationType === 'hospital' ? 'Hastane' :
             locationType}
          </span>
        )}
      </div>

      {/* Problems Container */}
      <div className={spacing.section}>
        {problems.map((problem: any, idx: number) => (
          <div key={problem.id || idx} className={`problem-card ${cardStyles[cardStyle]} ${theme.border} rounded-2xl ${spacing.card}`}>
            {/* Problem Header with Number Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center text-lg font-black shadow-lg`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-black text-gray-900 uppercase tracking-tight`}>
                  {problem.locationName || `Soru ${idx + 1}`}
                </h3>
                <p className={`${sizes.label} font-medium text-gray-500 flex items-center gap-2`}>
                  <i className="fa-solid fa-users"></i>
                  {problem.totalPeople} kişi
                  <span className="text-gray-300">•</span>
                  <i className="fa-solid fa-signal"></i>
                  {problem.difficulty === 'easy' ? 'Kolay' : problem.difficulty === 'medium' ? 'Orta' : problem.difficulty === 'hard' ? 'Zor' : 'Uzman'}
                </p>
              </div>
            </div>

            {/* Scenario Box */}
            {settings?.showScenario !== false && problem.scenario && (
              <div className={`mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 ${theme.border} shadow-sm`}>
                <p className={`${sizes.body} font-medium text-gray-800 leading-relaxed`}>
                  {settings?.highlightKeywords ? (
                    <span dangerouslySetInnerHTML={{ 
                      __html: problem.scenario
                        .replace(/(önce|sonra|öncesinde)/gi, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
                        .replace(/(sonra|sonrasında|ardından)/gi, '<mark class="bg-blue-200 px-1 rounded">$1</mark>')
                        .replace(/(arasında|önce| arasında)/gi, '<mark class="bg-green-200 px-1 rounded">$1</mark>')
                    }} />
                  ) : problem.scenario}
                </p>
              </div>
            )}

            {/* People Grid with Premium Icons */}
            {settings?.showVisualClues !== false && problem.people && problem.people.length > 0 && (
              <div className="mb-4">
                <p className={`${sizes.label} font-black text-gray-600 uppercase mb-3 tracking-wider flex items-center gap-2`}>
                  <i className="fa-solid fa-users text-lg"></i> Bilinen Kişiler
                </p>
                <div className={`grid ${
                  layout === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' :
                  layout === 'compact' ? 'grid-cols-2 gap-2' :
                  'grid-cols-1'
                } ${spacing.gap}`}>
                  {problem.people.map((person: any, pIdx: number) => (
                    <div key={person.id || pIdx} className={`flex items-center gap-3 p-3 bg-gradient-to-r ${theme.bg} rounded-xl border-2 ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-xl shadow-sm`}>
                        {iconStyle === 'emoji' && (person.icon || '👤')}
                        {iconStyle === 'geometric' && <i className="fa-solid fa-user text-white"></i>}
                        {iconStyle === 'minimal' && <div className="w-6 h-6 rounded-full bg-white/50"></div>}
                        {iconStyle === 'avatar' && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} className="w-8 h-8" alt="" />}
                      </div>
                      {/* Info */}
                      <div className="flex-1">
                        <p className={`${sizes.label} font-bold text-gray-900`}>{person.name}</p>
                        {settings?.showPositionNumbers !== false && (
                          <p className={`text-[10px] font-bold ${theme.text} flex items-center gap-1`}>
                            <i className="fa-solid fa-hashtag text-[8px]"></i>
                            {person.clue || `${person.position}. sıra`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Box - Premium Highlight */}
            <div className={`p-5 bg-gradient-to-r ${theme.bg} border-3 ${theme.border.replace('200', '400')} rounded-2xl shadow-md hover:shadow-lg transition-shadow`}>
              <p className={`${sizes.body} font-black ${theme.text} flex items-start gap-3`}>
                <i className="fa-solid fa-circle-question text-xl mt-0.5"></i>
                <span className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-75 block mb-1">Soru</span>
                  {problem.questionText}
                </span>
              </p>
            </div>

            {/* Answer Box - Premium Design */}
            {settings?.showAnswers && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-400 rounded-xl shadow-md">
                <p className={`${sizes.label} font-black text-green-800 flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-black">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-green-600">Cevap</span>
                    <span className="text-sm font-black text-green-900">{problem.answer}. sıra</span>
                  </div>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Premium Footer */}
      <div className={`mt-8 pt-4 border-t-2 ${theme.border} bg-gradient-to-r ${theme.bg} rounded-xl p-4 shadow-sm`}>
        <p className={`${sizes.label} font-bold text-gray-700 text-center flex items-center justify-center gap-2`}>
          <i className={`fa-solid ${locationType === 'school' ? 'fa-graduation-cap' : locationType === 'bus' ? 'fa-bus' : locationType === 'market' ? 'fa-shopping-cart' : locationType === 'hospital' ? 'fa-heart-pulse' : 'fa-brain'} text-lg`}></i>
          Sıralama becerisi, günlük yaşamda yön algısı ve mantıksal çıkarım yeteneğini geliştirir.
        </p>
        <div className="mt-2 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text} opacity-60`}>
            Neuro-Oogmatik Özel Eğitim Teknolojileri
          </span>
          <span className={`text-[10px] font-mono text-gray-500`}>
            {locationType?.toUpperCase()} • {difficulty?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
