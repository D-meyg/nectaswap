/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Mail, Send, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/hooks/ui/useModal";
import { useToast } from "@/hooks/ui/useToast";
import { userService } from "@/services/userService";
import { cn } from "@/lib/utils";

export const SEND_MESSAGE_MODAL_ID = "send-user-message";

const PRIORITIES = ["Info", "Warning", "Urgent"] as const;
type Priority = (typeof PRIORITIES)[number];

export function SendMessageModal() {
  const { isOpen, close, props } = useModal(SEND_MESSAGE_MODAL_ID);
  const toast = useToast();

  const userId = String(props?.userId ?? "");
  const recipient = String(props?.userName ?? "this user");

  const [priority, setPriority] = useState<Priority>("Info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // Reset the form each time the modal is opened for a user.
  useEffect(() => {
    if (isOpen) {
      setPriority("Info");
      setTitle("");
      setMessage("");
    }
  }, [isOpen]);

  const sendNotification = useMutation({
    mutationFn: () =>
      userService.sendNotification(userId, {
        title: title.trim(),
        message: message.trim(),
        priority: priority.toLowerCase(),
      }),
    onSuccess: () => {
      toast.show({
        type: "success",
        title: "Notification Sent",
        message: `Your message was delivered to ${recipient}.`,
      });
      close();
    },
    onError: (error: any) => {
      toast.show({
        type: "error",
        title: "Send Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send the notification.",
      });
    },
  });

  if (!isOpen) return null;

  const canSend =
    Boolean(userId) && Boolean(message.trim()) && !sendNotification.isPending;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className="absolute inset-0 bg-(--color-modal-overlay)"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-[28.125rem] flex-col overflow-hidden rounded-[0.75rem] bg-white shadow-[0_1.25rem_2.8125rem_rgba(15,23,42,0.16)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-(--color-border) px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-[rgba(78,43,204,0.1)] text-(--color-brand)">
              <Mail size={17} />
            </span>
            <div>
              <Text
                variant="subtitle"
                color="primary"
                weight="semibold"
                className="text-[1rem] leading-5"
              >
                Send Push Notification
              </Text>
              <Text
                variant="micro"
                color="tertiary"
                className="mt-0.5 block text-[0.75rem] leading-4"
              >
                To: {recipient}
              </Text>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-(--radius-sm) text-(--color-text-tertiary) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Priority */}
          <div>
            <Text
              variant="caption"
              color="primary"
              weight="semibold"
              className="mb-2 block text-[0.8125rem] leading-4"
            >
              Priority Level
            </Text>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((level) => {
                const active = priority === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={cn(
                      "h-9 rounded-[0.5rem] border font-geom text-[0.8125rem] font-semibold transition-colors",
                      active
                        ? "border-(--color-brand) bg-[rgba(78,43,204,0.08)] text-(--color-brand)"
                        : "border-transparent bg-(--color-bg-subtle) text-(--color-text-secondary) hover:bg-(--color-bg-card)",
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <Text
              variant="caption"
              color="primary"
              weight="semibold"
              className="mb-2 block text-[0.8125rem] leading-4"
            >
              Notification Title
            </Text>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Send Message to User"
              className="h-9 w-full rounded-[0.5rem] border border-(--color-border) px-3 text-[0.8125rem] text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-brand)"
            />
          </div>

          {/* Message */}
          <div>
            <Text
              variant="caption"
              color="primary"
              weight="semibold"
              className="mb-2 block text-[0.8125rem] leading-4"
            >
              Message Content
            </Text>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your notification message here…"
              rows={5}
              className="w-full resize-none rounded-[0.5rem] border border-(--color-border) px-3 py-2.5 text-[0.8125rem] text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-brand)"
            />
            <Text
              variant="micro"
              color="muted"
              className="mt-1.5 block text-[0.75rem] leading-4"
            >
              {message.length} characters
            </Text>
          </div>

          {/* Preview */}
          <div className="rounded-[0.5rem] border border-(--color-border) bg-(--color-bg-subtle) p-3">
            <Text
              variant="micro"
              color="muted"
              uppercase
              className="mb-2 block text-[0.6875rem] leading-4 tracking-wider"
            >
              Preview
            </Text>
            <div className="rounded-[0.375rem] border-l-[0.1875rem] border-(--color-brand) bg-white px-3 py-2.5">
              <Text
                variant="caption"
                color="primary"
                weight="semibold"
                className="block text-[0.8125rem] leading-4"
              >
                {title.trim() || "Send Message to User"}
              </Text>
              <Text
                variant="caption"
                color="secondary"
                className="mt-1 block text-[0.8125rem] leading-4"
              >
                {message.trim() || `Hello ${recipient},`}
              </Text>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-(--color-border) px-5 py-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={close}
            className="h-9 px-4 text-[0.8125rem]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSend}
            onClick={() => sendNotification.mutate()}
            className="h-9 px-4 text-[0.8125rem]"
          >
            <Send size={14} />
            {sendNotification.isPending ? "Sending…" : "Send Notification"}
          </Button>
        </div>
      </div>
    </div>
  );
}
