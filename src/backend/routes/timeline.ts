import express from 'express';
import { TimelineData, TimelinePhase, TimelineTask } from '../../shared/types/timelineTypes';

const router = express.Router();

// Mock database
const mockDbTimeline: TimelineData = {
  phases: [
    {
      id: 'freshman',
      title: 'Freshman Year',
      tasks: [
        { id: 'task1', title: 'Create Hudl account', description: 'Set up your Hudl profile.', completed: false },
        { id: 'task2', title: 'Record baseline highlights', description: 'Film your first game highlights.', completed: false }
      ]
    },
    {
      id: 'sophomore',
      title: 'Sophomore Year',
      tasks: [
        { id: 'task3', title: 'Update Hudl profile', description: 'Add new highlights and achievements.', completed: false },
        { id: 'task4', title: 'Attend showcase events', description: 'Participate in at least 2 showcase events.', completed: false }
      ]
    },
    {
      id: 'junior',
      title: 'Junior Year',
      tasks: [
        { id: 'task5', title: 'Create highlight reel', description: 'Compile your best plays into a highlight reel.', completed: false },
        { id: 'task6', title: 'Research colleges', description: 'Identify target schools and their requirements.', completed: false }
      ]
    },
    {
      id: 'senior',
      title: 'Senior Year',
      tasks: [
        { id: 'task7', title: 'Contact college coaches', description: 'Reach out to coaches at target schools.', completed: false },
        { id: 'task8', title: 'Submit applications', description: 'Complete and submit college applications.', completed: false }
      ]
    }
  ]
};

// GET /api/timeline
router.get('/', (req, res) => {
  res.json(mockDbTimeline);
});

// POST /api/timeline/task/:taskId/complete
router.post('/task/:taskId/complete', (req, res) => {
  const { taskId } = req.params;
  
  // Find and update the task
  for (const phase of mockDbTimeline.phases) {
    const task = phase.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      return res.json({ success: true, message: 'Task marked as completed' });
    }
  }
  
  res.status(404).json({ success: false, message: 'Task not found' });
});

export default router; 