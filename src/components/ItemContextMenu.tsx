import React, { useState } from 'react';
import { 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { DailyBoard, PackingItem } from '../types';

const categories = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Other'];

interface ItemContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  boards: DailyBoard[];
  onSendToBoard: (boardId: string) => void;
  onAddToAllDays: () => void;
  item: PackingItem | null;
  onUpdateItem: (itemId: string, updates: Partial<PackingItem>) => void;
}

const ItemContextMenu = ({
  open,
  anchorPosition,
  onClose,
  boards,
  onSendToBoard,
  onAddToAllDays,
  item,
  onUpdateItem,
}: ItemContextMenuProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingQuantity, setEditingQuantity] = useState(1);
  const [editingReusable, setEditingReusable] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);

  const handleOpenEditDialog = () => {
    if (item) {
      setEditingItem(item);
      setEditingName(item.name);
      setEditingCategory(item.category);
      setEditingQuantity(item.quantity);
      setEditingReusable(item.isReusable);
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingItem && editingName.trim()) {
      onUpdateItem(editingItem.id, {
        name: editingName.trim(),
        category: editingCategory,
        quantity: editingQuantity,
        isReusable: editingReusable
      });
    }
    setEditDialogOpen(false);
    setEditingItem(null);
    onClose();
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingName.trim()) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCloseDialog();
    }
  };

  return (
    <>
      <Menu
        open={open}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition ? {
          top: anchorPosition.top,
          left: anchorPosition.left,
        } : undefined}
      >
        <MenuItem
          onClick={() => {
            handleOpenEditDialog();
            onClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit Properties" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onAddToAllDays();
            onClose();
          }}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Add to All Days" />
        </MenuItem>
        <Divider />
        <MenuItem disabled sx={{ opacity: 0.7 }}>
          <ListItemText>Send to board:</ListItemText>
        </MenuItem>
        {boards.map((board) => (
          <MenuItem
            key={board.id}
            onClick={() => {
              onSendToBoard(board.id);
              onClose();
            }}
          >
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{board.title}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Item Properties</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Item Name"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyPress}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="Category"
              value={editingCategory}
              onChange={(e) => setEditingCategory(e.target.value)}
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
              value={editingQuantity}
              onChange={(e) => setEditingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
              InputProps={{ inputProps: { min: 1 } }}
              helperText="Number of units of this item"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editingReusable}
                  onChange={(e) => setEditingReusable(e.target.checked)}
                  color="primary"
                />
              }
              label="Item can be reused across multiple days"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
            disabled={!editingName.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ItemContextMenu; 