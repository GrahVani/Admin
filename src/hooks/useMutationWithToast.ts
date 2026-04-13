"use client";

import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useToast } from "./useToast";

interface MutationToastConfig {
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
}

interface UseMutationWithToastOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  toastConfig?: MutationToastConfig;
}

/**
 * Wrapper hook for useMutation that automatically handles toast notifications
 * 
 * @example
 * const mutation = useMutationWithToast({
 *   mutationFn: updateUser,
 *   toastConfig: {
 *     successMessage: "User updated successfully",
 *     errorMessage: "Failed to update user",
 *   },
 *   onSuccess: () => {
 *     // Additional success logic
 *   }
 * });
 */
export function useMutationWithToast<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationWithToastOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { success, error: showErrorToast } = useToast();
  const { toastConfig, onSuccess, onError, ...restOptions } = options;

  return useMutation({
    ...restOptions,
    onSuccess: (data, variables, context) => {
      if (toastConfig?.showSuccess !== false && toastConfig?.successMessage) {
        success(toastConfig.successMessage);
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (toastConfig?.showError !== false) {
        const message = 
          toastConfig?.errorMessage || 
          (error instanceof Error ? error.message : "An error occurred");
        showErrorToast(message);
      }
      onError?.(error, variables, context);
    },
  });
}

/**
 * Pre-configured mutation hooks for common admin operations
 */

export function useUpdateMutation<TData = unknown>(
  entityName: string,
  options?: UseMutationOptions<TData, Error, any>
) {
  return useMutationWithToast<TData, Error, any>({
    ...options,
    toastConfig: {
      successMessage: `${entityName} updated successfully`,
      errorMessage: `Failed to update ${entityName.toLowerCase()}`,
      ...options?.toastConfig,
    },
  });
}

export function useDeleteMutation<TData = unknown>(
  entityName: string,
  options?: UseMutationOptions<TData, Error, any>
) {
  return useMutationWithToast<TData, Error, any>({
    ...options,
    toastConfig: {
      successMessage: `${entityName} deleted successfully`,
      errorMessage: `Failed to delete ${entityName.toLowerCase()}`,
      showSuccess: true,
      ...options?.toastConfig,
    },
  });
}

export function useCreateMutation<TData = unknown>(
  entityName: string,
  options?: UseMutationOptions<TData, Error, any>
) {
  return useMutationWithToast<TData, Error, any>({
    ...options,
    toastConfig: {
      successMessage: `${entityName} created successfully`,
      errorMessage: `Failed to create ${entityName.toLowerCase()}`,
      ...options?.toastConfig,
    },
  });
}

export function useActionMutation<TData = unknown>(
  actionName: string,
  entityName: string,
  options?: UseMutationOptions<TData, Error, any>
) {
  return useMutationWithToast<TData, Error, any>({
    ...options,
    toastConfig: {
      successMessage: `${actionName} completed successfully`,
      errorMessage: `Failed to ${actionName.toLowerCase()} ${entityName.toLowerCase()}`,
      ...options?.toastConfig,
    },
  });
}

export default useMutationWithToast;
