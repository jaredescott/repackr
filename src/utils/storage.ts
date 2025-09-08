import { PackingItem, DailyBoard } from '../types';

const STORAGE_KEYS = {
  MASTER_ITEMS: 'repackr_master_items',
  DAILY_BOARDS: 'repackr_daily_boards',
  VIEW_PREFERENCE: 'repackr_view_preference',
  PACKED_ITEMS: 'repackr_packed_items',
  TUTORIAL_COMPLETED: 'repackr_tutorial_completed'
};

export const loadMasterItems = (): PackingItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.MASTER_ITEMS);
  return stored ? JSON.parse(stored) : [];
};

export const saveMasterItems = (items: PackingItem[]) => {
  localStorage.setItem(STORAGE_KEYS.MASTER_ITEMS, JSON.stringify(items));
};

export const loadDailyBoards = (): DailyBoard[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_BOARDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveDailyBoards = (boards: DailyBoard[]) => {
  localStorage.setItem(STORAGE_KEYS.DAILY_BOARDS, JSON.stringify(boards));
};

export const loadViewPreference = (userId?: string): boolean => {
  const key = userId ? `${STORAGE_KEYS.VIEW_PREFERENCE}_${userId}` : STORAGE_KEYS.VIEW_PREFERENCE;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : false;
};

export const saveViewPreference = (isHorizontal: boolean, userId?: string) => {
  const key = userId ? `${STORAGE_KEYS.VIEW_PREFERENCE}_${userId}` : STORAGE_KEYS.VIEW_PREFERENCE;
  localStorage.setItem(key, JSON.stringify(isHorizontal));
};

// Load and save packed items
export const loadPackedItems = (userId?: string): Record<string, boolean> => {
  const key = userId ? `${STORAGE_KEYS.PACKED_ITEMS}_${userId}` : STORAGE_KEYS.PACKED_ITEMS;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
};

export const savePackedItems = (packedItems: Record<string, boolean>, userId?: string) => {
  const key = userId ? `${STORAGE_KEYS.PACKED_ITEMS}_${userId}` : STORAGE_KEYS.PACKED_ITEMS;
  localStorage.setItem(key, JSON.stringify(packedItems));
};

// Data export/import utilities
export interface TripData {
  masterItems: PackingItem[];
  dailyBoards: DailyBoard[];
  packedItems: Record<string, boolean>;
  version: string;
}

export const exportTripData = (): TripData => {
  return {
    masterItems: loadMasterItems(),
    dailyBoards: loadDailyBoards(),
    packedItems: loadPackedItems(),
    version: '1.1.0' // Updated version for compatibility checks
  };
};

export const importTripData = (data: TripData): boolean => {
  try {
    // Basic validation
    if (!data || !Array.isArray(data.masterItems) || !Array.isArray(data.dailyBoards)) {
      return false;
    }
    
    // Save the imported data
    saveMasterItems(data.masterItems);
    saveDailyBoards(data.dailyBoards);
    
    // Handle packed items (might not exist in older exports)
    if (data.packedItems) {
      savePackedItems(data.packedItems);
    } else {
      // Clear packed items if not in imported data
      localStorage.removeItem(STORAGE_KEYS.PACKED_ITEMS);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing trip data:', error);
    return false;
  }
};

export const clearTripData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.MASTER_ITEMS);
  localStorage.removeItem(STORAGE_KEYS.DAILY_BOARDS);
  localStorage.removeItem(STORAGE_KEYS.PACKED_ITEMS);
};

// Tutorial storage utilities
export const loadTutorialCompleted = (userId?: string): boolean => {
  const key = userId ? `${STORAGE_KEYS.TUTORIAL_COMPLETED}_${userId}` : STORAGE_KEYS.TUTORIAL_COMPLETED;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : false;
};

export const saveTutorialCompleted = (completed: boolean, userId?: string) => {
  const key = userId ? `${STORAGE_KEYS.TUTORIAL_COMPLETED}_${userId}` : STORAGE_KEYS.TUTORIAL_COMPLETED;
  localStorage.setItem(key, JSON.stringify(completed));
}; 