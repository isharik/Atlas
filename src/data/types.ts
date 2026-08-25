import type { ZoneId } from '@/store/useAtlas';

/**
 * Typed data models for the Prosper ecosystem. The app displays only verified
 * information sourced from official Prosper channels — there is no demo/sample data.
 */

export interface EcosystemRelationship {
  from: ZoneId | 'pharos' | 'prosper';
  to: ZoneId | 'pharos' | 'prosper';
  label: string;
}
