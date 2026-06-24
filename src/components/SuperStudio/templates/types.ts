export interface TemplateSettingsProps {
    templateId: string;
    settings: Record<string, unknown>;
    onChange: (payload: Record<string, unknown>) => void;
}
