import React from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CustomModal = ({ isOpen, onClose, children }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={modalContentStyle}>
        <IconButton
          sx={closeButtonStyle}
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        {children}
      </Box>
    </Modal>
  );
};

// MUI styles for modal content
const modalContentStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '900px',
  width: '80%',
  overflowY: 'scroll',
  maxHeight: '90vh',
  boxShadow: 24, // This is the shadow effect
};

const closeButtonStyle = {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'red',
  color: 'white',
};

export default CustomModal;
