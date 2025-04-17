// Theme configuration for profile components

export function getDesignTokens(mode) {
  return {
    typography: {
      fontFamily: 'Montserrat',
    },
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: "#E9DB5D" },
            text: { primary: "#000" },
          }
        : {
            primary: { main: "#b3cde0" },
            success: { main: "#9FE2BF" },
            text: { primary: '#b3cde0' },
          }),
    },
  };
} 