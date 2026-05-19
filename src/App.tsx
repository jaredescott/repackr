import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Box, Container, Typography, createTheme, ThemeProvider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControlLabel, Switch, Tooltip, IconButton, Menu, MenuItem as MenuOption, Divider, Snackbar, Alert } from '@mui/material';
import { PackingItem, DailyBoard, ItemTotals } from './types';
import MasterList from './components/MasterList';
import DailyBoardComponent from './components/DailyBoard';
import TotalsTable from './components/TotalsTable';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import { loadMasterItems, saveMasterItems, loadDailyBoards, saveDailyBoards, loadViewPreference, saveViewPreference, exportTripData, importTripData, clearTripData, TripData, loadPackedItems, savePackedItems, loadTutorialCompleted, saveTutorialCompleted } from './utils/storage';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HelpIcon from '@mui/icons-material/Help';
import Tutorial from './components/Tutorial';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { UserMenu } from './components/UserMenu';
import { useCloudSync } from './hooks/useCloudSync';
import type { RepackrCloudState } from './types';
import { Box as MuiBox, CircularProgress } from '@mui/material';

const DEFAULT_MASTER_ITEMS: PackingItem[] = [
  { id: '', name: 'T-Shirt', category: 'Clothing', quantity: 1, isReusable: false },
  { id: '', name: 'Socks', category: 'Clothing', quantity: 1, isReusable: false },
  { id: '', name: 'Underwear', category: 'Clothing', quantity: 1, isReusable: false },
  { id: '', name: 'Toothbrush', category: 'Toiletries', quantity: 1, isReusable: true },
  { id: '', name: 'Toothpaste', category: 'Toiletries', quantity: 1, isReusable: true },
  { id: '', name: 'Phone Charger', category: 'Electronics', quantity: 1, isReusable: true },
  { id: '', name: 'Passport', category: 'Documents', quantity: 1, isReusable: true },
].map((item) => ({ ...item, id: uuidv4() }));

const DEFAULT_DAILY_BOARDS: DailyBoard[] = [
  { id: 'day1', title: 'Day 1', items: [] },
  { id: 'day2', title: 'Day 2', items: [] },
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    background: {
      default: '#F1F8E9',
      paper: '#FFFFFF',
    },
  },
  typography: {
    h4: {
      color: '#2E7D32',
      fontWeight: 600,
    },
    h6: {
      color: '#2E7D32',
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        },
      },
    },
  },
});

const categories = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Other'];

function AppContent() {
  const { user, localMode } = useAuth();

  const [masterItems, setMasterItems] = useState<PackingItem[]>(() => {
    const savedItems = loadMasterItems();
    return savedItems.length === 0 ? DEFAULT_MASTER_ITEMS : savedItems;
  });

  const [dailyBoards, setDailyBoards] = useState<DailyBoard[]>(() => {
    const savedBoards = loadDailyBoards();
    return savedBoards.length === 0 ? DEFAULT_DAILY_BOARDS : savedBoards;
  });

  const [itemTotals, setItemTotals] = useState<ItemTotals>({});
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    category: 'Clothing', 
    quantity: 1,
    isReusable: false 
  });
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState('');
  const [isHorizontalView, setIsHorizontalView] = useState<boolean>(() => {
    return loadViewPreference();
  });

  // State for packed items
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>(() => {
    return loadPackedItems();
  });

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return !loadTutorialCompleted();
  });

  // Save to local storage whenever data changes
  useEffect(() => {
    saveMasterItems(masterItems);
  }, [masterItems]);

  useEffect(() => {
    saveDailyBoards(dailyBoards);
  }, [dailyBoards]);

  useEffect(() => {
    saveViewPreference(isHorizontalView);
  }, [isHorizontalView]);

  // Handle horizontal scrolling with mouse wheel
  const handleWheel = (event: WheelEvent) => {
    const container = document.getElementById('days-container');
    if (container && isHorizontalView) {
      event.preventDefault();
      container.scrollLeft += event.deltaY * 4;
    }
  };

  useEffect(() => {
    const container = document.getElementById('days-container');
    if (container && isHorizontalView) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isHorizontalView]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Drop outside a droppable area
    if (!destination) return;

    // Same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Dragging from master list
    if (source.droppableId === 'master-list') {
      const sourceItem = masterItems[source.index];
      const newItem = { ...sourceItem, id: uuidv4() };
      
      const updatedBoards = dailyBoards.map(board => {
        if (board.id === destination.droppableId) {
          const newItems = Array.from(board.items);
          newItems.splice(destination.index, 0, newItem);
          return {
            ...board,
            items: newItems
          };
        }
        return board;
      });

      setDailyBoards(updatedBoards);
      updateTotals(updatedBoards);
      return;
    }

    // Dragging between daily boards
    const sourceBoard = dailyBoards.find(board => board.id === source.droppableId);
    const destBoard = dailyBoards.find(board => board.id === destination.droppableId);

    if (!sourceBoard || !destBoard) return;

    const updatedBoards = dailyBoards.map(board => {
      // Remove from source board
      if (board.id === source.droppableId) {
        const newItems = Array.from(board.items);
        const [movedItem] = newItems.splice(source.index, 1);
        
        // If same board, insert at new position
        if (source.droppableId === destination.droppableId) {
          newItems.splice(destination.index, 0, movedItem);
        }
        
        return {
          ...board,
          items: newItems
        };
      }
      
      // Add to destination board
      if (board.id === destination.droppableId && source.droppableId !== destination.droppableId) {
        const newItems = Array.from(board.items);
        const movedItem = { ...sourceBoard.items[source.index], id: uuidv4() };
        newItems.splice(destination.index, 0, movedItem);
        return {
          ...board,
          items: newItems
        };
      }
      
      return board;
    });

    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  const updateTotals = (boards: DailyBoard[]) => {
    const newTotals: ItemTotals = {};
    const daysUsedCount: { [key: string]: number } = {};
    
    boards.forEach(board => {
      board.items.forEach(item => {
        if (!newTotals[item.name]) {
          newTotals[item.name] = {
            total: 0,
            category: item.category,
            isReusable: item.isReusable,
            daysUsed: 0
          };
        }
        
        // Count unique days this item is used
        if (!daysUsedCount[item.name]) {
          daysUsedCount[item.name] = 0;
        }
        daysUsedCount[item.name]++;

        // For non-reusable items, add up all quantities
        // For reusable items, take the max quantity needed for any day
        if (!item.isReusable) {
          newTotals[item.name].total += item.quantity;
        } else {
          newTotals[item.name].total = Math.max(newTotals[item.name].total, item.quantity);
        }
      });
    });

    // Add days used count to totals
    Object.keys(newTotals).forEach(itemName => {
      newTotals[itemName].daysUsed = daysUsedCount[itemName] || 0;
    });

    setItemTotals(newTotals);
  };

  const applyCloudState = useCallback(
    (cloud: RepackrCloudState) => {
      setMasterItems(cloud.masterItems);
      setDailyBoards(cloud.dailyBoards);
      setPackedItems(cloud.packedItems);
      setIsHorizontalView(cloud.isHorizontalView);
      setShowTutorial(!cloud.tutorialCompleted);
      saveMasterItems(cloud.masterItems);
      saveDailyBoards(cloud.dailyBoards);
      savePackedItems(cloud.packedItems);
      saveViewPreference(cloud.isHorizontalView);
      saveTutorialCompleted(cloud.tutorialCompleted);
      updateTotals(cloud.dailyBoards);
    },
    [],
  );

  const cloudSnapshot = useMemo<RepackrCloudState>(
    () => ({
      masterItems,
      dailyBoards,
      packedItems,
      isHorizontalView,
      tutorialCompleted: !showTutorial,
    }),
    [masterItems, dailyBoards, packedItems, isHorizontalView, showTutorial],
  );

  const cloudReady = useCloudSync(user, localMode, cloudSnapshot, applyCloudState);

  // Calculate initial totals when app loads
  useEffect(() => {
    if (dailyBoards.length > 0) {
      updateTotals(dailyBoards);
    }
  }, []); // Run once on mount

  const handleAddNewItem = () => {
    if (newItem.name.trim()) {
      setMasterItems(prev => [...prev, { ...newItem, id: uuidv4() }]);
      setNewItem({ name: '', category: 'Clothing', quantity: 1, isReusable: false });
      setIsNewItemDialogOpen(false);
    }
  };

  const handleAddNewDay = () => {
    const newDayNumber = dailyBoards.length + 1;
    setDailyBoards(prev => [...prev, {
      id: `day${newDayNumber}`,
      title: `Day ${newDayNumber}`,
      items: []
    }]);
  };

  const handleRemoveItem = (boardId: string, itemId: string) => {
    const updatedBoards = dailyBoards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          items: board.items.filter(item => item.id !== itemId)
        };
      }
      return board;
    });
    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  const handleDayTitleEdit = (boardId: string, newTitle: string) => {
    if (newTitle.trim()) {
      setDailyBoards(prev => prev.map(board => 
        board.id === boardId ? { ...board, title: newTitle } : board
      ));
    }
    setEditingDayId(null);
  };

  const startEditingDay = (boardId: string, currentTitle: string) => {
    setEditingDayId(boardId);
    setEditingDayTitle(currentTitle);
  };

  const handleDayTitleChange = (newTitle: string) => {
    setEditingDayTitle(newTitle);
  };

  const handleDeleteMasterItem = (itemId: string) => {
    // Remove from master list
    setMasterItems(prev => prev.filter(item => item.id !== itemId));
    
    // Remove all instances from daily boards
    const updatedBoards = dailyBoards.map(board => ({
      ...board,
      items: board.items.filter(item => item.name !== masterItems.find(mi => mi.id === itemId)?.name)
    }));
    
    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  const handleDeleteDay = (boardId: string) => {
    setDailyBoards(prev => {
      const updatedBoards = prev.filter(board => board.id !== boardId);
      // Update totals after removing the day
      updateTotals(updatedBoards);
      return updatedBoards;
    });
  };

  const handleSendToBoard = (itemId: string, boardId: string) => {
    const sourceItem = masterItems.find(item => item.id === itemId);
    if (!sourceItem) return;

    const newItem = { ...sourceItem, id: uuidv4() };
    
    const updatedBoards = dailyBoards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          items: [...board.items, newItem]
        };
      }
      return board;
    });

    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  const handleMoveItem = (itemId: string, sourceBoardId: string, targetBoardId: string) => {
    const updatedBoards = dailyBoards.map(board => {
      if (board.id === sourceBoardId) {
        // Remove from source board
        const item = board.items.find(i => i.id === itemId);
        if (!item) return board;
        
        return {
          ...board,
          items: board.items.filter(i => i.id !== itemId)
        };
      }
      if (board.id === targetBoardId) {
        // Add to target board
        const sourceBoard = dailyBoards.find(b => b.id === sourceBoardId);
        if (!sourceBoard) return board;
        
        const item = sourceBoard.items.find(i => i.id === itemId);
        if (!item) return board;

        return {
          ...board,
          items: [...board.items, { ...item, id: uuidv4() }]
        };
      }
      return board;
    });

    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  const handleAddToAllDays = (itemId: string) => {
    const sourceItem = masterItems.find(item => item.id === itemId);
    if (!sourceItem) return;

    const updatedBoards = dailyBoards.map(board => ({
      ...board,
      items: [
        ...board.items,
        { ...sourceItem, id: uuidv4() }
      ]
    }));

    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  const handleUpdateMasterItem = (itemId: string, updates: Partial<PackingItem>) => {
    // Get the old name before updating
    const oldItem = masterItems.find(item => item.id === itemId);
    if (!oldItem) return;
    const oldName = oldItem.name;

    // Update master list
    setMasterItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));

    // Update all instances in daily boards
    const updatedBoards = dailyBoards.map(board => ({
      ...board,
      items: board.items.map(item => {
        // Match by old name to update all instances
        if (item.name === oldName) {
          return { ...item, ...updates };
        }
        return item;
      })
    }));

    setDailyBoards(updatedBoards);
    updateTotals(updatedBoards);
  };

  // Update packed items state and save to localStorage
  const handleTogglePacked = (itemName: string) => {
    const newPackedItems = {
      ...packedItems,
      [itemName]: !packedItems[itemName]
    };
    setPackedItems(newPackedItems);
    savePackedItems(newPackedItems);
  };

  // Toggle all items at once (for batch operations)
  const handleToggleAllPacked = (itemNames: string[], setChecked: boolean) => {
    const newPackedItems = { ...packedItems };
    
    // Update all specified items to the same state (packed or unpacked)
    itemNames.forEach(itemName => {
      newPackedItems[itemName] = setChecked;
    });
    
    // Update state once with all changes
    setPackedItems(newPackedItems);
    savePackedItems(newPackedItems);
  };

  // Export/Import functionality
  const handleExportData = () => {
    try {
      const tripData = exportTripData();
      const dataStr = JSON.stringify(tripData, null, 2);
      
      // Create a download link
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `repackr_trip_${date}.json`;
      
      // Create and click a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      setMenuAnchorEl(null);
      
      setSnackbar({
        open: true,
        message: 'Trip data exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export trip data.',
        severity: 'error'
      });
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setMenuAnchorEl(null);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as TripData;
        
        if (importTripData(data)) {
          // Update state with imported data
          setMasterItems(data.masterItems);
          setDailyBoards(data.dailyBoards);
          updateTotals(data.dailyBoards);
          
          // Update packed items state if present in imported data
          if (data.packedItems) {
            setPackedItems(data.packedItems);
          } else {
            setPackedItems({});
          }
          
          setSnackbar({
            open: true,
            message: 'Trip data imported successfully!',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Invalid trip data format.',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        setSnackbar({
          open: true,
          message: 'Failed to import trip data.',
          severity: 'error'
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleResetData = () => {
    clearTripData();
    setMasterItems(DEFAULT_MASTER_ITEMS.map((item) => ({ ...item, id: uuidv4() })));
    setDailyBoards([...DEFAULT_DAILY_BOARDS]);
    setItemTotals({});
    setPackedItems({});
    setIsResetDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: 'Trip data has been reset.',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tutorial handlers
  const handleTutorialComplete = () => {
    saveTutorialCompleted(true);
    setShowTutorial(false);
    setSnackbar({
      open: true,
      message: 'Tutorial completed! You can restart it anytime from the help menu.',
      severity: 'success'
    });
  };

  const handleTutorialSkip = () => {
    saveTutorialCompleted(true);
    setShowTutorial(false);
    setSnackbar({
      open: true,
      message: 'Tutorial skipped. You can restart it anytime from the help menu.',
      severity: 'success'
    });
  };

  const handleRestartTutorial = () => {
    setShowTutorial(true);
  };

  // Add an effect to save packed items when they change
  useEffect(() => {
    savePackedItems(packedItems);
  }, [packedItems]);

  if (!cloudReady) {
    return (
      <MuiBox display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress color="primary" />
      </MuiBox>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="xl">
                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
               <Typography variant="h4">RePackr</Typography>
               <Box display="flex" gap={2} alignItems="center">
                 <UserMenu />
                 <Box display="flex" gap={2}>
                {/* Help button */}
                <Tooltip title="Start Tutorial">
                  <IconButton 
                    color={showTutorial ? "secondary" : "primary"}
                    onClick={handleRestartTutorial}
                    sx={{
                      ...(showTutorial && {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        },
                      }),
                    }}
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
                
                {/* View toggle buttons */}
                <Tooltip title={isHorizontalView ? "Switch to Grid View" : "Switch to Horizontal View"}>
                  <IconButton 
                    color="primary" 
                    onClick={() => setIsHorizontalView(!isHorizontalView)}
                  >
                    {isHorizontalView ? <ViewModuleIcon /> : <ViewCarouselIcon />}
                  </IconButton>
                </Tooltip>
                
                {/* Add day button */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewDay}
                  data-tutorial="add-day"
                >
                  Add Day
                </Button>
                
                {/* Add item button */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setIsNewItemDialogOpen(true)}
                  data-tutorial="add-item"
                >
                  Add Item
                </Button>
                
                {/* Trip Data Menu */}
                <IconButton 
                  color="primary"
                  onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                  aria-label="Trip Data Options"
                  data-tutorial="menu"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={() => setMenuAnchorEl(null)}
                >
                  <MenuOption 
                    onClick={handleExportData}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <FileDownloadIcon fontSize="small" color="primary" />
                    Export Trip Data
                  </MenuOption>
                  <MenuOption 
                    onClick={handleImportClick}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <FileUploadIcon fontSize="small" color="primary" />
                    Import Trip Data
                  </MenuOption>
                  <Divider />
                  <MenuOption 
                    onClick={() => {
                      setMenuAnchorEl(null);
                      setIsResetDialogOpen(true);
                    }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}
                  >
                    <DeleteForeverIcon fontSize="small" color="error" />
                    Reset All Data
                  </MenuOption>
                                 </Menu>
               </Box>
               </Box>
             </Box>

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept=".json"
              style={{ display: 'none' }}
            />
            
            <Box display="flex" gap={3}>
              <Box width="280px" data-tutorial="master-list">
                <MasterList 
                  items={masterItems} 
                  onDeleteItem={handleDeleteMasterItem}
                  dailyBoards={dailyBoards}
                  onSendToBoard={handleSendToBoard}
                  onAddToAllDays={handleAddToAllDays}
                  onUpdateItem={handleUpdateMasterItem}
                />
              </Box>
              
              <Box 
                id="days-container"
                data-tutorial="daily-boards"
                flex={1} 
                sx={{
                  display: 'flex',
                  gap: 3,
                  ...(isHorizontalView ? {
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    pb: 2,
                    '&::-webkit-scrollbar': {
                      height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#888',
                      borderRadius: 4,
                      '&:hover': {
                        backgroundColor: '#666',
                      },
                    },
                    scrollBehavior: 'smooth',
                  } : {
                    flexWrap: 'wrap',
                  })
                }}
              >
                {dailyBoards.map(board => (
                  <DailyBoardComponent 
                    key={board.id} 
                    board={board}
                    onRemoveItem={(itemId) => handleRemoveItem(board.id, itemId)}
                    onDeleteDay={() => handleDeleteDay(board.id)}
                    isEditing={editingDayId === board.id}
                    editingTitle={editingDayTitle}
                    onStartEdit={() => startEditingDay(board.id, board.title)}
                    onSaveEdit={(newTitle) => handleDayTitleEdit(board.id, newTitle)}
                    onCancelEdit={() => setEditingDayId(null)}
                    onTitleChange={handleDayTitleChange}
                    dailyBoards={dailyBoards}
                    onMoveItem={handleMoveItem}
                  />
                ))}
              </Box>
            </Box>

            <Box mt={4} data-tutorial="totals">
              <TotalsTable 
                totals={itemTotals} 
                packedItems={packedItems}
                onTogglePacked={handleTogglePacked}
                onToggleAllPacked={handleToggleAllPacked}
              />
            </Box>

            {/* Reset Confirmation Dialog */}
            <Dialog
              open={isResetDialogOpen}
              onClose={() => setIsResetDialogOpen(false)}
            >
              <DialogTitle>Reset All Trip Data?</DialogTitle>
              <DialogContent>
                <Typography>
                  This will permanently delete all your current trip data and reset to the default empty state.
                  You might want to export your data first before resetting.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleResetData} color="error" variant="contained">
                  Reset Data
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar 
              open={snackbar.open} 
              autoHideDuration={6000} 
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                onClose={handleSnackbarClose} 
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </DragDropContext>

      {/* Tutorial Component */}
      <Tutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onSkip={handleTutorialSkip}
        onComplete={handleTutorialComplete}
      />

      <Dialog open={isNewItemDialogOpen} onClose={() => setIsNewItemDialogOpen(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={newItem.category}
              onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Unit Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              fullWidth
              inputProps={{ min: 1 }}
              helperText="Number of units of this item"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newItem.isReusable}
                  onChange={(e) => setNewItem(prev => ({ ...prev, isReusable: e.target.checked }))}
                  color="primary"
                />
              }
              label="Item can be reused across multiple days"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewItem} variant="contained" color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

function AppGate() {
  const { user, localMode, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MuiBox display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress color="primary" />
      </MuiBox>
    );
  }

  if (!user && !localMode) {
    return (
      <ThemeProvider theme={theme}>
        <AuthScreen />
      </ThemeProvider>
    );
  }

  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

export default App; 