/**
 * Tests for the pi-perms Pi extension wrapper.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { extractInput } from "../extension.ts";

describe("extractInput", () => {
  it("extracts command from bash tool", () => {
    assert.equal(extractInput("bash", { command: "git status" }), "git status");
  });

  it("extracts path from read tool", () => {
    assert.equal(
      extractInput("read", { path: "src/index.ts" }),
      "src/index.ts",
    );
  });

  it("extracts path from write tool", () => {
    assert.equal(extractInput("write", { path: "dist/out.js" }), "dist/out.js");
  });

  it("extracts path from edit tool", () => {
    assert.equal(extractInput("edit", { path: "/etc/hosts" }), "/etc/hosts");
  });

  it("extracts domain from webfetch URL", () => {
    assert.equal(
      extractInput("webfetch", { url: "https://example.com/page" }),
      "example.com",
    );
  });

  it("returns raw URL when malformed", () => {
    assert.equal(extractInput("webfetch", { url: "not-a-url" }), "not-a-url");
  });

  it("returns empty string for unknown tool", () => {
    assert.equal(extractInput("unknown", { data: "whatever" }), "");
  });

  it("returns empty string for missing command", () => {
    assert.equal(extractInput("bash", {}), "");
  });

  it("returns empty string for non-string command", () => {
    assert.equal(extractInput("bash", { command: 123 }), "");
  });

  it("returns empty string for missing path", () => {
    assert.equal(extractInput("read", {}), "");
  });
});
