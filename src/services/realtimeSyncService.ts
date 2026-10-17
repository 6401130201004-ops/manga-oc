import { Comic, Chapter } from '../types/comic';

export interface RealtimeSyncEvent {
  comicId: string;
  comicTitle: string;
  chapter: Chapter;
  source: string;
}

export function subscribeToRealtimeMangaUpdates(
  onNewChapter: (event: RealtimeSyncEvent) => void,
  onStatusUpdate?: (stats: any) => void
): () => void {
  let eventSource: EventSource | null = null;
  let pollInterval: any = null;

  try {
    eventSource = new EventSource('/api/pipeline/stream');

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'REALTIME_CHAPTER_SYNCED' && data.chapter) {
          onNewChapter({
            comicId: data.comicId,
            comicTitle: data.comicTitle,
            chapter: data.chapter,
            source: data.source,
          });
        }
        if (data.stats && onStatusUpdate) {
          onStatusUpdate(data.stats);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      // If SSE disconnects, polling fallback handles it smoothly
    };
  } catch (err) {
    console.warn('SSE not available, relying on polling fallback:', err);
  }

  // Backup polling every 22 seconds to ensure 100% reliable real-time updates
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/manga/realtime-feed');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.chapters && data.chapters.length > 0) {
        // Feed newest chapters
        const latest = data.chapters[0];
        if (latest && latest.chapter) {
          onNewChapter({
            comicId: latest.comicId,
            comicTitle: latest.comicTitle,
            chapter: latest.chapter,
            source: latest.source,
          });
        }
      }
      if (data.totalSynced && onStatusUpdate) {
        onStatusUpdate({ totalCrawledChapters: data.totalSynced });
      }
    } catch (e) {}
  }, 22000);

  return () => {
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  };
}

export async function triggerManualSyncCheck(): Promise<boolean> {
  try {
    const res = await fetch('/api/manga/trigger-sync-now', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function triggerSyncAllChapters(): Promise<any> {
  try {
    const res = await fetch('/api/manga/sync-all', { method: 'POST' });
    return await res.json();
  } catch {
    return { success: false };
  }
}
