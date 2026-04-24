import { apiClient } from "@/lib/apiClient";
import type { FeedbackRequest, FeedbackResponse } from "@/types";

export const feedbackApi = {
  submit: (request: FeedbackRequest) =>
    apiClient.post<FeedbackResponse>("/api/feedback", request),

  list: () =>
    apiClient.get<FeedbackResponse[]>("/api/feedback"),
};
