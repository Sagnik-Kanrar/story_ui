import {
  Story,
  Chapter,
  Character,
  TimelineEvent,
  Memory,
  PlotHole,
  OutlineItem,
  CoWriterPayload,
  CoWriterResponse,
  VectorPipelineExplanation
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `Request failed: ${response.status} ${response.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.detail) message = parsed.detail;
        } catch {
          if (errorText) message = errorText;
        }
        throw new Error(message);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.warn(`[StoryWeave API Error] ${endpoint}:`, err.message || err);
      throw err;
    }
  }

  // Healthcheck
  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/health');
  }

  // Stories
  async getStories(): Promise<Story[]> {
    return this.request<Story[]>('/api/stories');
  }

  async getStory(id: string): Promise<Story> {
    return this.request<Story>(`/api/stories/${id}`);
  }

  async createStory(story: Partial<Story>): Promise<Story> {
    return this.request<Story>('/api/stories', {
      method: 'POST',
      body: JSON.stringify(story),
    });
  }

  async updateStory(id: string, updates: Partial<Story>): Promise<Story> {
    return this.request<Story>(`/api/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStory(id: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/api/stories/${id}`, {
      method: 'DELETE',
    });
  }

  async previewOutline(params: {
    title: string;
    description: string;
    genre: string;
    mood: string;
    chapter_count: number;
  }): Promise<{ outline: OutlineItem[] }> {
    return this.request<{ outline: OutlineItem[] }>('/api/stories/outline/preview', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Chapters
  async getStoryChapters(storyId: string): Promise<Chapter[]> {
    return this.request<Chapter[]>(`/api/stories/${storyId}/chapters`);
  }

  async getChapter(chapterId: string): Promise<Chapter> {
    return this.request<Chapter>(`/api/chapters/${chapterId}`);
  }

  async createChapter(storyId: string, chapter: Partial<Chapter>): Promise<Chapter> {
    return this.request<Chapter>(`/api/stories/${storyId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapter),
    });
  }

  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<Chapter> {
    return this.request<Chapter>(`/api/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteChapter(chapterId: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/api/chapters/${chapterId}`, {
      method: 'DELETE',
    });
  }

  // Characters
  async getStoryCharacters(storyId: string): Promise<Character[]> {
    return this.request<Character[]>(`/api/stories/${storyId}/characters`);
  }

  async getCharacter(charId: string): Promise<Character> {
    return this.request<Character>(`/api/characters/${charId}`);
  }

  async createCharacter(storyId: string, character: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/api/stories/${storyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ ...character, story_id: storyId }),
    });
  }

  async updateCharacter(charId: string, updates: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/api/characters/${charId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCharacter(charId: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/api/characters/${charId}`, {
      method: 'DELETE',
    });
  }

  async generateAiCharacter(params: { genre: string; role: string; theme?: string }): Promise<{ character: Partial<Character> }> {
    return this.request<{ character: Partial<Character> }>('/api/characters/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Timeline
  async getStoryTimeline(storyId: string): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>(`/api/stories/${storyId}/timeline`);
  }

  async createTimelineEvent(storyId: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return this.request<TimelineEvent>(`/api/stories/${storyId}/timeline`, {
      method: 'POST',
      body: JSON.stringify({ ...event, story_id: storyId }),
    });
  }

  async updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return this.request<TimelineEvent>(`/api/timeline/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTimelineEvent(eventId: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/api/timeline/${eventId}`, {
      method: 'DELETE',
    });
  }

  async extractEventsFromChapter(storyId: string, chapterId: string): Promise<{ extracted_count: number; events: TimelineEvent[] }> {
    return this.request<{ extracted_count: number; events: TimelineEvent[] }>(`/api/stories/${storyId}/timeline/extract`, {
      method: 'POST',
      body: JSON.stringify({ chapter_id: chapterId }),
    });
  }

  // Universe Memory
  async getStoryMemories(storyId: string, category?: string): Promise<Memory[]> {
    const url = category ? `/api/stories/${storyId}/memories?category=${encodeURIComponent(category)}` : `/api/stories/${storyId}/memories`;
    return this.request<Memory[]>(url);
  }

  async createMemory(storyId: string, memory: Partial<Memory>): Promise<Memory> {
    return this.request<Memory>(`/api/stories/${storyId}/memories`, {
      method: 'POST',
      body: JSON.stringify({ ...memory, story_id: storyId }),
    });
  }

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<Memory> {
    return this.request<Memory>(`/api/memories/${memoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMemory(memoryId: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/api/memories/${memoryId}`, {
      method: 'DELETE',
    });
  }

  async searchMemories(storyId: string, query: string, topK: number = 5): Promise<{ query: string; results: Memory[]; count: number }> {
    return this.request<{ query: string; results: Memory[]; count: number }>(`/api/stories/${storyId}/memories/search`, {
      method: 'POST',
      body: JSON.stringify({ query, top_k: topK }),
    });
  }

  async getPipelineExplanation(): Promise<VectorPipelineExplanation> {
    return this.request<VectorPipelineExplanation>('/api/memory/pipeline');
  }

  // Plot Holes & Consistency
  async getStoryPlotHoles(storyId: string): Promise<PlotHole[]> {
    return this.request<PlotHole[]>(`/api/stories/${storyId}/plotholes`);
  }

  async createPlotHole(storyId: string, plothole: Partial<PlotHole>): Promise<PlotHole> {
    return this.request<PlotHole>(`/api/stories/${storyId}/plotholes`, {
      method: 'POST',
      body: JSON.stringify({ ...plothole, story_id: storyId }),
    });
  }

  async updatePlotHole(issueId: string, updates: Partial<PlotHole>): Promise<PlotHole> {
    return this.request<PlotHole>(`/api/plotholes/${issueId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePlotHole(issueId: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/api/plotholes/${issueId}`, {
      method: 'DELETE',
    });
  }

  async runConsistencyAudit(storyId: string): Promise<{ audit_results: PlotHole[]; total_detected: number }> {
    return this.request<{ audit_results: PlotHole[]; total_detected: number }>(`/api/stories/${storyId}/plotholes/audit`, {
      method: 'POST',
    });
  }

  // AI Co-writer
  async askCoWriter(payload: CoWriterPayload): Promise<CoWriterResponse> {
    return this.request<CoWriterResponse>('/api/ai/cowriter', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
