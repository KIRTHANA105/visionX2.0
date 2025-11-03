import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
    throw new Error("SUPABASE_URL environment variable not set");
}

if (!process.env.SUPABASE_API_KEY) {
    throw new Error("SUPABASE_API_KEY environment variable not set");
}

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);

// Auth helper functions
export const auth = {
    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async getUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
        return { data: { subscription } };
    }
};

// Document storage functions
export const documentService = {
    async uploadFile(file: File, userId: string): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);

        return publicUrl;
    },

    async saveDocument(documentData: {
        userId: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        fileUrl: string;
        summary: string;
        pros: string[];
        cons: string[];
        potentialLoopholes: string[];
        potentialChallenges: string[];
    }) {
        const { data, error } = await supabase
            .from('documents')
            .insert({
                user_id: documentData.userId,
                file_name: documentData.fileName,
                file_type: documentData.fileType,
                file_size: documentData.fileSize,
                file_url: documentData.fileUrl,
                summary: documentData.summary,
                pros: documentData.pros,
                cons: documentData.cons,
                potential_loopholes: documentData.potentialLoopholes,
                potential_challenges: documentData.potentialChallenges,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getUserDocuments(userId: string) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async deleteDocument(documentId: string, userId: string) {
        // First get the document to find the file URL
        const { data: doc } = await supabase
            .from('documents')
            .select('file_url')
            .eq('id', documentId)
            .eq('user_id', userId)
            .single();

        // Delete from database
        const { error: dbError } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId)
            .eq('user_id', userId);

        if (dbError) throw dbError;

        // Delete file from storage if exists
        if (doc?.file_url) {
            const fileName = doc.file_url.split('/').pop();
            if (fileName) {
                await supabase.storage
                    .from('documents')
                    .remove([`${userId}/${fileName}`]);
            }
        }

        return { success: true };
    }
};

// Chat history service functions
export const chatService = {
    async saveMessage(userId: string, sessionId: string, role: 'user' | 'model', message: string) {
        const { data, error } = await supabase
            .from('chat_history')
            .insert({
                user_id: userId,
                session_id: sessionId,
                role,
                message,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getChatHistory(sessionId: string, userId: string) {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('session_id', sessionId)
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getUserChatSessions(userId: string) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createChatSession(userId: string, sessionId: string, title?: string) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: userId,
                session_id: sessionId,
                title: title || null,
                message_count: 0,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateChatSessionTitle(sessionId: string, userId: string, title: string) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .update({ title })
            .eq('session_id', sessionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteChatSession(sessionId: string, userId: string) {
        const { error: messagesError } = await supabase
            .from('chat_history')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_id', userId);

        if (messagesError) throw messagesError;

        const { error: sessionError } = await supabase
            .from('chat_sessions')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_id', userId);

        if (sessionError) throw sessionError;

        return { success: true };
    }
};

