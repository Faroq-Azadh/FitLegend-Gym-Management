"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  classesService,
  markClassAsDeleted,
  type GymClassTemplate,
  type ClassCalendarResponse,
  type BookingRosterResponse,
  type BookingRosterRow,
  type CreateClassPayload,
  type CreateBookingPayload,
} from "@/lib/api/services/classes.service";
import { tokenStorage } from "@/lib/api/token";
import { getCurrentGymScope, getCurrentUserScope } from "@/lib/session-scope";

export function useClasses() {
  const userScope = getCurrentUserScope();
  const gymScope = getCurrentGymScope();
  return useQuery<GymClassTemplate[], Error>({
    queryKey: ["classes", userScope, gymScope],
    queryFn: () => classesService.getClasses(),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 5 * 1000,
  });
}

export function useClassCalendar() {
  const userScope = getCurrentUserScope();
  const gymScope = getCurrentGymScope();
  return useQuery<ClassCalendarResponse, Error>({
    queryKey: ["classes-calendar", userScope, gymScope],
    queryFn: () => classesService.getCalendar(),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 5 * 1000,
  });
}

export function useBookings(params?: { date?: string; q?: string; status?: string }) {
  const userScope = getCurrentUserScope();
  const gymScope = getCurrentGymScope();
  return useQuery<BookingRosterResponse, Error>({
    queryKey: ["classes-bookings", userScope, gymScope, params],
    queryFn: () => classesService.getBookings(params),
    enabled: typeof window !== "undefined" && tokenStorage.hasValidSession(),
    staleTime: 5 * 1000,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const userScope = getCurrentUserScope();
  const gymScope = getCurrentGymScope();

  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classesService.createClass(payload),
    onSuccess: async (newClass) => {
      if (newClass && newClass.id) {
        queryClient.setQueryData<GymClassTemplate[]>(["classes", userScope, gymScope], (old) => {
          if (!old || !Array.isArray(old)) return [newClass];
          return [newClass, ...old.filter((c) => String(c.id) !== String(newClass.id))];
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      await queryClient.refetchQueries({ queryKey: ["classes"] });
      await queryClient.invalidateQueries({ queryKey: ["classes-calendar"] });
      await queryClient.refetchQueries({ queryKey: ["classes-calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_classes_updated"));
      }
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  const userScope = getCurrentUserScope();
  const gymScope = getCurrentGymScope();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<CreateClassPayload> }) =>
      classesService.updateClass(id, payload),
    onSuccess: async (updatedClass, variables) => {
      // 1. Immediately update query cache with new values so UI updates instantly
      queryClient.setQueryData<GymClassTemplate[]>(["classes", userScope, gymScope], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((item) => {
          if (String(item.id) === String(variables.id)) {
            return {
              ...item,
              ...variables.payload,
              ...updatedClass,
              id: String(variables.id),
            };
          }
          return item;
        });
      });

      // 2. Refetch queries from backend
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      await queryClient.refetchQueries({ queryKey: ["classes"] });
      await queryClient.invalidateQueries({ queryKey: ["classes-calendar"] });
      await queryClient.refetchQueries({ queryKey: ["classes-calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_classes_updated"));
      }
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  const userScope = getCurrentUserScope();
  const gymScope = getCurrentGymScope();

  return useMutation({
    mutationFn: (id: string | number) => classesService.deleteClass(id),
    onSuccess: async (_, id) => {
      markClassAsDeleted(id, gymScope);
      queryClient.setQueryData<GymClassTemplate[]>(["classes", userScope, gymScope], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((item) => String(item.id) !== String(id) && item.is_active !== false);
      });
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      await queryClient.refetchQueries({ queryKey: ["classes"] });
      await queryClient.invalidateQueries({ queryKey: ["classes-calendar"] });
      await queryClient.refetchQueries({ queryKey: ["classes-calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_classes_updated"));
      }
    },
  });
}

export function useApproveBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => classesService.approveBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_bookings_updated"));
      }
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => classesService.rejectBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_bookings_updated"));
      }
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => classesService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_bookings_updated"));
      }
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      classesService.deleteBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitlegend_gym_bookings_updated"));
      }
    },
  });
}
