import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventConfig } from '../types/index.ts';
import { api } from '../services/api.ts';

interface EventContextType {
  event: (EventConfig & { registeredCount: number; isCapacityFull: boolean }) | null;
  loading: boolean;
  error: string | null;
  refreshEvent: () => Promise<void>;
  updateEvent: (data: Partial<EventConfig>) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [event, setEvent] = useState<(EventConfig & { registeredCount: number; isCapacityFull: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPublicEvent();
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar dados do evento.');
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (data: Partial<EventConfig>) => {
    await api.updateEventConfig(data);
    await refreshEvent();
  };

  useEffect(() => {
    refreshEvent();
  }, []);

  return (
    <EventContext.Provider value={{ event, loading, error, refreshEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
