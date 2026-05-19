export interface PackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isReusable: boolean;
}

export interface DailyBoard {
  id: string;
  title: string;
  items: PackingItem[];
}

export interface BagBoard {
  id: string;
  name: string;
  items: PackingItem[];
}

export interface ItemTotals {
  [itemName: string]: {
    total: number;
    category: string;
    isReusable: boolean;
    daysUsed: number;
  };
}

export interface RepackrCloudState {
  masterItems: PackingItem[];
  dailyBoards: DailyBoard[];
  packedItems: Record<string, boolean>;
  isHorizontalView: boolean;
  tutorialCompleted: boolean;
} 