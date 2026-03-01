import {
  Cormorant,
  DM_Sans,
  DM_Serif_Display,
  Inter,
  Lora,
  Manrope,
  Merriweather,
  Montserrat,
  Nunito,
  Playfair_Display,
  Poppins,
  Roboto_Slab,
  Source_Sans_3,
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
const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });
const cormorant = Cormorant({ subsets: ['latin'], weight: ['400', '600'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '600', '700'] });
const robotoSlab = Roboto_Slab({ subsets: ['latin'], weight: ['400', '700'] });
const dmSerifDisplay = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

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
  source_sans_3: sourceSans3.className,
  cormorant: cormorant.className,
  montserrat: montserrat.className,
  roboto_slab: robotoSlab.className,
  dm_serif_display: dmSerifDisplay.className,
} as const;
