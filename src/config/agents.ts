export interface Agent {
  id: string;
  label: string;
  default?: boolean;
}

export const AGENTS = [
  { id: "bob", label: "Bob", default: true },
  { id: "claude", label: "Claude" },
  { id: "codex", label: "Codex" },
] as const satisfies readonly Agent[];

export type AgentId = (typeof AGENTS)[number]["id"];

function resolveDefaultAgentId(): AgentId {
  for (const agent of AGENTS) {
    if ("default" in agent && agent.default) {
      return agent.id;
    }
  }
  throw new Error("agents config: exactly one agent must have default: true");
}

export const DEFAULT_AGENT_ID: AgentId = resolveDefaultAgentId();

export const AGENT_STORAGE_KEY = "spektacular-agent";
