// src/components/ReadingStudio/Editor/ContentEditor.tsx
import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useReadingStore } from '../../../store/useReadingStore';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { z } from 'zod';
import { logError } from '../../../utils/errorHandler';

// TipTap şemaları (her bileşen tipi için ayrı şema tanımlanabilir)
const storyBlockSchema = z.object({
    text: z.string().min(1, 'Metin boş olamaz'),
});

const vocabSchema = z.object({
    words: z.array(z.object({ word: z.string(), definition: z.string() })),
});

type Props = {
    item: any; // LayoutItem (unknown tip güvenliği için)
    open: boolean;
    onClose: () => void;
};

export const ContentEditor: React.FC<Props> = ({ item, open, onClose }) => {
    const { updateComponent } = useReadingStore();
    const [error, setError] = useState<string>('');

    // Başlangıç verisi
    const initialData = item.specificData || {};

    const editor = useEditor({
        extensions: [StarterKit, Link, Image],
        content: initialData.text || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Otomatik kaydet (autosave) – her değişiklikte store'a gönderilir
            try {
                // Tip kontrolü (örnek: story_block)
                if (item.id === 'story_block') {
                    storyBlockSchema.parse({ text: html });
                }
                if (item.id === 'vocabulary') {
                    // vocab için ayrı bir yapı beklenir, burada basitçe geçiyoruz
                    vocabSchema.parse({ words: initialData.words || [] });
                }
                updateComponent(item.instanceId, { specificData: { ...item.specificData, text: html } }, true);
                // Firestore/local sync zaten store içinde gerçekleşir
                window.dispatchEvent(new Event('reading_studio_saved'));
                setError('');
            } catch (e) {
                logError(e as any);
                setError((e as any).message);
            }
        },
    });

    // Dialog kapanınca editor temizlenir
    useEffect(() => {
        if (!open && editor) {
            editor.commands.setContent('');
        }
    }, [open, editor]);

    return (
        <Dialog.Root open={open} onOpenChange={(openState: boolean) => !openState && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-xl p-6">
                    <Dialog.Title className="text-lg font-bold mb-4">{item.label} Düzenle</Dialog.Title>
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <div className="border border-zinc-700 rounded p-2 bg-zinc-800 min-h-[200px]">
                        <EditorContent editor={editor} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600" onClick={onClose}>Kapat</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
