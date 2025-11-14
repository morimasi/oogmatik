import React, { CSSProperties } from 'react';
import { ActivityType, WorksheetData } from '../types';
// FIX: Corrected import statement for the 'Worksheet' component to resolve a "no default export" error.
import { default as Worksheet } from './Worksheet';
import Toolbar from './Toolbar';
import { StyleSettings } from '../App';
import { ACTIVITIES } from '../constants';

interface ContentAreaProps {
  activityType: ActivityType | null;
  worksheetData: WorksheetData;
  isLoading: boolean;
  error: string | null;
  styleSettings: StyleSettings;
  onStyleChange: (settings: StyleSettings) => void;
  worksheetStyles: CSSProperties;
  onSave: (name: string, activityType: ActivityType, data: WorksheetData) => void;
}

const WelcomePlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center h-full bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm p-10 border-2 border-dashed border-zinc-300 dark:border-zinc-700">
      <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-wand-magic-sparkles fa-3x text-zinc-400 dark:text-zinc-500"></i>
      </div>
      <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Etkinlik Oluşturucuya Hoş Geldiniz!</h3>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">Başlamak için sol taraftaki menüden bir etkinlik kategorisi seçin, ayarları yapılandırın ve "Etkinlik Oluştur" düğmesine tıklayarak çalışma sayfanızı anında hazırlayın.</p>
  </div>
);

const ContentArea: React.FC<ContentAreaProps> = ({
  activityType,
  worksheetData,
  isLoading,
  error,
  styleSettings,
  onStyleChange,
  worksheetStyles,
  onSave
}) => {
  return (
    <main className="flex-1 bg-zinc-50 dark:bg-zinc-900 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {worksheetData && !isLoading && activityType && (
          <Toolbar 
            settings={styleSettings} 
            onSettingsChange={onStyleChange} 
            onSave={(name) => onSave(name, activityType, worksheetData)}
          />
        )}
        
        <div className="mt-4">
            {isLoading ? (
                 <div className="flex items-center justify-center text-center h-full p-10">
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-12 h-12 text-zinc-200 animate-spin dark:text-zinc-600 fill-indigo-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 40.0117 89.4855 44.2745 89.2663 48.6162C88.9817 52.952 87.8758 57.1945 86.0331 61.1041C84.1905 65.0136 81.6568 68.5913 78.5839 71.6835C75.5109 74.7757 71.9772 77.3619 68.1458 79.352C64.3144 81.3421 60.2243 82.709 55.9588 83.4063C51.6932 84.1036 47.319 84.1102 43.0333 83.4258C38.7477 82.7413 34.5855 81.385 30.7388 79.4239C26.8921 77.4628 23.4215 74.9315 20.4481 71.9209C17.4748 68.9104 14.9984 65.4899 13.0881 61.763C11.1778 58.0361 9.87532 54.0805 9.24817 49.9819C8.62101 45.8833 8.68069 41.7169 9.42261 37.6491C10.1645 33.5813 11.5839 29.6732 13.6212 26.034C15.6585 22.3948 18.284 19.0948 21.4069 16.2783C24.5298 13.4618 28.1065 11.1668 32.022 9.49506C35.9375 7.82333 40.1343 6.80492 44.4443 6.48633C48.7544 6.16773 53.1118 6.55973 57.2625 7.64142C59.6389 8.2104 62.1554 6.82462 62.7244 4.44819C63.2934 2.07176 61.9076 -0.444748 59.5312 -1.01374C54.4733 -2.25628 49.198 -2.62804 43.9515 -2.06211C38.705 -1.49618 33.5786 -0.000300103 28.7618 2.39692C23.945 4.79414 19.5135 8.05832 15.6596 12.0492C11.8057 16.0399 8.59914 20.7079 6.22273 25.8645C3.84633 31.0211 2.35515 36.5912 1.83859 42.3451C1.32203 48.099 1.79153 53.9452 3.21183 59.571C4.63214 65.1969 6.98011 70.5218 10.1473 75.2985C13.3146 80.0752 17.2474 84.2215 21.7852 87.5451C26.3231 90.8687 31.3995 93.3085 36.8164 94.7554C42.2333 96.2023 47.9004 96.6318 53.5113 96.0123C59.1223 95.3927 64.6063 93.7363 69.7571 91.1396C74.9079 88.5429 79.6433 85.0699 83.7465 80.8931C87.8497 76.7162 91.24 71.912 93.7845 66.658C96.329 61.4041 97.9733 55.776 98.6256 49.9961C99.2779 44.2163 98.9205 38.3773 97.5855 32.7932C96.9459 29.9325 94.8584 27.6749 92.0531 27.2483C89.2478 26.8217 86.5881 28.17 85.3986 30.7303C83.7224 34.2301 82.7289 38.0315 82.4776 41.9202C82.2262 45.8088 82.7297 49.7342 83.9529 53.4688C85.1762 57.2034 87.0913 60.6865 89.5936 63.7553C92.0959 66.8242 95.1415 69.421 98.5999 71.4484C98.8153 71.5839 99.032 71.7182 99.2485 71.851C99.465 71.9838 99.6813 72.1154 99.8973 72.2458C100.113 72.3762 100.329 72.5054 100.544 72.6334L100.544 72.6334C100.544 72.6334 100.544 72.6334 100.544 72.6334Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Yükleniyor...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                    <p className="font-bold">Bir Hata Oluştu</p>
                    <p>{error}</p>
                </div>
            ) : worksheetData ? (
                <Worksheet activityType={activityType} data={worksheetData} styles={worksheetStyles} />
            ) : (
                <WelcomePlaceholder />
            )}
        </div>
      </div>
    </main>
  );
};

export default ContentArea;