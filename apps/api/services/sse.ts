import type { Response } from "express";

import type { RealtimeStats } from "@pulseboard/types";

interface SSEClient {
  id: string;
  siteId: string;
  res: Response;
}

class SSEManager {
  private clients: Map<string, SSEClient[]> = new Map();

  addClient(siteId: string, client: SSEClient): void {
    const clients = this.clients.get(siteId) ?? [];
    clients.push(client);
    this.clients.set(siteId, clients);
  }

  removeClient(siteId: string, clientId: string): void {
    const clients = this.clients.get(siteId);

    if (!clients) {
      return;
    }

    const remainingClients = clients.filter((client) => client.id !== clientId);

    if (remainingClients.length === 0) {
      this.clients.delete(siteId);
      return;
    }

    this.clients.set(siteId, remainingClients);
  }

  broadcast(siteId: string, stats: RealtimeStats): void {
    const clients = this.clients.get(siteId) ?? [];
    const payload = `data: ${JSON.stringify(stats)}\n\n`;

    for (const client of clients) {
      client.res.write(payload);
    }
  }

  getConnectionCount(): Record<string, number> {
    return Object.fromEntries(
      Array.from(this.clients.entries()).map(([siteId, clients]) => [siteId, clients.length]),
    );
  }
}

export const sseManager = new SSEManager();
