"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider enableColorScheme={false} {...props}>
      {children}
    </NextThemesProvider>
  );
}
