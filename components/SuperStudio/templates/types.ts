export interface TemplateSettingsProps {
    templateId: string;
    settings: Record<string, any>;
    onChange: (payload: Record<string, any>) => void;
}
