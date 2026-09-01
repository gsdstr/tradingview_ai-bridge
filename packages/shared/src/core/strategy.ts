import { evaluate } from "../connection.js";
import { getErrorMessage } from "../error.js";

export interface UpdateReportResult {
  success: boolean;
  updated: boolean;
  reason?: "button_not_found" | "button_disabled" | "click_failed" | "evaluation_failed";
  message?: string;
  error?: string;
}

export async function updateReport(): Promise<UpdateReportResult> {
  let result: UpdateReportResult | null;

  try {
    result = await evaluate<UpdateReportResult>(function evalUpdateReport() {
      try {
        const button = document.querySelector<HTMLElement>(
          '[data-qa-id="backtesting-updated-report-snackbar"] [data-qa-id="ui-lib-snackbar-action-button"]',
        );

        if (!button) {
          return {
            success: true,
            updated: false,
            reason: "button_not_found",
            message: "Update report button not found in snackbar.",
          };
        }

        if (
          (button as HTMLButtonElement).disabled ||
          button.getAttribute("aria-disabled") === "true"
        ) {
          return {
            success: true,
            updated: false,
            reason: "button_disabled",
            message: "Update report button is disabled.",
          };
        }

        button.click();

        return {
          success: true,
          updated: true,
          message: "Update report button clicked successfully.",
        };
      } catch (error: unknown) {
        return {
          success: false,
          updated: false,
          reason: "click_failed",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });
  } catch (error: unknown) {
    return {
      success: false,
      updated: false,
      reason: "evaluation_failed",
      error: getErrorMessage(error),
    };
  }

  if (!result) {
    return {
      success: false,
      updated: false,
      reason: "evaluation_failed",
      error: "No response from CDP evaluation.",
    };
  }

  return result;
}
