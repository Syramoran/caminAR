import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // --- Roles de color principales ---
    primary: '#06543a',       // Tu verde oscuro para elementos interactivos principales.
    onPrimary: '#FFFFFF',     // Texto sobre fondos primarios (ej. en el header de perfil).
    
    secondary: '#bed77c',     // Tu verde claro para acentos y elementos secundarios.
    onSecondary: '#404244',   // Texto sobre fondos secundarios (como en el Chip "Tú").
    
    tertiary: '#dd6f3f',      // Tu color naranja para otros acentos.

    // --- Roles de fondo y superficie ---
    background: '#e8d2ce',    // El color de fondo GENERAL de tus pantallas.
    onBackground: '#404244',  // El color del texto que va sobre el fondo general.

    surface: '#FFFFFF',       // El color de fondo de los componentes "elevados" como Cards, Menús, etc.
    onSurface: '#404244',     // El color de texto principal que va sobre las Cards.
    onSurfaceVariant: '#555555', // Un color de texto más suave para subtítulos.

    // --- Otros roles ---
    outline: '#CCCCCC',       // Color para bordes o divisores.
  },
};