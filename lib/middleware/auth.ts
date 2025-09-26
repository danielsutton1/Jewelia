import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const RATE_LIMIT = 100; // requests per minute per tenant
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export async function authMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    // RBAC: Check role
    const role = payload.role as string;
    if (!role) {
      return NextResponse.json({ error: 'Missing role in token' }, { status: 403 });
    }
    // Tenant isolation
    const tenantId = payload.tenant_id as string;
    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenant_id in token' }, { status: 403 });
    }
    // Rate limiting
    const now = Date.now();
    const rl = rateLimitMap.get(tenantId) || { count: 0, lastReset: now };
    if (now - rl.lastReset > 60000) {
      rl.count = 0;
      rl.lastReset = now;
    }
    rl.count++;
    if (rl.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    rateLimitMap.set(tenantId, rl);
    // Attach user info to request (for downstream handlers)
    (request as any).user = { ...payload, role, tenantId };
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
} 