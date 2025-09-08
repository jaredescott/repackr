import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  SkipNext as SkipNextIcon,
} from '@mui/icons-material';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RePackr!',
    content: 'RePackr helps you plan and organize your travel packing. Let\'s take a quick tour to get you started.',
  },
  {
    id: 'master-list',
    title: 'Item Library',
    content: 'This is your item library where you can add and manage all your packing items. You can then assign them to specific days of your trip.',
    targetSelector: '[data-tutorial="master-list"]',
    position: 'right',
  },
  {
    id: 'add-item',
    title: 'Add Items',
    content: 'Click "Add Item" to create new items for your packing list. You can specify the category, quantity, and whether the item is reusable.',
    targetSelector: '[data-tutorial="add-item"]',
    position: 'bottom',
  },
  {
    id: 'daily-boards',
    title: 'Daily Boards',
    content: 'These are your daily packing boards. Each board represents a day of your trip. You can drag items from the master list to specific days.',
    targetSelector: '[data-tutorial="daily-boards"]',
    position: 'bottom',
  },
  {
    id: 'add-day',
    title: 'Add Days',
    content: 'Click "Add Day" to create new daily boards for your trip. You can have as many days as you need.',
    targetSelector: '[data-tutorial="add-day"]',
    position: 'bottom',
  },
  {
    id: 'drag-drop',
    title: 'Drag & Drop',
    content: 'You can drag items between days or from the master list to any day. Items can also be moved between different days.',
    targetSelector: '[data-tutorial="daily-boards"]',
    position: 'top',
  },
  {
    id: 'totals',
    title: 'Packing Totals',
    content: 'The totals table shows you how many of each item you\'ll need for your entire trip. You can also mark items as packed.',
    targetSelector: '[data-tutorial="totals"]',
    position: 'top',
  },
  {
    id: 'data-management',
    title: 'Data Management',
    content: 'Use the menu button to export your trip data, import previous trips, or reset all data. Your data is automatically saved locally.',
    targetSelector: '[data-tutorial="menu"]',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'You now know the basics of RePackr! Start by adding some items to your master list and creating your first daily board. Happy packing!',
  },
];

const Tutorial: React.FC<TutorialProps> = ({ open, onClose, onSkip, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (open && activeStep < tutorialSteps.length) {
      const step = tutorialSteps[activeStep];
      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setHighlightedElement(null);
      }
    }
  }, [open, activeStep]);

  const handleNext = () => {
    if (activeStep === tutorialSteps.length - 1) {
      onComplete();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };

  const handleSkip = () => {
    onSkip();
  };

  const currentStep = tutorialSteps[activeStep];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'relative',
            zIndex: 1400,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              {currentStep.title}
            </Typography>
            <Box>
              <Tooltip title="Skip Tutorial">
                <IconButton onClick={handleSkip} size="small">
                  <SkipNextIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mb={3}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {tutorialSteps.map((step) => (
                <Step key={step.id}>
                  <StepLabel>{step.title}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="body1" paragraph>
              {currentStep.content}
            </Typography>
          </Paper>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          <Button onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
          >
            {activeStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Highlight overlay for targeted elements */}
      {highlightedElement && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
            pointerEvents: 'none',
          }}
        >
                     <Box
             sx={{
               position: 'absolute',
               border: '3px solid #2196F3',
               borderRadius: '8px',
               boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
               animation: 'pulse 2s infinite',
               '@keyframes pulse': {
                 '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)' },
                 '70%': { boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)' },
                 '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' },
               },
             }}
            style={{
              top: highlightedElement.offsetTop - 4,
              left: highlightedElement.offsetLeft - 4,
              width: highlightedElement.offsetWidth + 8,
              height: highlightedElement.offsetHeight + 8,
            }}
          />
        </Box>
      )}
    </>
  );
};

export default Tutorial;
