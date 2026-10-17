"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  coachesService,
  type CoachesResponse,
  type CoachItem,
  type AddCoachPayload,
  type CoachDetail,
  type PatchedCoachSelfUpdate,
  type CoachStudentRow,
  type CoachPerformance,
} from "@/lib/api/services/coaches.service";
import { tokenStorage } from "@/lib/api/token";

import { getCurrentUserScope } from "@/lib/session-scope";

export function useCoaches() {
  const userScope = getCurrentUserScope();
  return useQuery<CoachesResponse | CoachItem[], Error>({
    queryKey: ["coaches", userScope],
    queryFn: () => coachesService.getCoaches(),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 30 * 1000,
  });
}

export function useAddCoach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCoachPayload) => coachesService.addCoach(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      await queryClient.refetchQueries({ queryKey: ["coaches"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    },
  });
}

export function useUpdateCoach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<AddCoachPayload> }) =>
      coachesService.updateCoach(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      await queryClient.refetchQueries({ queryKey: ["coaches"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    },
  });
}

export function useDeleteCoach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => coachesService.deleteCoach(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      await queryClient.refetchQueries({ queryKey: ["coaches"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    },
  });
}

export function useCoachMe() {
  const userScope = getCurrentUserScope();
  return useQuery<CoachDetail, Error>({
    queryKey: ["coach-me", userScope],
    queryFn: () => coachesService.getCoachMe(),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 30 * 1000,
  });
}

export function useUpdateCoachMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchedCoachSelfUpdate) => coachesService.updateCoachMe(payload),
    onSuccess: async (updated) => {
      queryClient.setQueryData(["coach-me"], updated);
      await queryClient.invalidateQueries({ queryKey: ["coach-me"] });
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      await queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
    },
  });
}

export function useCoachStudents(params?: { status?: string; search?: string }) {
  const userScope = getCurrentUserScope();
  return useQuery<CoachStudentRow[], Error>({
    queryKey: ["coach-students", userScope, params?.status, params?.search],
    queryFn: () => coachesService.getMyStudents(params),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 15 * 1000,
  });
}

export function useCoachPerformance(days: number = 30) {
  const userScope = getCurrentUserScope();
  return useQuery<CoachPerformance, Error>({
    queryKey: ["coach-performance", userScope, days],
    queryFn: () => coachesService.getCoachPerformance(days),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 30 * 1000,
  });
}
