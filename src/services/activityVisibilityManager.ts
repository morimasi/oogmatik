/**
 * OOGMATIK — Activity Visibility Management
 * 
 * Admin can enable/disable activities and categories
 * Per-role visibility control
 * Real-time sync with Firestore
 */

import { ActivityType } from '../types/activity';

/**
 * Activity Visibility Status
 */
export type ActivityStatus = 'active' | 'inactive' | 'premium' | 'beta';

/**
 * Activity Visibility Configuration
 */
export interface ActivityVisibility {
  activityType: ActivityType;
  status: ActivityStatus;
  allowedRoles: string[]; // Which roles can access this
  createdAt: string;
  updatedAt: string;
  updatedBy: string; // Admin who made the change
}

/**
 * Category Visibility Configuration
 */
export interface CategoryVisibility {
  categoryId: string;
  status: ActivityStatus;
  allowedRoles: string[];
  activityOverrides?: ActivityVisibility[]; // Individual activity overrides
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Activity Management Service
 */
export class ActivityVisibilityManager {
  private visibilityCache: Map<string, ActivityVisibility>;
  private categoryCache: Map<string, CategoryVisibility>;

  constructor() {
    this.visibilityCache = new Map();
    this.categoryCache = new Map();
  }

  /**
   * Check if user role can access activity
   */
  canAccess(
    activityType: ActivityType,
    userRole: string
  ): boolean {
    const visibility = this.visibilityCache.get(activityType);
    
    // If no config found, check defaults
    if (!visibility) {
      return this.checkDefaultAccess(activityType, userRole);
    }

    // Check if activity is active
    if (visibility.status === 'inactive') {
      return false;
    }

    // Check if role is allowed
    return visibility.allowedRoles.includes(userRole);
  }

  /**
   * Check if user role can access category
   */
  canAccessCategory(
    categoryId: string,
    userRole: string
  ): boolean {
    const visibility = this.categoryCache.get(categoryId);
    
    if (!visibility) {
      return true; // Default: accessible
    }

    if (visibility.status === 'inactive') {
      return false;
    }

    return visibility.allowedRoles.includes(userRole);
  }

  /**
   * Set activity visibility
   */
  async setActivityVisibility(
    activityType: ActivityType,
    status: ActivityStatus,
    allowedRoles: string[],
    adminId: string
  ): Promise<void> {
    const visibility: ActivityVisibility = {
      activityType,
      status,
      allowedRoles,
      createdAt: this.visibilityCache.has(activityType) 
        ? this.visibilityCache.get(activityType)!.createdAt 
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: adminId,
    };

    this.visibilityCache.set(activityType, visibility);
    
    // TODO: Save to Firestore
    // await setDoc(doc(db, 'activityVisibility', activityType), visibility);
  }

  /**
   * Set category visibility
   */
  async setCategoryVisibility(
    categoryId: string,
    status: ActivityStatus,
    allowedRoles: string[],
    adminId: string,
    activityOverrides?: ActivityVisibility[]
  ): Promise<void> {
    const visibility: CategoryVisibility = {
      categoryId,
      status,
      allowedRoles,
      activityOverrides,
      createdAt: this.categoryCache.has(categoryId)
        ? this.categoryCache.get(categoryId)!.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: adminId,
    };

    this.categoryCache.set(categoryId, visibility);
    
    // TODO: Save to Firestore
    // await setDoc(doc(db, 'categoryVisibility', categoryId), visibility);
  }

  /**
   * Get all visible activities for user role
   */
  getVisibleActivities(userRole: string): ActivityType[] {
    const visible: ActivityType[] = [];

    // Check all activities
    for (const [activityType, visibility] of this.visibilityCache) {
      if (this.canAccess(activityType as ActivityType, userRole)) {
        visible.push(activityType as ActivityType);
      }
    }

    return visible;
  }

  /**
   * Get all categories with visibility status
   */
  getAllCategories(): CategoryVisibility[] {
    return Array.from(this.categoryCache.values());
  }

  /**
   * Bulk update activities in a category
   */
  async bulkUpdateCategoryActivities(
    categoryId: string,
    activityTypes: ActivityType[],
    status: ActivityStatus,
    allowedRoles: string[],
    adminId: string
  ): Promise<void> {
    const updates = activityTypes.map(type =>
      this.setActivityVisibility(type, status, allowedRoles, adminId)
    );

    await Promise.all(updates);
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults(adminId: string): Promise<void> {
    // TODO: Load default configurations
    this.visibilityCache.clear();
    this.categoryCache.clear();
  }

  /**
   * Check default access (fallback logic)
   */
  private checkDefaultAccess(
    activityType: ActivityType,
    userRole: string
  ): boolean {
    // Default: All active activities are accessible to teacher+
    if (['superadmin', 'admin', 'teacher'].includes(userRole)) {
      return true;
    }

    // Students and parents have limited access
    if (userRole === 'student' || userRole === 'parent') {
      // Only non-premium activities
      return !activityType.toString().includes('PREMIUM');
    }

    return false;
  }
}

// Export singleton
export const activityVisibilityManager = new ActivityVisibilityManager();
