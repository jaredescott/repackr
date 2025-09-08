import React, { useState } from 'react';
import { Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  IconButton, 
  Button,
  Box,
  Tooltip,
  Chip
} from '@mui/material';
import { PackingItem, DailyBoard } from '../types';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../constants/colors';
import ItemContextMenu from './ItemContextMenu';

interface MasterListProps {
  items: PackingItem[];
  onDeleteItem: (itemId: string) => void;
  dailyBoards: DailyBoard[];
  onSendToBoard: (itemId: string, boardId: string) => void;
  onAddToAllDays: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<PackingItem>) => void;
}

const MasterList = ({ 
  items, 
  onDeleteItem, 
  dailyBoards, 
  onSendToBoard,
  onAddToAllDays,
  onUpdateItem
}: MasterListProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      itemId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <Paper 
      sx={{ 
        p: 2,
        height: '100%',
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'auto',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        },
        transition: 'box-shadow 0.3s ease-in-out'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FormatListBulletedIcon color="primary" />
          <Typography variant="h6">Item Library</Typography>
        </Box>
        <Tooltip title={isCollapsed ? "Show items" : "Hide items"}>
          <Button 
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? 'Show' : 'Hide'}
          </Button>
        </Tooltip>
      </Box>

      {!isCollapsed && (
        <Droppable droppableId="master-list" isDropDisabled={true}>
          {(provided: DroppableProvided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ 
                minHeight: 100,
                bgcolor: '#F8FBF3',
                borderRadius: 1,
                p: 1
              }}
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                >
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: 8
                      }}
                    >
                      <ListItem
                        {...provided.dragHandleProps}
                        onContextMenu={(e) => handleContextMenu(e, item.id)}
                        sx={{
                          border: '1px solid #E8F5E9',
                          borderRadius: 2,
                          bgcolor: item.isReusable 
                            ? (snapshot.isDragging ? COLORS.REUSABLE_ITEM_HOVER : COLORS.REUSABLE_ITEM_BG)
                            : (snapshot.isDragging ? COLORS.NON_REUSABLE_ITEM_HOVER : COLORS.NON_REUSABLE_ITEM_BG),
                          '&:hover': {
                            bgcolor: item.isReusable ? COLORS.REUSABLE_ITEM_HOVER : COLORS.NON_REUSABLE_ITEM_HOVER,
                          },
                          transition: 'all 0.2s ease-in-out',
                          padding: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'grab',
                          '&:active': {
                            cursor: 'grabbing'
                          }
                        }}
                      >
                        <DragIndicatorIcon color="action" sx={{ opacity: 0.5 }} />
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{item.name}</Typography>
                          {item.quantity > 1 && (
                            <Chip 
                              label={`×${item.quantity}`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Tooltip title="Delete item">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      )}

      <ItemContextMenu
        open={Boolean(contextMenu)}
        anchorPosition={
          contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : null
        }
        onClose={handleCloseContextMenu}
        boards={dailyBoards}
        item={contextMenu ? items.find(item => item.id === contextMenu.itemId) || null : null}
        onSendToBoard={(boardId) => {
          if (contextMenu) {
            onSendToBoard(contextMenu.itemId, boardId);
          }
        }}
        onAddToAllDays={() => {
          if (contextMenu) {
            onAddToAllDays(contextMenu.itemId);
          }
        }}
        onUpdateItem={onUpdateItem}
      />
    </Paper>
  );
};

export default MasterList; 