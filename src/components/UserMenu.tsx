import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function UserMenu() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated || !user) return null;

  const name = user.displayName ?? 'Signed in';
  const email = user.email ?? '';
  const photo = user.photoURL ?? undefined;

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Tooltip title={email}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={photo} alt={name} sx={{ width: 32, height: 32 }} />
          <Typography
            variant="body2"
            sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', display: { xs: 'none', sm: 'block' } }}
          >
            {name}
          </Typography>
        </Box>
      </Tooltip>
      <Button variant="outlined" size="small" onClick={() => void signOut()}>
        Sign out
      </Button>
    </Box>
  );
}
