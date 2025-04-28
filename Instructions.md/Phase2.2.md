# Instructions.md

## 🏗️ Feature to Implement
Rebuild the Timeline Phase + Task Engine cleanly inside the OneShot backend architecture.

---

## 🎯 What to Build

- Create an in-memory `mockDbTimeline` object (similar to mockDb for auth)
- Define phases (Freshman, Sophomore, Junior, Senior)
- Each phase contains an array of tasks
- Each task has: `id`, `title`, `description`, `completed: boolean`
- API Endpoints:
  - `GET /api/timeline` → Return full phases + tasks
  - `POST /api/timeline/task/:taskId/complete` → Mark task as completed
- Mock database behavior (no real DB writes yet — only modify the in-memory object)

---

## 🛠️ Files to Edit or Create

- `/src/backend/routes/timeline.ts` (New)
- `/src/shared/types/timelineTypes.ts` (New)
- `/src/backend/index.ts` (Add `app.use('/api/timeline', timelineRouter)`)

---

## 📋 Data Model Example

TimelinePhase (Type):

```ts
export interface TimelinePhase {
  id: string;
  title: string;
  tasks: TimelineTask[];
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}
const mockDbTimeline = {
  phases: [
    {
      id: 'freshman',
      title: 'Freshman Year',
      tasks: [
        { id: 'task1', title: 'Create Hudl account', description: 'Set up your Hudl profile.', completed: false },
        { id: 'task2', title: 'Record baseline highlights', description: 'Film your first game highlights.', completed: false }
      ]
    },
    ...
  ]
};
