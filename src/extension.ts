/**
 * pi-perms — Pi CLI extension for cross-agent permission enforcement.
 *
 * Subscribes to `tool_call` events and evaluates them against the loaded
 * permission policy. The policy is discovered by walking up from `cwd`,
 * reading `.agents/permissions.json` and `.agents/permissions.local.json`
 * at each level, plus native agent configs specified by the canonical
 * policy's `with` field.
 *
 * No separate configuration needed — the `.agents/permissions.json`
 * file controls everything: which harnesses to read, how far to walk up,
 * and what the rules are.
 */

import type {
  ExtensionContext,
  ExtensionFactory,
  ExtensionUIContext,
  ToolCallEvent,
  ToolCallEventResult,
} from "@earendil-works/pi-coding-agent";

import { evaluate } from "agent-perms/evaluate";
import { loadPolicy } from "agent-perms/loader";

/** Customisable message shown when a tool call is denied. */
const BLOCK_MESSAGE = "Denied by permission policy";

export default function piPerms(pi: Parameters<ExtensionFactory>[0]): void {
  pi.on("tool_call", async (event: ToolCallEvent, ctx: ExtensionContext) => {
    const policy = await loadPolicy({ cwd: ctx.cwd });

    const toolName = event.toolName;
    const input = extractInput(toolName, event.input);
    const decision = evaluate(policy, toolName, input);

    switch (decision) {
      case "deny":
        return {
          block: true,
          reason: BLOCK_MESSAGE,
        } satisfies ToolCallEventResult;
      case "ask":
        return handleAsk(ctx.ui, ctx.hasUI);
      case "allow":
        return undefined;
    }
  });
}

function handleAsk(
  ui: ExtensionUIContext,
  hasUI: boolean,
): ToolCallEventResult | undefined {
  if (!hasUI) return undefined;

  // A more complete implementation would use ctx.ui.confirm().
  // For now, ask means "ask the user" — return undefined and let
  // Pi handle the default confirmation flow.
  void ui;
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
