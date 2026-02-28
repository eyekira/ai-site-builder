import {
  DM_Sans,
  Inter,
  Lora,
  Manrope,
  Merriweather,
  Nunito,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const playfairDisplay = Playfair_Display({ subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });
const nunito = Nunito({ subsets: ['latin'] });
const dmSans = DM_Sans({ subsets: ['latin'] });
const lora = Lora({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const FONT_CLASS_BY_KEY = {
  inter: inter.className,
  playfair_display: playfairDisplay.className,
  manrope: manrope.className,
  nunito: nunito.className,
  dm_sans: dmSans.className,
  lora: lora.className,
  poppins: poppins.className,
  merriweather: merriweather.className,
  space_grotesk: spaceGrotesk.className,
} as const;
