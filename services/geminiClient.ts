
export const generateWithSchema = async (prompt: string, schema: any) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, schema }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const parsed = await response.json();
        return parsed;
    } catch (error) {
        console.error("Error fetching from serverless function:", error);
        throw new Error("Yapay zeka sunucusuna bağlanırken bir hata oluştu.");
    }
};