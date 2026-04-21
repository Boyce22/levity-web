'use client';

import { useState, useCallback } from 'react';
import { Sprint, CreateSprint, UpdateSprint, CompleteSprint } from '@/contracts/Sprint';
import {
  createSprintAction,
  updateSprintAction,
  deleteSprintAction,
  activateSprintAction,
  completeSprintAction,
} from '@/features/sprints/server/actions';

export function useSprints(initialSprints: Sprint[], workspaceId: string) {
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);

  const addSprint = useCallback(
    async (data: CreateSprint) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Sprint = {
        id: tempId,
        workspaceId,
        name: data.name,
        goal: data.goal,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'planning',
        trackingMode: data.trackingMode,
        capacityPoints: data.capacityPoints,
        createdBy: '',
        createdAt: new Date().toISOString(),
        totalCards: 0,
        completedCards: 0,
        progressPercent: 0,
      };
      setSprints((prev) => [...prev, optimistic]);
      try {
        const saved = await createSprintAction(workspaceId, data);
        setSprints((prev) => prev.map((s) => (s.id === tempId ? saved : s)));
        return saved;
      } catch (err) {
        setSprints((prev) => prev.filter((s) => s.id !== tempId));
        throw err;
      }
    },
    [workspaceId],
  );

  const updateSprint = useCallback(
    async (sprintId: string, data: UpdateSprint) => {
      const prev = sprints.find((s) => s.id === sprintId);
      setSprints((list) =>
        list.map((s) => (s.id === sprintId ? { ...s, ...data } : s)),
      );
      try {
        const saved = await updateSprintAction(workspaceId, sprintId, data);
        setSprints((list) => list.map((s) => (s.id === sprintId ? saved : s)));
        return saved;
      } catch (err) {
        if (prev) {
          setSprints((list) => list.map((s) => (s.id === sprintId ? prev : s)));
        }
        throw err;
      }
    },
    [workspaceId, sprints],
  );

  const deleteSprint = useCallback(
    async (sprintId: string) => {
      const snapshot = sprints.find((s) => s.id === sprintId);
      setSprints((prev) => prev.filter((s) => s.id !== sprintId));
      try {
        await deleteSprintAction(workspaceId, sprintId);
      } catch (err) {
        if (snapshot) {
          setSprints((prev) => [...prev, snapshot]);
        }
        throw err;
      }
    },
    [workspaceId, sprints],
  );

  const activateSprint = useCallback(
    async (sprintId: string) => {
      setSprints((prev) =>
        prev.map((s) => {
          if (s.id === sprintId) return { ...s, status: 'active' as const };
          if (s.status === 'active') return { ...s, status: 'planning' as const };
          return s;
        }),
      );
      try {
        const saved = await activateSprintAction(workspaceId, sprintId);
        setSprints((prev) => prev.map((s) => (s.id === sprintId ? saved : s)));
        return saved;
      } catch (err) {
        setSprints(initialSprints);
        throw err;
      }
    },
    [workspaceId, initialSprints],
  );

  const completeSprint = useCallback(
    async (sprintId: string, data: CompleteSprint) => {
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? { ...s, status: 'completed' as const } : s)),
      );
      try {
        const saved = await completeSprintAction(workspaceId, sprintId, data);
        setSprints((prev) => prev.map((s) => (s.id === sprintId ? saved : s)));
        return saved;
      } catch (err) {
        setSprints(initialSprints);
        throw err;
      }
    },
    [workspaceId, initialSprints],
  );

  return {
    sprints,
    addSprint,
    updateSprint,
    deleteSprint,
    activateSprint,
    completeSprint,
  };
}
