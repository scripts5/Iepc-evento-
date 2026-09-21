import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EventConfig } from '../types/index.ts';
import { api } from '../services/api.ts';
import { defaultEventData } from '../data/defaultEvent.ts';

interface EventContextType {
  event: EventConfig & { registeredCount: number; isCapacityFull: boolean };
  loading: boolean;
  error: string | null;
  refreshEvent: () => Promise<void>;
  updateEvent: (data: Partial<EventConfig>) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with defaultEventData so UI is never blocked by "evento temporariamente indisponível"
  const [event, setEvent] = useState<EventConfig & { registeredCount: number; isCapacityFull: boolean }>(defaultEventData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPublicEvent();
      if (data && data.name) {
        setEvent(data);
      }
    } catch (err: any) {
      console.warn('Could not refresh event from API, using cached/default event data:', err);
      setError(err.message || 'Falha ao sincronizar dados em tempo real.');
      // Keep event as defaultEventData or existing event, NEVER null
      setEvent(prev => prev || defaultEventData);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = async (data: Partial<EventConfig>) => {
    await api.updateEventConfig(data);
    await refreshEvent();
  };

  useEffect(() => {
    refreshEvent();
  }, [refreshEvent]);

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
