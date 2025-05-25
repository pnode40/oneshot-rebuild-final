import { db } from '../db/client';
import {
  taskDefinitions,
  userTimelines,
  taskInstances,
  progressEvents,
  notifications,
  achievements,
  seasonalEvents,
  taskStatusEnum,
  taskPriorityEnum,
  timelinePhaseEnum,
  notificationTypeEnum,
} from '../db/schema/timeline';
import { users, profiles } from '../db/schema';
import { eq, and, or, gt, lt, gte, lte, desc, asc, sql } from 'drizzle-orm';

// Types for the timeline engine
interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  role: 'high_school' | 'transfer_portal';
  graduationYear?: number;
  sport: string;
  position?: string;
  gpa?: number;
  hasTranscript: boolean;
  hasHighlightVideo: boolean;
  hasNcaaId?: boolean;
  profileCompletion: number;
  isPublic: boolean;
}

interface TaskTrigger {
  type: 'field_missing' | 'field_incomplete' | 'deadline_approaching' | 'dependency_complete' | 'seasonal' | 'engagement';
  conditions: any;
  urgencyMultiplier?: number;
}

interface TimelineContext {
  currentSeason: 'off_season' | 'prep_season' | 'recruiting_season' | 'signing_season';
  activeSeasonalEvents: any[];
  userEngagement: 'high' | 'medium' | 'low';
  daysSinceLastActivity: number;
}

/**
 * CORE TIMELINE ENGINE
 * This is the "brain" that creates personalized recruiting guidance
 */
export class TimelineEngine {
  
  /**
   * Generate or update a user's timeline based on their current profile state
   */
  async generateUserTimeline(userId: number): Promise<any> {
    try {
      // 1. Gather user context
      const userProfile = await this.getUserProfile(userId);
      const timelineContext = await this.getTimelineContext(userProfile);
      
      // 2. Get or create timeline instance
      let timeline = await this.getOrCreateTimeline(userId, userProfile);
      
      // 3. Generate task instances based on intelligent rules
      const taskInstances = await this.generateTaskInstances(timeline, userProfile, timelineContext);
      
      // 4. Update timeline metadata
      timeline = await this.updateTimelineMetadata(timeline, taskInstances);
      
      // 5. Schedule smart notifications
      await this.scheduleSmartNotifications(timeline, taskInstances, timelineContext);
      
      // 6. Check for achievements
      await this.checkAndAwardAchievements(userId, taskInstances);
      
      return {
        timeline,
        tasks: taskInstances,
        context: timelineContext,
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Timeline generation failed:', error);
      throw new Error('Failed to generate timeline');
    }
  }

  /**
   * Get comprehensive user profile data for timeline generation
   */
  private async getUserProfile(userId: number): Promise<UserProfile> {
    const userQuery = await db.select({
      userId: users.id,
      email: users.email,
      firstName: users.firstName,
      role: users.role,
      // Profile data
      graduationYear: profiles.graduationYear,
      sport: sql`COALESCE(${profiles.sport}, 'football')`,
      position: profiles.positionPrimary,
      gpa: profiles.gpa,
      hasTranscript: sql`CASE WHEN ${profiles.transcriptUrl} IS NOT NULL THEN true ELSE false END`,
      hasHighlightVideo: sql`CASE WHEN ${profiles.highlightVideoUrl} IS NOT NULL THEN true ELSE false END`,
      hasNcaaId: sql`CASE WHEN ${profiles.ncaaId} IS NOT NULL THEN true ELSE false END`,
      isPublic: profiles.isPublic,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

    if (userQuery.length === 0) {
      throw new Error('User not found');
    }

    const userData = userQuery[0];
    
    // Calculate profile completion percentage
    const completionFactors = [
      userData.firstName,
      userData.graduationYear,
      userData.position,
      userData.hasHighlightVideo,
      userData.gpa,
    ];
    
    const completedFactors = completionFactors.filter(factor => factor !== null && factor !== undefined).length;
    const profileCompletion = Math.round((completedFactors / completionFactors.length) * 100);

    return {
      ...userData,
      profileCompletion,
      sport: userData.sport || 'football',
      role: userData.role as 'high_school' | 'transfer_portal',
    };
  }

  /**
   * Analyze current recruiting season and context
   */
  private async getTimelineContext(userProfile: UserProfile): Promise<TimelineContext> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // Determine current recruiting season for football
    let currentSeason: TimelineContext['currentSeason'] = 'off_season';
    
    if (currentMonth >= 1 && currentMonth <= 3) {
      currentSeason = 'signing_season'; // January - March (National Signing Day periods)
    } else if (currentMonth >= 4 && currentMonth <= 7) {
      currentSeason = 'off_season'; // April - July
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      currentSeason = 'recruiting_season'; // August - October (peak recruiting)
    } else {
      currentSeason = 'prep_season'; // November - December (preparation season)
    }

    // Get active seasonal events
    const activeSeasonalEvents = await db.select()
      .from(seasonalEvents)
      .where(
        and(
          eq(seasonalEvents.sport, userProfile.sport as any),
          eq(seasonalEvents.isActive, true),
          or(
            and(
              lte(seasonalEvents.startMonth, currentMonth),
              gte(seasonalEvents.endMonth, currentMonth)
            ),
            // Handle cross-year events
            and(
              gt(seasonalEvents.startMonth, sql`COALESCE(${seasonalEvents.endMonth}, ${seasonalEvents.startMonth})`),
              or(
                gte(currentMonth, seasonalEvents.startMonth),
                lte(currentMonth, sql`COALESCE(${seasonalEvents.endMonth}, 12)`)
              )
            )
          )
        )
      );

    // Calculate user engagement
    const lastTimeline = await db.select()
      .from(userTimelines)
      .where(eq(userTimelines.userId, userProfile.userId))
      .orderBy(desc(userTimelines.lastActivityAt))
      .limit(1);

    let userEngagement: TimelineContext['userEngagement'] = 'medium';
    let daysSinceLastActivity = 0;

    if (lastTimeline.length > 0 && lastTimeline[0].lastActivityAt) {
      const lastActivity = new Date(lastTimeline[0].lastActivityAt);
      daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastActivity <= 3) {
        userEngagement = 'high';
      } else if (daysSinceLastActivity <= 14) {
        userEngagement = 'medium';
      } else {
        userEngagement = 'low';
      }
    }

    return {
      currentSeason,
      activeSeasonalEvents,
      userEngagement,
      daysSinceLastActivity,
    };
  }

  /**
   * Get existing timeline or create new one
   */
  private async getOrCreateTimeline(userId: number, userProfile: UserProfile) {
    let timeline = await db.select()
      .from(userTimelines)
      .where(
        and(
          eq(userTimelines.userId, userId),
          eq(userTimelines.isActive, true)
        )
      )
      .limit(1);

    if (timeline.length === 0) {
      // Create new timeline
      const newTimeline = await db.insert(userTimelines)
        .values({
          userId,
          sport: userProfile.sport as any,
          graduationYear: userProfile.graduationYear,
          role: userProfile.role,
          position: userProfile.position,
          currentPhase: this.determineInitialPhase(userProfile),
          completionPercentage: userProfile.profileCompletion,
          lastActivityAt: new Date(),
        })
        .returning();
      
      return newTimeline[0];
    }

    return timeline[0];
  }

  /**
   * Intelligent task instance generation based on user state and context
   */
  private async generateTaskInstances(timeline: any, userProfile: UserProfile, context: TimelineContext) {
    // Get all applicable task definitions
    const applicableTaskDefs = await db.select()
      .from(taskDefinitions)
      .where(
        and(
          eq(taskDefinitions.isActive, true),
          sql`${taskDefinitions.applicableSports} @> ${JSON.stringify([userProfile.sport])}`,
          sql`${taskDefinitions.applicableRoles} @> ${JSON.stringify([userProfile.role])}`
        )
      );

    // Get existing task instances for this timeline
    const existingTasks = await db.select()
      .from(taskInstances)
      .where(eq(taskInstances.timelineId, timeline.id));

    const existingTaskDefIds = new Set(existingTasks.map(t => t.taskDefinitionId));
    const newTaskInstances = [];

    for (const taskDef of applicableTaskDefs) {
      // Skip if task already exists
      if (existingTaskDefIds.has(taskDef.id)) {
        continue;
      }

      // Evaluate if this task should be triggered
      const shouldTrigger = await this.evaluateTaskTriggers(taskDef, userProfile, context);
      
      if (shouldTrigger.triggered) {
        const priority = this.calculateDynamicPriority(taskDef, shouldTrigger, context);
        const orderIndex = this.calculateOrderIndex(taskDef, priority, context);

        const taskInstance = await db.insert(taskInstances)
          .values({
            timelineId: timeline.id,
            taskDefinitionId: taskDef.id,
            priority: priority,
            orderIndex: orderIndex,
            triggerContext: shouldTrigger.context,
            status: 'pending' as any,
          })
          .returning();

        newTaskInstances.push(taskInstance[0]);
      }
    }

    // Return all task instances (existing + new) ordered by priority and order
    const allTasks = await db.select({
      id: taskInstances.id,
      status: taskInstances.status,
      priority: taskInstances.priority,
      orderIndex: taskInstances.orderIndex,
      taskKey: taskDefinitions.taskKey,
      title: sql`COALESCE(${taskInstances.customTitle}, ${taskDefinitions.title})`,
      description: sql`COALESCE(${taskInstances.customDescription}, ${taskDefinitions.description})`,
      whyItMatters: taskDefinitions.whyItMatters,
      howToComplete: taskDefinitions.howToComplete,
      estimatedTimeMinutes: taskDefinitions.estimatedTimeMinutes,
      blocksSharing: taskDefinitions.blocksSharing,
      startedAt: taskInstances.startedAt,
      completedAt: taskInstances.completedAt,
      isVisible: taskInstances.isVisible,
      isPinned: taskInstances.isPinned,
    })
    .from(taskInstances)
    .innerJoin(taskDefinitions, eq(taskInstances.taskDefinitionId, taskDefinitions.id))
    .where(eq(taskInstances.timelineId, timeline.id))
    .orderBy(
      desc(taskInstances.isPinned),
      asc(taskInstances.orderIndex),
      desc(sql`CASE ${taskInstances.priority} WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END`)
    );

    return allTasks;
  }

  /**
   * Evaluate whether a task should be triggered for a user
   */
  private async evaluateTaskTriggers(taskDef: any, userProfile: UserProfile, context: TimelineContext): Promise<{ triggered: boolean; context: any }> {
    const triggers = taskDef.triggers || {};
    let triggered = false;
    let triggerContext: any = {};

    // Field-based triggers
    if (triggers.fieldMissing) {
      for (const field of triggers.fieldMissing) {
        if (!userProfile[field as keyof UserProfile]) {
          triggered = true;
          triggerContext.reason = 'field_missing';
          triggerContext.field = field;
          break;
        }
      }
    }

    // Profile completion triggers
    if (triggers.profileCompletion && userProfile.profileCompletion >= triggers.profileCompletion.threshold) {
      triggered = true;
      triggerContext.reason = 'profile_completion';
      triggerContext.threshold = triggers.profileCompletion.threshold;
    }

    // Seasonal triggers
    if (triggers.seasonal && context.activeSeasonalEvents.length > 0) {
      const relevantEvents = context.activeSeasonalEvents.filter(event =>
        triggers.seasonal.events.includes(event.eventKey)
      );
      
      if (relevantEvents.length > 0) {
        triggered = true;
        triggerContext.reason = 'seasonal';
        triggerContext.events = relevantEvents;
      }
    }

    // Graduation year proximity triggers
    if (triggers.graduationProximity && userProfile.graduationYear) {
      const currentYear = new Date().getFullYear();
      const yearsUntilGraduation = userProfile.graduationYear - currentYear;
      
      if (yearsUntilGraduation <= triggers.graduationProximity.yearsThreshold) {
        triggered = true;
        triggerContext.reason = 'graduation_proximity';
        triggerContext.yearsRemaining = yearsUntilGraduation;
      }
    }

    // Engagement-based triggers
    if (triggers.engagement) {
      const engagementMatch = triggers.engagement.levels.includes(context.userEngagement);
      if (engagementMatch) {
        triggered = true;
        triggerContext.reason = 'engagement_level';
        triggerContext.level = context.userEngagement;
      }
    }

    return { triggered, context: triggerContext };
  }

  /**
   * Calculate dynamic task priority based on context
   */
  private calculateDynamicPriority(taskDef: any, triggerResult: any, context: TimelineContext): any {
    let basePriority = taskDef.priority;
    let priorityBoost = 0;

    // Boost priority for seasonal relevance
    if (triggerResult.context.reason === 'seasonal') {
      priorityBoost += 1;
    }

    // Boost for graduation proximity
    if (triggerResult.context.reason === 'graduation_proximity' && triggerResult.context.yearsRemaining <= 1) {
      priorityBoost += 2;
    }

    // Boost for blocking tasks
    if (taskDef.blocksSharing) {
      priorityBoost += 1;
    }

    // Convert to priority level
    const priorityLevels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = priorityLevels.indexOf(basePriority);
    const newIndex = Math.min(currentIndex + priorityBoost, priorityLevels.length - 1);
    
    return priorityLevels[newIndex] as any;
  }

  /**
   * Calculate task order index for optimal user experience
   */
  private calculateOrderIndex(taskDef: any, priority: any, context: TimelineContext): number {
    let baseOrder = 100; // Default order

    // Priority-based ordering
    const priorityWeights = { critical: 10, high: 30, medium: 50, low: 70 };
    baseOrder = priorityWeights[priority] || 50;

    // Adjust for estimated time (quick wins first)
    if (taskDef.estimatedTimeMinutes <= 5) {
      baseOrder -= 5; // Move quick tasks up
    }

    // Seasonal adjustments
    if (context.currentSeason === 'recruiting_season') {
      if (taskDef.taskKey === 'contact_coaches' || taskDef.taskKey === 'update_highlights') {
        baseOrder -= 10;
      }
    }

    return baseOrder;
  }

  /**
   * Update timeline metadata after task generation
   */
  private async updateTimelineMetadata(timeline: any, taskInstances: any[]) {
    const completedTasks = taskInstances.filter(t => t.status === 'complete').length;
    const totalTasks = taskInstances.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const hasBlockingTasks = taskInstances.some(t => t.blocksSharing && t.status !== 'complete');

    const updatedTimeline = await db.update(userTimelines)
      .set({
        completionPercentage,
        hasBlockingTasks,
        generatedAt: new Date(),
        generationVersion: timeline.generationVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(userTimelines.id, timeline.id))
      .returning();

    return updatedTimeline[0];
  }

  /**
   * Schedule intelligent notifications based on user patterns
   */
  private async scheduleSmartNotifications(timeline: any, taskInstances: any[], context: TimelineContext) {
    const highPriorityTasks = taskInstances.filter(t => 
      t.status === 'pending' && (t.priority === 'high' || t.priority === 'critical')
    );

    if (highPriorityTasks.length === 0) return;

    // Calculate notification timing based on engagement
    let notificationDelay = 24; // hours
    if (context.userEngagement === 'high') {
      notificationDelay = 4;
    } else if (context.userEngagement === 'low') {
      notificationDelay = 72;
    }

    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + notificationDelay);

    // Create a gentle nudge notification
    const topTask = highPriorityTasks[0];
    await db.insert(notifications)
      .values({
        userId: timeline.userId,
        taskInstanceId: topTask.id,
        type: 'nudge' as any,
        title: 'Ready for your next step?',
        message: `Your ${topTask.title} is waiting. It only takes about ${topTask.estimatedTimeMinutes} minutes.`,
        ctaText: 'Let\'s do this',
        ctaUrl: `/dashboard/tasks/${topTask.id}`,
        scheduledFor,
        priority: topTask.priority === 'critical' ? 8 : 6,
      });
  }

  /**
   * Check for and award achievements
   */
  private async checkAndAwardAchievements(userId: number, taskInstances: any[]) {
    const completedTasks = taskInstances.filter(t => t.status === 'complete');
    
    // First task completion achievement
    if (completedTasks.length === 1) {
      await this.awardAchievement(userId, 'first_task_complete', {
        title: '🎯 First Step Complete!',
        description: 'You completed your first recruiting task. Keep the momentum going!',
        icon: '🎯',
        triggerTaskId: completedTasks[0].id,
      });
    }

    // Profile completion milestones
    if (completedTasks.length >= 5) {
      await this.awardAchievement(userId, 'task_streak_5', {
        title: '🔥 On Fire!',
        description: 'You\'ve completed 5 recruiting tasks. Coaches notice prepared athletes.',
        icon: '🔥',
      });
    }
  }

  /**
   * Award an achievement to a user
   */
  private async awardAchievement(userId: number, achievementKey: string, achievementData: any) {
    // Check if achievement already exists
    const existing = await db.select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.achievementKey, achievementKey)
        )
      );

    if (existing.length === 0) {
      await db.insert(achievements)
        .values({
          userId,
          achievementKey,
          ...achievementData,
        });
    }
  }

  /**
   * Determine initial timeline phase for new users
   */
  private determineInitialPhase(userProfile: UserProfile): any {
    if (userProfile.profileCompletion < 30) {
      return 'onboarding';
    } else if (userProfile.profileCompletion < 70) {
      return 'building';
    } else {
      return 'active';
    }
  }

  /**
   * Track user progress events
   */
  async trackProgressEvent(userId: number, eventType: string, eventData: any, taskInstanceId?: number) {
    await db.insert(progressEvents)
      .values({
        userId,
        taskInstanceId,
        eventType,
        eventData,
        triggerSource: 'user_action',
      });

    // Update timeline last activity
    await db.update(userTimelines)
      .set({ lastActivityAt: new Date() })
      .where(eq(userTimelines.userId, userId));
  }

  /**
   * Get dashboard data for "What's Next" widget
   */
  async getDashboardData(userId: number) {
    const timeline = await db.select()
      .from(userTimelines)
      .where(
        and(
          eq(userTimelines.userId, userId),
          eq(userTimelines.isActive, true)
        )
      )
      .limit(1);

    if (timeline.length === 0) {
      return {
        phase: 'onboarding',
        completionPercentage: 0,
        nextTasks: [],
        achievements: [],
        hasBlockingTasks: false,
      };
    }

    // Get next priority tasks (max 3)
    const nextTasks = await db.select({
      id: taskInstances.id,
      title: sql`COALESCE(${taskInstances.customTitle}, ${taskDefinitions.title})`,
      description: sql`COALESCE(${taskInstances.customDescription}, ${taskDefinitions.description})`,
      priority: taskInstances.priority,
      estimatedTimeMinutes: taskDefinitions.estimatedTimeMinutes,
      blocksSharing: taskDefinitions.blocksSharing,
    })
    .from(taskInstances)
    .innerJoin(taskDefinitions, eq(taskInstances.taskDefinitionId, taskDefinitions.id))
    .where(
      and(
        eq(taskInstances.timelineId, timeline[0].id),
        eq(taskInstances.status, 'pending'),
        eq(taskInstances.isVisible, true)
      )
    )
    .orderBy(
      desc(taskInstances.isPinned),
      asc(taskInstances.orderIndex)
    )
    .limit(3);

    // Get recent achievements
    const recentAchievements = await db.select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.isVisible, true)
        )
      )
      .orderBy(desc(achievements.createdAt))
      .limit(3);

    return {
      phase: timeline[0].currentPhase,
      completionPercentage: timeline[0].completionPercentage,
      nextTasks,
      achievements: recentAchievements,
      hasBlockingTasks: timeline[0].hasBlockingTasks,
      lastActivity: timeline[0].lastActivityAt,
    };
  }
}

// Export singleton instance
export const timelineEngine = new TimelineEngine(); 