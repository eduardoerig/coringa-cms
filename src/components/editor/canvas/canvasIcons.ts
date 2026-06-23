// Biblioteca de ícones disponíveis para o elemento "Ícone" da Tela Livre.
// Usado pelo registry (opções do select) e pelo renderer (nome → componente).
import {
  Star, Heart, Check, CheckCircle2, ArrowRight, ChevronRight, Phone, Mail, MapPin,
  Clock, Calendar, MessageCircle, Send, ShoppingCart, ShoppingBag, Globe, Camera,
  Tag, Gift, Truck, Shield, Award, ThumbsUp, Smile, Zap, Flame, Coffee, Utensils, Sparkles, Sun,
} from "lucide-react";

type IconComp = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

export const CANVAS_ICONS: Record<string, IconComp> = {
  Star, Heart, Check, CheckCircle2, ArrowRight, ChevronRight, Phone, Mail, MapPin,
  Clock, Calendar, MessageCircle, Send, ShoppingCart, ShoppingBag, Globe, Camera,
  Tag, Gift, Truck, Shield, Award, ThumbsUp, Smile, Zap, Flame, Coffee, Utensils, Sparkles, Sun,
};

export const CANVAS_ICON_OPTIONS = Object.keys(CANVAS_ICONS).map((k) => ({ value: k, label: k }));
