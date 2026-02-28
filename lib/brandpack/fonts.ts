import { DM_Sans, Inter, Lora, Manrope, Nunito, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const playfairDisplay = Playfair_Display({ subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });
const nunito = Nunito({ subsets: ['latin'] });
const dmSans = DM_Sans({ subsets: ['latin'] });
const lora = Lora({ subsets: ['latin'] });

export const FONT_CLASS_BY_KEY = {
  inter: inter.className,
  playfair_display: playfairDisplay.className,
  manrope: manrope.className,
  nunito: nunito.className,
  dm_sans: dmSans.className,
  lora: lora.className,
} as const;
