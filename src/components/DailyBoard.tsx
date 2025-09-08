import React, { useState } from 'react';
import { Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem,
  IconButton,
  Box,
  Tooltip,
  TextField,
  ClickAwayListener
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { DailyBoard } from '../types';
import { COLORS } from '../constants/colors';
import DayItemContextMenu from './DayItemContextMenu';

interface DailyBoardProps {
  board: DailyBoard;
  onRemoveItem: (itemId: string) => void;
  onDeleteDay: () => void;
  isEditing: boolean;
  editingTitle: string;
  onStartEdit: () => void;
  onSaveEdit: (newTitle: string) => void;
  onCancelEdit: () => void;
  onTitleChange: (newTitle: string) => void;
  dailyBoards: DailyBoard[];
  onMoveItem: (itemId: string, sourceBoardId: string, targetBoardId: string) => void;
}

const DailyBoardComponent = ({ 
  board, 
  onRemoveItem,
  onDeleteDay,
  isEditing,
  editingTitle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTitleChange,
  dailyBoards,
  onMoveItem
}: DailyBoardProps) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit(editingTitle);
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 2,
        width: 300,
        minWidth: 300,
        minHeight: 400,
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        },
        transition: 'box-shadow 0.3s ease-in-out'
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CalendarTodayIcon color="primary" />
        {isEditing ? (
          <ClickAwayListener onClickAway={onCancelEdit}>
            <TextField
              value={editingTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={handleKeyPress}
              variant="standard"
              autoFocus
              fullWidth
              sx={{ mr: 2 }}
            />
          </ClickAwayListener>
        ) : (
          <>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {board.title}
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Edit day name">
                <IconButton size="small" onClick={onStartEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete day">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={onDeleteDay}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>

      <Droppable droppableId={board.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <List
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{ 
              minHeight: 300,
              bgcolor: snapshot.isDraggingOver ? '#E8F5E9' : '#F8FBF3',
              borderRadius: 1,
              p: 1,
              transition: 'background-color 0.2s ease-in-out'
            }}
          >
            {board.items.map((item, index) => (
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
                      <Typography sx={{ flex: 1 }}>{item.name}</Typography>
                      <Tooltip title="Remove item">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => onRemoveItem(item.id)}
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

      <DayItemContextMenu
        open={Boolean(contextMenu)}
        anchorPosition={
          contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : null
        }
        onClose={handleCloseContextMenu}
        boards={dailyBoards}
        currentBoardId={board.id}
        onSendToBoard={(targetBoardId) => {
          if (contextMenu) {
            onMoveItem(contextMenu.itemId, board.id, targetBoardId);
          }
        }}
        onDelete={() => {
          if (contextMenu) {
            onRemoveItem(contextMenu.itemId);
          }
        }}
      />
    </Paper>
  );
};

export default DailyBoardComponent; 