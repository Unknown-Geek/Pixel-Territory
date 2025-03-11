/**
 * Type declarations for @devvit/public-api package
 */

declare module "@devvit/public-api" {
  export interface DevvitContext {
    redis: {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<void>;
    };
  }

  export interface SchedulerHandler {
    name: string;
    onRun: (context: DevvitContext) => Promise<void>;
  }

  export interface ScheduleOptions {
    handler: string;
    cron: string;
  }

  export const Devvit: {
    addSchedulerHandler: (handler: SchedulerHandler) => void;
    schedule: (options: ScheduleOptions) => void;
  };
}
