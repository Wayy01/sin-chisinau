import { Cormorant, Onest, JetBrains_Mono, Marck_Script } from "next/font/google";

export const cormorant = Cormorant({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-onest",
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const marck = Marck_Script({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "400",
  variable: "--font-marck",
  display: "swap",
});

export const fontVariables = [cormorant, onest, jetbrains, marck].map((f) => f.variable).join(" ");
