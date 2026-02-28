import { DM_Sans, Inter, Lora, Manrope, Nunito, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const FONT_MAP = {
  inter,
  playfair_display: playfairDisplay,
  manrope,
  nunito,
  dm_sans: dmSans,
  lora,
} as const;

export const FONT_CLASS_BY_KEY: Record<keyof typeof FONT_MAP, string> = {
  inter: 'font-[var(--font-inter)]',
  playfair_display: 'font-[var(--font-playfair)]',
  manrope: 'font-[var(--font-manrope)]',
  nunito: 'font-[var(--font-nunito)]',
  dm_sans: 'font-[var(--font-dm-sans)]',
  lora: 'font-[var(--font-lora)]',
};

export const ALL_FONT_VARIABLES = [
  inter.variable,
  playfairDisplay.variable,
  manrope.variable,
  nunito.variable,
  dmSans.variable,
  lora.variable,
].join(' ');
