import { prisma } from "../db/prisma";
import type { ActorType, Prisma } from "@prisma/client";

export async function writeAudit(input: {
  actorType: ActorType;
  actorAdminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeJson?: Prisma.InputJsonValue;
  afterJson?: Prisma.InputJsonValue;
  ipHash?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({
    data: {
      actorType: input.actorType,
      actorAdminId: input.actorAdminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeJson: input.beforeJson,
      afterJson: input.afterJson,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
    },
  });
}
