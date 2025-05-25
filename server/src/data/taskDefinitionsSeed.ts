/**
 * SAMPLE TASK DEFINITIONS FOR TIMELINE ENGINE
 * This demonstrates the "DNA" of the TurboTax-style recruiting guidance system
 */

export const sampleTaskDefinitions = [
  // === ONBOARDING PHASE ===
  {
    taskKey: 'complete_basic_profile',
    title: 'Complete Your Basic Profile',
    description: 'Add your name, graduation year, position, and high school information.',
    whyItMatters: 'Coaches need basic information to identify and evaluate potential recruits. An incomplete profile signals lack of seriousness.',
    howToComplete: 'Go to your profile settings and fill in the required fields. This takes about 3 minutes.',
    estimatedTimeMinutes: 3,
    priority: 'critical',
    dependencies: [],
    triggers: {
      fieldMissing: ['graduationYear', 'position', 'highSchoolName'],
      profileCompletion: { threshold: 0, comparison: 'less_than' }
    },
    blocksSharing: true,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    version: 1,
    isActive: true
  },

  {
    taskKey: 'add_profile_photo',
    title: 'Upload Your Profile Photo',
    description: 'Add a clear, professional photo of yourself in uniform or workout gear.',
    whyItMatters: 'A good photo helps coaches remember you and makes your profile more engaging. First impressions matter.',
    howToComplete: 'Upload a high-quality photo (at least 800x800px) showing your face clearly. Avoid selfies or casual photos.',
    estimatedTimeMinutes: 5,
    priority: 'high',
    dependencies: ['complete_basic_profile'],
    triggers: {
      fieldMissing: ['profilePhoto'],
      profileCompletion: { threshold: 30, comparison: 'greater_than' }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    version: 1,
    isActive: true
  },

  // === BUILDING PHASE ===
  {
    taskKey: 'upload_highlight_video',
    title: 'Add Your Highlight Video',
    description: 'Upload or link to your best football highlights (3-5 minutes maximum).',
    whyItMatters: 'Your highlight video is the most important part of your recruiting profile. Coaches watch film before everything else.',
    howToComplete: 'Upload your video to YouTube or Hudl, then add the link to your profile. Keep it short and show your best plays.',
    estimatedTimeMinutes: 15,
    priority: 'critical',
    dependencies: ['complete_basic_profile'],
    triggers: {
      fieldMissing: ['highlightVideoUrl'],
      profileCompletion: { threshold: 40, comparison: 'greater_than' }
    },
    blocksSharing: true,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    seasonalRelevance: {
      peak_months: [8, 9, 10], // August-October peak recruiting season
      urgency_boost: 2
    },
    version: 1,
    isActive: true
  },

  {
    taskKey: 'add_gpa_academics',
    title: 'Add Your GPA & Academic Info',
    description: 'Include your current GPA and any academic achievements.',
    whyItMatters: 'Academic eligibility is required for college football. Many programs have minimum GPA requirements.',
    howToComplete: 'Enter your current cumulative GPA. Be honest - coaches will verify this information.',
    estimatedTimeMinutes: 2,
    priority: 'high',
    dependencies: [],
    triggers: {
      fieldMissing: ['gpa'],
      graduationProximity: { yearsThreshold: 2 }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    version: 1,
    isActive: true
  },

  {
    taskKey: 'upload_transcript',
    title: 'Upload Your Official Transcript',
    description: 'Add your most recent official high school or college transcript.',
    whyItMatters: 'Coaches need to verify your academic standing for eligibility and scholarship considerations.',
    howToComplete: 'Request an official transcript from your school and upload the PDF. Keep it current (within 6 months).',
    estimatedTimeMinutes: 10,
    priority: 'medium',
    dependencies: ['add_gpa_academics'],
    triggers: {
      fieldMissing: ['transcriptUrl'],
      graduationProximity: { yearsThreshold: 1 }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    seasonalRelevance: {
      peak_months: [1, 2, 3, 11, 12], // Signing periods and application deadlines
      urgency_boost: 1
    },
    version: 1,
    isActive: true
  },

  // === ACTIVE RECRUITING PHASE ===
  {
    taskKey: 'create_coach_contact_list',
    title: 'Build Your Coach Contact List',
    description: 'Research and compile contact information for 20-30 college coaches.',
    whyItMatters: 'You need to be proactive in recruiting. Coaches receive hundreds of emails - cast a wide net.',
    howToComplete: 'Research schools that match your academic and athletic level. Find position coaches and recruiting coordinators.',
    estimatedTimeMinutes: 45,
    priority: 'high',
    dependencies: ['upload_highlight_video'],
    triggers: {
      profileCompletion: { threshold: 70, comparison: 'greater_than' },
      seasonal: { events: ['recruiting_season_start'] }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school'],
    seasonalRelevance: {
      peak_months: [6, 7, 8], // Summer camp and recruiting ramp-up
      urgency_boost: 2
    },
    version: 1,
    isActive: true
  },

  {
    taskKey: 'send_intro_emails',
    title: 'Send Introduction Emails to Coaches',
    description: 'Reach out to coaches with a personalized introduction email.',
    whyItMatters: 'Most college recruits are found through self-promotion. Coaches need to know you exist and are interested.',
    howToComplete: 'Use our email templates to introduce yourself. Include your profile link and highlight video.',
    estimatedTimeMinutes: 30,
    priority: 'high',
    dependencies: ['create_coach_contact_list'],
    triggers: {
      profileCompletion: { threshold: 80, comparison: 'greater_than' },
      seasonal: { events: ['recruiting_season_peak'] }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school'],
    seasonalRelevance: {
      peak_months: [8, 9, 10], // Peak recruiting communication
      urgency_boost: 3
    },
    version: 1,
    isActive: true
  },

  // === TRANSFER PORTAL SPECIFIC ===
  {
    taskKey: 'add_ncaa_eligibility',
    title: 'Add NCAA Eligibility Information',
    description: 'Include your NCAA ID and eligibility status for transfer portal.',
    whyItMatters: 'Transfer portal requires verified NCAA eligibility. Coaches need this info to evaluate transfer timeline.',
    howToComplete: 'Log into your NCAA account and add your ID number. Include current eligibility years remaining.',
    estimatedTimeMinutes: 5,
    priority: 'critical',
    dependencies: [],
    triggers: {
      fieldMissing: ['ncaaId'],
      role: ['transfer_portal']
    },
    blocksSharing: true,
    applicableSports: ['football'],
    applicableRoles: ['transfer_portal'],
    version: 1,
    isActive: true
  },

  {
    taskKey: 'update_stats_performance',
    title: 'Update Your Performance Stats',
    description: 'Add your latest game and season statistics.',
    whyItMatters: 'Current stats show your recent performance level and help coaches evaluate your potential fit.',
    howToComplete: 'Include stats from your most recent full season. Be accurate - coaches will verify with film.',
    estimatedTimeMinutes: 10,
    priority: 'medium',
    dependencies: ['upload_highlight_video'],
    triggers: {
      engagement: { levels: ['high', 'medium'] },
      seasonal: { events: ['season_end', 'transfer_portal_open'] }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    seasonalRelevance: {
      peak_months: [12, 1, 2], // Post-season and transfer portal timing
      urgency_boost: 1
    },
    version: 1,
    isActive: true
  },

  // === ONGOING MAINTENANCE ===
  {
    taskKey: 'update_senior_film',
    title: 'Update with Senior Season Highlights',
    description: 'Add your best plays from senior year to your highlight reel.',
    whyItMatters: 'Senior film shows your most recent development and current ability level. This is what coaches will judge you on.',
    howToComplete: 'Create a new highlight video with your best senior season plays. Replace or supplement your existing video.',
    estimatedTimeMinutes: 20,
    priority: 'critical',
    dependencies: ['upload_highlight_video'],
    triggers: {
      graduationProximity: { yearsThreshold: 1 },
      seasonal: { events: ['senior_season_start'] }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school'],
    seasonalRelevance: {
      peak_months: [10, 11, 12], // Senior season and early signing
      urgency_boost: 3
    },
    version: 1,
    isActive: true
  },

  {
    taskKey: 'follow_up_coaches',
    title: 'Follow Up with Interested Coaches',
    description: 'Send update emails to coaches who have shown interest.',
    whyItMatters: 'Recruiting is about building relationships. Regular communication keeps you on coaches\' radar.',
    howToComplete: 'Send brief updates about recent games, achievements, or camp performances to coaches in your pipeline.',
    estimatedTimeMinutes: 15,
    priority: 'medium',
    dependencies: ['send_intro_emails'],
    triggers: {
      engagement: { levels: ['high'] },
      seasonal: { events: ['recruiting_season_peak', 'camp_season'] }
    },
    blocksSharing: false,
    applicableSports: ['football'],
    applicableRoles: ['high_school', 'transfer_portal'],
    seasonalRelevance: {
      peak_months: [6, 7, 8, 9], // Camp season and peak recruiting
      urgency_boost: 1
    },
    version: 1,
    isActive: true
  }
];

/**
 * SEASONAL EVENTS THAT INFLUENCE TASK TIMING
 */
export const sampleSeasonalEvents = [
  {
    eventKey: 'recruiting_season_start',
    title: 'College Football Recruiting Season Begins',
    description: 'Coaches begin active recruiting for next year\'s class.',
    startMonth: 6,
    startDay: 15,
    endMonth: 8,
    endDay: 31,
    sport: 'football',
    applicableRoles: ['high_school'],
    graduationYears: null, // Applies to all
    priorityBoost: 2,
    triggersNotifications: true,
    isActive: true
  },

  {
    eventKey: 'recruiting_season_peak',
    title: 'Peak Recruiting Season',
    description: 'Highest activity period for coach-player communication.',
    startMonth: 8,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
    sport: 'football',
    applicableRoles: ['high_school', 'transfer_portal'],
    graduationYears: null,
    priorityBoost: 3,
    triggersNotifications: true,
    isActive: true
  },

  {
    eventKey: 'early_signing_period',
    title: 'Early National Signing Day',
    description: 'First opportunity for high school players to sign with colleges.',
    startMonth: 12,
    startDay: 15,
    endMonth: 12,
    endDay: 17,
    sport: 'football',
    applicableRoles: ['high_school'],
    graduationYears: null,
    priorityBoost: 4,
    triggersNotifications: true,
    isActive: true
  },

  {
    eventKey: 'transfer_portal_peak',
    title: 'Transfer Portal Peak Activity',
    description: 'Highest volume of transfer portal entries and commitments.',
    startMonth: 12,
    startDay: 1,
    endMonth: 2,
    endDay: 28,
    sport: 'football',
    applicableRoles: ['transfer_portal'],
    graduationYears: null,
    priorityBoost: 3,
    triggersNotifications: true,
    isActive: true
  },

  {
    eventKey: 'summer_camp_season',
    title: 'College Football Camp Season',
    description: 'Prime time for visiting colleges and attending camps.',
    startMonth: 6,
    startDay: 1,
    endMonth: 7,
    endDay: 31,
    sport: 'football',
    applicableRoles: ['high_school'],
    graduationYears: null,
    priorityBoost: 2,
    triggersNotifications: true,
    isActive: true
  }
];

/**
 * SAMPLE ACHIEVEMENT DEFINITIONS
 */
export const sampleAchievements = [
  {
    achievementKey: 'first_task_complete',
    title: '🎯 First Step Complete!',
    description: 'You completed your first recruiting task. Every journey starts with a single step.',
    icon: '🎯'
  },
  {
    achievementKey: 'profile_complete',
    title: '✅ Profile Complete!',
    description: 'Your recruiting profile is 100% complete. Coaches love prepared athletes.',
    icon: '✅'
  },
  {
    achievementKey: 'first_video_upload',
    title: '🎬 Film Ready!',
    description: 'You uploaded your highlight video. This is what coaches want to see most.',
    icon: '🎬'
  },
  {
    achievementKey: 'first_coach_contact',
    title: '📧 Making Connections!',
    description: 'You sent your first email to a college coach. Recruiting is about relationships.',
    icon: '📧'
  },
  {
    achievementKey: 'task_streak_5',
    title: '🔥 On Fire!',
    description: 'You\'ve completed 5 recruiting tasks. Consistency is key to success.',
    icon: '🔥'
  },
  {
    achievementKey: 'academic_ready',
    title: '📚 Academically Ready!',
    description: 'You added your GPA and transcript. Academic eligibility unlocks opportunities.',
    icon: '📚'
  },
  {
    achievementKey: 'recruiting_ready',
    title: '🚀 Recruiting Ready!',
    description: 'Your profile is complete and shareable. Time to get recruited!',
    icon: '🚀'
  }
];

/**
 * NOTIFICATION TEMPLATES FOR DIFFERENT SCENARIOS
 */
export const notificationTemplates = {
  nudge: {
    title: 'Ready for your next step?',
    message: 'Your {taskTitle} is waiting. It only takes about {estimatedTime} minutes.',
    ctaText: 'Let\'s do this'
  },
  seasonal: {
    title: 'Perfect timing for recruiting!',
    message: 'It\'s {seasonName} - the ideal time to {taskTitle}.',
    ctaText: 'Take advantage'
  },
  critical: {
    title: 'Important: Action needed',
    message: 'Your {taskTitle} is blocking your profile from being shared with coaches.',
    ctaText: 'Fix this now'
  },
  achievement: {
    title: 'You earned an achievement!',
    message: '{achievementTitle} - {achievementDescription}',
    ctaText: 'See your progress'
  },
  reminder: {
    title: 'Don\'t lose momentum',
    message: 'You haven\'t been active in {daysSince} days. Your {taskTitle} is still waiting.',
    ctaText: 'Continue where you left off'
  }
}; 