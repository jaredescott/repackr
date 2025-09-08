import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { DailyBoard } from '../types';

interface DayItemContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  boards: DailyBoard[];
  currentBoardId: string;
  onSendToBoard: (boardId: string) => void;
  onDelete: () => void;
}

const DayItemContextMenu = ({
  open,
  anchorPosition,
  onClose,
  boards,
  currentBoardId,
  onSendToBoard,
  onDelete,
}: DayItemContextMenuProps) => {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ? {
        top: anchorPosition.top,
        left: anchorPosition.left,
      } : undefined}
    >
      <MenuItem disabled sx={{ opacity: 0.7 }}>
        <ListItemText>Move to board:</ListItemText>
      </MenuItem>
      {boards
        .filter(board => board.id !== currentBoardId)
        .map((board) => (
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
      <Divider />
      <MenuItem 
        onClick={() => {
          onDelete();
          onClose();
        }}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Delete Item</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default DayItemContextMenu; 