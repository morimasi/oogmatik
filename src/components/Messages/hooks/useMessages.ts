import { useEffect, useCallback, useRef } from 'react';
import { useMessagesStore } from '../store/useMessagesStore';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../../../services/authService';
import type { Message, MessageFile } from '../../../types';
import type { Contact } from '../types';

export function useMessages() {
  const store = useMessagesStore();
  const { user } = useAuthStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    if (!user?.id) return;
    store.setLoading(true);

    authService.getContacts(user.id).then((contacts) => {
      const contactList: Contact[] = contacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        role: c.role || 'user',
        avatar: c.avatar || '',
        unreadCount: 0,
      }));
      store.setContacts(contactList);
      store.setLoading(false);
    });

    const unsub = messageService.listenToMessages(user.id, (msgs) => {
      const prevCount = prevMessageCountRef.current;
      const currentCount = msgs.length;
      prevMessageCountRef.current = currentCount;

      store.setMessages(msgs);

      const incoming = msgs.filter(
        (m) => m.receiverId === user.id && !m.isRead && !m.isDeleted
      );
      if (incoming.length > prevCount && prevCount > 0) {
        store.setUnreadCount(incoming.length);
      }

      const unread = msgs.filter((m) => m.receiverId === user.id && !m.isRead && !m.isDeleted);
      store.setUnreadCount(unread.length);

      const latestFromEach = new Map<string, Message>();
      msgs.forEach((m) => {
        const contactId = m.senderId === user.id ? m.receiverId : m.senderId;
        if (!m.isDeleted) {
          latestFromEach.set(contactId, m);
        }
      });

      store.setContacts((prev) =>
        prev.map((c) => ({
          ...c,
          lastMessage: latestFromEach.get(c.id),
          unreadCount: msgs.filter(
            (m) => m.senderId === c.id && !m.isRead && !m.isDeleted
          ).length,
        }))
      );
    });

    unsubscribeRef.current = unsub;
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !store.activeContactId) return;
    const unsub = messageService.listenToContactMessages(
      user.id,
      store.activeContactId,
      (msgs) => {
        store.setMessages(msgs);
        const unreadIds = msgs
          .filter((m) => m.senderId === store.activeContactId && !m.isRead && !m.isDeleted)
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          messageService.markAsRead(unreadIds);
        }
      }
    );
    return () => unsub();
  }, [user?.id, store.activeContactId]);

  const selectContact = useCallback((contactId: string) => {
    store.setActiveContactId(contactId);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user?.id || !store.activeContactId || !content.trim()) return false;

      const contact = store.contacts.find((c) => c.id === store.activeContactId);
      if (!contact) return false;

      const result = await messageService.sendMessage(
        user.id,
        store.activeContactId,
        user.name || 'Kullanıcı',
        content.trim(),
        {
          replyToMessageId: store.replyToMessage?.id,
          quote: store.quoteContent
            ? {
                messageId: store.replyToMessage?.id || '',
                senderId: store.replyToMessage?.senderId || '',
                senderName: store.replyToMessage?.senderName || '',
                content: store.quoteContent,
                timestamp: store.replyToMessage?.timestamp || new Date().toISOString(),
              }
            : undefined,
        }
      );

      if (result) {
        store.setReplyToMessage(null);
        store.setQuoteContent(null);
      }

      return !!result;
    },
    [user?.id, store.activeContactId, store.contacts, store.replyToMessage, store.quoteContent]
  );

  const sendMessageWithFiles = useCallback(
    async (content: string, files: File[]) => {
      if (!user?.id || !store.activeContactId || (!content.trim() && files.length === 0))
        return false;

      const contact = store.contacts.find((c) => c.id === store.activeContactId);
      if (!contact) return false;

      const result = await messageService.sendMessageWithFiles(
        user.id,
        store.activeContactId,
        user.name || 'Kullanıcı',
        content.trim(),
        files,
        {
          replyToMessageId: store.replyToMessage?.id,
          quote: store.quoteContent
            ? {
                messageId: store.replyToMessage?.id || '',
                senderId: store.replyToMessage?.senderId || '',
                senderName: store.replyToMessage?.senderName || '',
                content: store.quoteContent,
                timestamp: store.replyToMessage?.timestamp || new Date().toISOString(),
              }
            : undefined,
        }
      );

      if (result) {
        store.setReplyToMessage(null);
        store.setQuoteContent(null);
      }

      return result;
    },
    [user?.id, store.activeContactId, store.contacts, store.replyToMessage, store.quoteContent]
  );

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    return messageService.editMessage(messageId, newContent);
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    return messageService.deleteMessage(messageId, true);
  }, []);

  const restoreMessage = useCallback(async (messageId: string) => {
    return messageService.restoreMessage(messageId);
  }, []);

  const clearConversation = useCallback(async () => {
    if (!user?.id || !store.activeContactId) return;
    await messageService.clearConversation(user.id, store.activeContactId);
  }, [user?.id, store.activeContactId]);

  const replyToMessage = useCallback((msg: Message) => {
    store.setReplyToMessage(msg);
    store.setQuoteContent(msg.content);
  }, []);

  const cancelReply = useCallback(() => {
    store.setReplyToMessage(null);
    store.setQuoteContent(null);
  }, []);

  const activeContact = store.contacts.find((c) => c.id === store.activeContactId) || null;

  return {
    ...store,
    activeContact,
    selectContact,
    sendMessage,
    sendMessageWithFiles,
    editMessage,
    deleteMessage,
    restoreMessage,
    clearConversation,
    replyToMessage,
    cancelReply,
    user,
  };
}
