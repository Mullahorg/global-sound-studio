import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  bpm: number;
  key: string | null;
  genre: string;
  mood: string;
  price_basic: number;
  price_premium: number;
  price_exclusive: number;
  producer?: {
    full_name: string | null;
    badge: string | null;
    country: string | null;
  } | null;
}

interface AudioQueueContextType {
  queue: Beat[];
  currentBeat: Beat | null;
  currentIndex: number;
  isPlaying: boolean;
  isQueueOpen: boolean;
  addToQueue: (beat: Beat) => void;
  removeFromQueue: (beatId: string) => void;
  clearQueue: () => void;
  playBeat: (beat: Beat) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentBeat: (beat: Beat | null) => void;
  setIsQueueOpen: (open: boolean) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

const AudioQueueContext = createContext<AudioQueueContextType | undefined>(undefined);

export const AudioQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Beat[]>([]);
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const addToQueue = useCallback((beat: Beat) => {
    setQueue((prev) => {
      // Don't add duplicates
      if (prev.some((b) => b.id === beat.id)) {
        return prev;
      }
      return [...prev, beat];
    });
  }, []);

  const removeFromQueue = useCallback((beatId: string) => {
    setQueue((prev) => prev.filter((b) => b.id !== beatId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  const playBeat = useCallback((beat: Beat) => {
    setCurrentBeat(beat);
    setIsPlaying(true);
    // Add to queue if not already there
    setQueue((prev) => {
      const existingIndex = prev.findIndex((b) => b.id === beat.id);
      if (existingIndex >= 0) {
        setCurrentIndex(existingIndex);
        return prev;
      }
      const newQueue = [...prev, beat];
      setCurrentIndex(newQueue.length - 1);
      return newQueue;
    });
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      setCurrentBeat(queue[nextIndex]);
      setIsPlaying(true);
    } else {
      // Loop back to start
      setCurrentIndex(0);
      setCurrentBeat(queue[0]);
      setIsPlaying(true);
    }
  }, [queue, currentIndex]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setCurrentBeat(queue[prevIndex]);
      setIsPlaying(true);
    } else {
      // Loop to end
      const lastIndex = queue.length - 1;
      setCurrentIndex(lastIndex);
      setCurrentBeat(queue[lastIndex]);
      setIsPlaying(true);
    }
  }, [queue, currentIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      
      // Update current index if needed
      if (currentIndex === fromIndex) {
        setCurrentIndex(toIndex);
      } else if (currentIndex > fromIndex && currentIndex <= toIndex) {
        setCurrentIndex((i) => i - 1);
      } else if (currentIndex < fromIndex && currentIndex >= toIndex) {
        setCurrentIndex((i) => i + 1);
      }
      
      return newQueue;
    });
  }, [currentIndex]);

  return (
    <AudioQueueContext.Provider
      value={{
        queue,
        currentBeat,
        currentIndex,
        isPlaying,
        isQueueOpen,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playBeat,
        playNext,
        playPrevious,
        togglePlay,
        setIsPlaying,
        setCurrentBeat,
        setIsQueueOpen,
        reorderQueue,
      }}
    >
      {children}
    </AudioQueueContext.Provider>
  );
};

export const useAudioQueue = () => {
  const context = useContext(AudioQueueContext);
  if (context === undefined) {
    throw new Error("useAudioQueue must be used within an AudioQueueProvider");
  }
  return context;
};
