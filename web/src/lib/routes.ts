import { NavViewId } from '../components/Sidebar';

export const VALID_NAV_VIEWS: readonly NavViewId[] = [
  'home',
  'command-center',
  'live-map',
  'incidents',
  'reports',
  'evidence',
  'assignments',
  'alerts',
  'teams',
  'responders',
  'resources',
  'routes',
  'ai-intelligence',
  'decision-trace',
  'related-incidents',
  'conflicts',
  'devices',
  'analytics',
  'audit-logs',
  'system-health',
  'field-sync',
  'admin-users',
  'admin-roles',
  'admin-settings',
] as const;

/**
 * Resolves any URL path string (e.g. "dashboard", "live-map", "incidents", "admin/users")
 * to its corresponding authoritative NavViewId.
 */
export function pathToNavViewId(rawPath: string): NavViewId {
  const clean = rawPath.replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  if (!clean || clean === 'home') return 'home';
  if (clean === 'dashboard' || clean === 'command-center') return 'command-center';
  if (clean === 'map' || clean === 'gis' || clean === 'tactical-map') return 'live-map';
  if (clean === 'admin/users' || clean === 'admin-users') return 'admin-users';
  if (clean === 'admin/roles' || clean === 'admin-roles') return 'admin-roles';
  if (clean === 'admin/settings' || clean === 'admin-settings') return 'admin-settings';
  if (clean === 'ai') return 'ai-intelligence';
  if (clean === 'health') return 'system-health';
  if (clean === 'sync') return 'field-sync';
  if (clean === 'audit') return 'audit-logs';

  if (VALID_NAV_VIEWS.includes(clean as NavViewId)) {
    return clean as NavViewId;
  }
  return 'home';
}

/**
 * Converts a NavViewId to the clean browser URL path (e.g. "command-center" -> "/dashboard", "home" -> "/").
 */
export function navViewIdToPath(viewId: NavViewId): string {
  if (viewId === 'home') return '/';
  if (viewId === 'command-center') return '/dashboard';
  return `/${viewId}`;
}
