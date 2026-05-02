import {
  Music2,
  Mic2,
  Headphones,
  Music,
  Disc3,
  Radio,
  Sliders,
  Volume2,
  Guitar,
  Piano,
  Drum,
  Speaker,
  AudioLines,
  AudioWaveform,
  Flame,
  Star,
  Sparkles,
  Rocket,
  Crown,
  Trophy,
  Award,
  Heart,
  Zap,
  DollarSign,
  CreditCard,
  Wallet,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  MapPin,
  Users,
  User,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Centralized icon mapping. Resolves any incoming string (emoji, slug,
 * lucide name) to a single lucide-react component so the UI never falls
 * back to emoji glyphs.
 */
const EMOJI_MAP: Record<string, LucideIcon> = {
  // Music / studio
  "🎵": Music2,
  "🎶": Music,
  "🎤": Mic2,
  "🎙️": Mic2,
  "🎙": Mic2,
  "🎧": Headphones,
  "🎚️": Sliders,
  "🎚": Sliders,
  "🎛️": Sliders,
  "🎛": Sliders,
  "🔊": Volume2,
  "📢": Speaker,
  "🎸": Guitar,
  "🎹": Piano,
  "🥁": Drum,
  "💿": Disc3,
  "📀": Disc3,
  "📻": Radio,
  "🎼": AudioLines,
  "〰️": AudioWaveform,
  // Affect / status
  "🔥": Flame,
  "⭐": Star,
  "✨": Sparkles,
  "🚀": Rocket,
  "👑": Crown,
  "🏆": Trophy,
  "🥇": Award,
  "❤️": Heart,
  "💖": Heart,
  "⚡": Zap,
  "✅": CheckCircle2,
  // Money / contact / location
  "💰": DollarSign,
  "💵": DollarSign,
  "💳": CreditCard,
  "👛": Wallet,
  "📞": Phone,
  "☎️": Phone,
  "📧": Mail,
  "✉️": Mail,
  "💬": MessageSquare,
  "🌍": Globe,
  "🌎": Globe,
  "🌏": Globe,
  "📍": MapPin,
  "👥": Users,
  "👤": User,
  "💼": Briefcase,
  "📅": Calendar,
  "🕐": Clock,
  "⚙️": Settings,
};

const NAME_MAP: Record<string, LucideIcon> = {
  music: Music2,
  music2: Music2,
  mic: Mic2,
  microphone: Mic2,
  vocal: Mic2,
  vocals: Mic2,
  recording: Mic2,
  headphones: Headphones,
  mixing: Sliders,
  mastering: AudioLines,
  production: Sliders,
  beat: Disc3,
  beats: Disc3,
  disc: Disc3,
  radio: Radio,
  guitar: Guitar,
  piano: Piano,
  drum: Drum,
  drums: Drum,
  speaker: Speaker,
  audio: AudioLines,
  waveform: AudioWaveform,
  fire: Flame,
  hot: Flame,
  trending: Flame,
  star: Star,
  featured: Star,
  sparkles: Sparkles,
  new: Sparkles,
  rocket: Rocket,
  launch: Rocket,
  crown: Crown,
  premium: Crown,
  trophy: Trophy,
  award: Award,
  heart: Heart,
  favorite: Heart,
  zap: Zap,
  fast: Zap,
  check: CheckCircle2,
  done: CheckCircle2,
  money: DollarSign,
  price: DollarSign,
  card: CreditCard,
  wallet: Wallet,
  phone: Phone,
  call: Phone,
  mail: Mail,
  email: Mail,
  chat: MessageSquare,
  message: MessageSquare,
  globe: Globe,
  world: Globe,
  location: MapPin,
  pin: MapPin,
  users: Users,
  user: User,
  briefcase: Briefcase,
  business: Briefcase,
  calendar: Calendar,
  clock: Clock,
  time: Clock,
  settings: Settings,
};

/**
 * Resolve a free-form string from data (DB, CMS, user input) to a Lucide
 * icon component. Returns the provided fallback (default Music2) when no
 * match is found, so the UI is always icon-only and never emoji.
 */
export const resolveIcon = (
  value?: string | null,
  fallback: LucideIcon = Music2,
): LucideIcon => {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (EMOJI_MAP[trimmed]) return EMOJI_MAP[trimmed];
  // strip common variation selector and try again
  const stripped = trimmed.replace(/\uFE0F/g, "");
  if (EMOJI_MAP[stripped]) return EMOJI_MAP[stripped];
  const key = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (NAME_MAP[key]) return NAME_MAP[key];
  return fallback;
};

interface DataIconProps extends React.SVGAttributes<SVGSVGElement> {
  value?: string | null;
  fallback?: LucideIcon;
  className?: string;
}

/**
 * Render a Lucide icon for any data-driven string value. Guarantees a
 * lucide-react SVG is rendered, never an emoji.
 */
export const DataIcon = ({ value, fallback, className, ...rest }: DataIconProps) => {
  const Icon = resolveIcon(value, fallback);
  return <Icon className={className} {...rest} />;
};