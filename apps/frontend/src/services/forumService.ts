import { createClient } from '@/lib/supabase/client';

export interface Thread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  category_id: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  thread_id: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export interface CreateThreadData {
  title: string;
  content: string;
  category: string; // slug
  tags: string[];
}

export interface CreatePostData {
  content: string;
  threadId: string;
}

export interface UpdateThreadData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePostData {
  content: string;
}

export interface ForumFilters {
  category?: string; // slug o name
  tags?: string[];
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied';
  page?: number;
  limit?: number;
}

export interface ForumResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ForumService {
  // Categorías
  async getCategories(): Promise<ForumResponse<string[]>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('forum_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      return { success: true, data: data.map((c) => c.name) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async getCategoriesFull(): Promise<ForumResponse<Category[]>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  // Threads
  async getThreads(filters: ForumFilters = {}): Promise<ForumResponse<Thread[]>> {
    try {
      const supabase = createClient();
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, display_name, avatar_url),
          category:forum_categories!forum_threads_category_id_fkey(name, slug)
        `, { count: 'exact' })
        .is('deleted_at', null)
        .range(from, to);

      if (filters.category) {
        const { data: cat } = await supabase
          .from('forum_categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      if (filters.sortBy === 'oldest') query = query.order('created_at', { ascending: true });
      else if (filters.sortBy === 'mostViewed') query = query.order('view_count', { ascending: false });
      else if (filters.sortBy === 'mostReplied') query = query.order('reply_count', { ascending: false });
      else query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      const threads = (data ?? []).map((t) => ({
        ...t,
        category: t.category?.name ?? '',
      }));

      return {
        success: true,
        data: threads,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async getThread(id: string): Promise<ForumResponse<Thread>> {
    try {
      const supabase = createClient();

      // Incrementar view_count
      await supabase.rpc('increment_thread_views', { thread_id: id });

      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, display_name, avatar_url),
          category:forum_categories!forum_threads_category_id_fkey(name, slug)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return { success: true, data: { ...data, category: data.category?.name ?? '' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async createThread(threadData: CreateThreadData): Promise<ForumResponse<Thread>> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Debés iniciar sesión para crear un thread' };

      const { data: cat, error: catError } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('name', threadData.category)
        .single();

      if (catError || !cat) return { success: false, error: 'Categoría no encontrada' };

      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          title: threadData.title,
          content: threadData.content,
          author_id: user.id,
          category_id: cat.id,
          tags: threadData.tags,
        })
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, display_name, avatar_url),
          category:forum_categories!forum_threads_category_id_fkey(name, slug)
        `)
        .single();

      if (error) throw error;
      return { success: true, data: { ...data, category: data.category?.name ?? '' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async updateThread(id: string, threadData: UpdateThreadData): Promise<ForumResponse<Thread>> {
    try {
      const supabase = createClient();
      const updates: Record<string, unknown> = {};

      if (threadData.title) updates.title = threadData.title;
      if (threadData.content) updates.content = threadData.content;
      if (threadData.tags) updates.tags = threadData.tags;

      if (threadData.category) {
        const { data: cat } = await supabase
          .from('forum_categories')
          .select('id')
          .eq('name', threadData.category)
          .single();
        if (cat) updates.category_id = cat.id;
      }

      const { data, error } = await supabase
        .from('forum_threads')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, display_name, avatar_url),
          category:forum_categories!forum_threads_category_id_fkey(name, slug)
        `)
        .single();

      if (error) throw error;
      return { success: true, data: { ...data, category: data.category?.name ?? '' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async deleteThread(id: string): Promise<ForumResponse<{ message: string }>> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('forum_threads')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true, data: { message: 'Thread eliminado' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  // Posts
  async getPosts(threadId: string, page = 1, limit = 20): Promise<ForumResponse<Post[]>> {
    try {
      const supabase = createClient();
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(id, display_name, avatar_url)
        `, { count: 'exact' })
        .eq('thread_id', threadId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;
      return {
        success: true,
        data: data ?? [],
        pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async createPost(postData: CreatePostData): Promise<ForumResponse<Post>> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Debés iniciar sesión para responder' };

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({ content: postData.content, author_id: user.id, thread_id: postData.threadId })
        .select(`*, author:profiles!forum_posts_author_id_fkey(id, display_name, avatar_url)`)
        .single();

      if (error) throw error;

      // Actualizar reply_count
      await supabase.rpc('increment_thread_replies', { thread_id: postData.threadId });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async updatePost(id: string, postData: UpdatePostData): Promise<ForumResponse<Post>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ content: postData.content })
        .eq('id', id)
        .select(`*, author:profiles!forum_posts_author_id_fkey(id, display_name, avatar_url)`)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async deletePost(id: string): Promise<ForumResponse<{ message: string }>> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('forum_posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true, data: { message: 'Post eliminado' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async markPostAsSolution(postId: string): Promise<ForumResponse<Post>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId)
        .select(`*, author:profiles!forum_posts_author_id_fkey(id, display_name, avatar_url)`)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }

  async getTags(): Promise<ForumResponse<string[]>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('forum_threads')
        .select('tags')
        .is('deleted_at', null);

      if (error) throw error;
      const allTags = [...new Set((data ?? []).flatMap((t) => t.tags ?? []))].sort();
      return { success: true, data: allTags };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error' };
    }
  }
}

export const forumService = new ForumService();
export default forumService;
