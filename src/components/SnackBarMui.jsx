import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SnackBarMui = React.forwardRef((props, ref) => {
  const {
    message = "",
    severity = "info",
    duration = 5000,
    position = { vertical: "bottom", horizontal: "left" },
    showCloseButton = true,
    variant = "filled",
    elevation = 6,
    onOpen,
    onClose,
    children,
    autoShow = true, // Automatically show when message changes
    ...snackbarProps
  } = props;

  const [open, setOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(message);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState(severity);

  // Effect to automatically show snackbar when message prop changes
  React.useEffect(() => {
    if (message && autoShow) {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setOpen(true);
      onOpen?.();
    }
  }, [message, severity, autoShow, onOpen]);

  // Effect to handle external open state changes
  React.useEffect(() => {
    if (props.open !== undefined) {
      setOpen(props.open);
    }
  }, [props.open]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    show: (msg = message, sev = severity) => {
      setSnackbarMessage(msg);
      setSnackbarSeverity(sev);
      setOpen(true);
      onOpen?.();
    },
    hide: () => {
      setOpen(false);
    },
    updateMessage: (msg) => {
      setSnackbarMessage(msg);
    },
    updateSeverity: (sev) => {
      setSnackbarSeverity(sev);
    },
  }));

  const handleClose = (event, reason) => {
    if (reason === "clickaway" && !props.closeOnClickAway) {
      return;
    }
    setOpen(false);
    onClose?.(event, reason);
  };

  const handleExited = () => {
    // Clear message when snackbar fully closes
    if (props.clearOnClose) {
      setSnackbarMessage("");
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      onExited={handleExited}
      anchorOrigin={position}
      {...snackbarProps}
    >
      <Alert
        elevation={elevation}
        onClose={showCloseButton ? handleClose : null}
        severity={snackbarSeverity}
        variant={variant}
        sx={{ width: "100%" }}
      >
        {children || snackbarMessage}
      </Alert>
    </Snackbar>
  );
});

// Hook for easy usage with state management
export const useSnackbar = (initialState = {}) => {
  const [snackbarState, setSnackbarState] = React.useState({
    message: "",
    severity: "info",
    open: false,
    ...initialState,
  });

  const show = React.useCallback((message, severity = "info") => {
    setSnackbarState({
      message,
      severity,
      open: true,
    });
  }, []);

  const hide = React.useCallback(() => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  }, []);

  const update = React.useCallback((updates) => {
    setSnackbarState((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    snackbarState,
    setSnackbarState,
    show,
    hide,
    update,
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error"),
    warning: (message) => show(message, "warning"),
    info: (message) => show(message, "info"),
  };
};

// Pre-configured variants for common use cases
export const SuccessSnackbar = React.forwardRef((props, ref) => (
  <SnackBarMui ref={ref} severity="success" {...props} />
));

export const ErrorSnackbar = React.forwardRef((props, ref) => (
  <SnackBarMui ref={ref} severity="error" {...props} />
));

export const WarningSnackbar = React.forwardRef((props, ref) => (
  <SnackBarMui ref={ref} severity="warning" {...props} />
));

export const InfoSnackbar = React.forwardRef((props, ref) => (
  <SnackBarMui ref={ref} severity="info" {...props} />
));

export default SnackBarMui;
