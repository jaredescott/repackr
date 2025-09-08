import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Avatar, Tooltip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const GoogleSignIn: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Only proceed if not authenticated
    if (isAuthenticated) return;

    const initializeGoogleSignIn = () => {
      if (!buttonRef.current) return;

      try {
        // Clear any existing content
        buttonRef.current.innerHTML = '';

        // Initialize Google Sign-In
        (window as any).google.accounts.id.initialize({
          client_id: '53651215478-1e2gmm1ars4l5648od3mg2t51rf4b7bp.apps.googleusercontent.com',
          callback: (response: any) => {
            console.log('Google Sign-In Response:', response);
            if (response.credential) {
              const payload = JSON.parse(atob(response.credential.split('.')[1]));
              console.log('Decoded payload:', payload);
            }
          },
        });

        // Render the button
        (window as any).google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 250,
          logo_alignment: 'left',
        });

        console.log('Google Sign-In button rendered');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };

    // Check if Google API is loaded
    const checkGoogleApi = () => {
      return typeof window !== 'undefined' && (window as any).google?.accounts?.id;
    };

    // If Google API is already loaded
    if (checkGoogleApi()) {
      setScriptLoaded(true);
      initializeGoogleSignIn();
      return;
    }

    // Wait for Google API to load
    const timer = setInterval(() => {
      if (checkGoogleApi()) {
        clearInterval(timer);
        setScriptLoaded(true);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isAuthenticated, scriptLoaded]);

  if (isAuthenticated && user) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Tooltip title={user.email}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar 
              src={user.imageUrl} 
              alt={user.name}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </Typography>
          </Box>
        </Tooltip>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={signOut}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Sign in to save your data
      </Typography>
      <div ref={buttonRef} style={{ minHeight: '40px' }}></div>
    </Box>
  );
};

export default GoogleSignIn;
