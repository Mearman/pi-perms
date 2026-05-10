/**
 * pi-perms — Pi CLI extension for cross-agent permission enforcement.
 *
 * Subscribes to `tool_call` events and evaluates them against the loaded
 * permission policy. Blocks denied calls, prompts on ask, and allows
 * everything else according to the policy's defaultMode.
 */

import type {
  ExtensionContext,
  ExtensionFactory,
  ExtensionUIContext,
  ToolCallEvent,
  ToolCallEventResult,
} from "@earendil-works/pi-coding-agent";

import { evaluate, loadPolicy } from "agent-perms";

interface PiPermsConfig {
  nativeSources?: ("claude-code" | "codex" | "opencode")[];
  blockMessage?: string;
}

const DEFAULT_CONFIG: PiPermsConfig = {};

export default function piPerms(pi: Parameters<ExtensionFactory>[0]): void {
  const config: PiPermsConfig = DEFAULT_CONFIG;

  pi.on("tool_call", async (event: ToolCallEvent, ctx: ExtensionContext) => {
    const policy = await loadPolicy({
      cwd: ctx.cwd,
      nativeSources: config.nativeSources,
    });

    const toolName = event.toolName;
    const input = extractInput(toolName, event.input);
    const decision = evaluate(policy, toolName, input);

    switch (decision) {
      case "deny":
        return {
          block: true,
          reason: config.blockMessage ?? "Denied by permission policy",
        } satisfies ToolCallEventResult;
      case "ask":
        return handleAsk(ctx.ui, ctx.hasUI, toolName);
      case "allow":
        return undefined;
    }
  });
}

function handleAsk(
  ui: ExtensionUIContext,
  hasUI: boolean,
  toolName: string,
): ToolCallEventResult | undefined {
  if (!hasUI) return undefined;

  // A more complete implementation would use ctx.ui.confirm().
  // For now, ask means "ask the user" — but we return undefined
  // and let Pi handle the default confirmation flow.
  void ui;
  void toolName;
  return undefined;
}

/**
 * Extract a single input string from tool parameters for rule matching.
 */
export function extractInput(
  toolName: string,
  input: Record<string, unknown>,
): string {
  switch (toolName) {
    case "bash":
      return typeof input.command === "string" ? input.command : "";
    case "read":
    case "write":
    case "edit":
      return typeof input.path === "string" ? input.path : "";
    case "webfetch":
      if (typeof input.url === "string") return extractDomain(input.url);
      return "";
    default:
      return "";
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
