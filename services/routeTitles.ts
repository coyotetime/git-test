import { DestinationCategory } from '@/constants/destinations';
import { VibeOption } from '@/constants/options';

function cleanDestinationName(name: string): string {
  return name
    .replace(
      /\b(regional|provincial|national|park|beach|viewpoint|lookout|recreation site|picnic site|nature reserve)\b/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function pickSuffix(
  category: DestinationCategory,
  vibeId: VibeOption['id'] | null,
): string {
  if (vibeId === 'coast' || category === 'beach') {
    return 'Coast';
  }
  if (vibeId === 'views' || category === 'viewpoint') {
    return 'Lookout';
  }
  if (vibeId === 'forest' || category === 'nature_reserve' || category === 'lake') {
    return 'Escape';
  }
  if (vibeId === 'coffee' || category === 'cafe') {
    return 'Stop';
  }
  if (category === 'park' || category === 'picnic_site') {
    return 'Loop';
  }
  return 'Loop';
}

/** Build a concise, tasteful route title from a destination name. */
export function titleForDestination(
  name: string,
  category: DestinationCategory,
  vibeId: VibeOption['id'] | null,
): string {
  const base = cleanDestinationName(name) || name.trim();
  const suffix = pickSuffix(category, vibeId);

  // Avoid titles like "Rathtrevor Coast Coast".
  if (base.toLowerCase().endsWith(suffix.toLowerCase())) {
    return base;
  }

  return `${base} ${suffix}`;
}
