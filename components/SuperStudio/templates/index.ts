import { OkumaAnlamaSettings } from './OkumaAnlamaSettings';
import { MantikMuhakemeSettings } from './MantikMuhakemeSettings';
import { DilBilgisiSettings } from './DilBilgisiSettings';
import { GenericTemplateSettings } from './GenericTemplateSettings';

export const TemplateSettingsRegistry: Record<string, React.FC<any>> = {
    'okuma-anlama': OkumaAnlamaSettings,
    'mantik-muhakeme': MantikMuhakemeSettings,
    'dil-bilgisi': DilBilgisiSettings,
};

export { GenericTemplateSettings };
