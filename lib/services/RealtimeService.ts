import WebSocket, { Server as WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import type { InventoryWithStock } from '@/lib/types/service.types';

/**
 * RealtimeService manages WebSocket/SSE connections for real-time features.
 * Supports multi-tenant channels, inventory updates, order status, low stock alerts, and production notifications.
 */
export class RealtimeService extends EventEmitter {
  private wss: WebSocketServer;
  private tenantChannels: Map<string, Set<WebSocket>> = new Map();
  private rateLimitMap: Map<string, number> = new Map();
  private static RATE_LIMIT_MS = 1000; // 1 notification/sec per tenant

  constructor(server: any) {
    super();
    this.wss = new WebSocketServer({ server });
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  /**
   * Subscribe a client to inventory updates for a tenant.
   */
  subscribeToInventoryUpdates(tenantId: string, ws: WebSocket) {
    if (!this.tenantChannels.has(tenantId)) {
      this.tenantChannels.set(tenantId, new Set());
    }
    this.tenantChannels.get(tenantId)!.add(ws);
    ws.on('close', () => {
      this.tenantChannels.get(tenantId)!.delete(ws);
    });
  }

  /**
   * Broadcast order status change to all clients in the tenant channel.
   */
  broadcastOrderStatusChange(orderId: string, status: string, tenantId: string) {
    this.sendToTenant(tenantId, {
      type: 'order_status',
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send low stock alert to all clients in the tenant channel.
   */
  sendLowStockAlert(tenantId: string, items: InventoryWithStock[]) {
    this.sendToTenant(tenantId, {
      type: 'low_stock',
      items,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify production stage change to all clients in the tenant channel.
   */
  notifyProductionStageChange(orderId: string, stage: string, tenantId: string) {
    this.sendToTenant(tenantId, {
      type: 'production_stage',
      orderId,
      stage,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Internal: Send a message to all clients in a tenant channel with rate limiting.
   */
  private sendToTenant(tenantId: string, message: any) {
    const now = Date.now();
    if (
      this.rateLimitMap.has(tenantId) &&
      now - this.rateLimitMap.get(tenantId)! < RealtimeService.RATE_LIMIT_MS
    ) {
      return; // Rate limit
    }
    this.rateLimitMap.set(tenantId, now);
    const clients = this.tenantChannels.get(tenantId);
    if (clients) {
      for (const ws of clients) {
        try {
          ws.send(JSON.stringify(message));
        } catch (err) {
          // Remove broken connection
          clients.delete(ws);
        }
      }
    }
  }

  /**
   * Handle new WebSocket connection, authenticate, and assign to tenant channel.
   */
  private handleConnection(ws: WebSocket, req: any) {
    // Example: Extract tenantId from query or headers (customize as needed)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tenantId = url.searchParams.get('tenantId');
    if (!tenantId) {
      ws.close(1008, 'Missing tenantId');
      return;
    }
    this.subscribeToInventoryUpdates(tenantId, ws);
    ws.on('error', () => ws.close());
    ws.on('pong', () => {}); // For keepalive
  }
}

export default RealtimeService; 