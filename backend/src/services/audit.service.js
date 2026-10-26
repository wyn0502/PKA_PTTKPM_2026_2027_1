// Dung Pham Anh: Ghi và tra cứu nhật ký thao tác (NFR-06)
import { auditRepository } from '../repositories/audit.repository.js';
import { page } from '../utils/validate.js';

export const auditService = {
  record(db, actor, action, entity, entityId, detail) {
    return auditRepository.insert(
      { accountId: actor?.accountId ?? null, action, entity, entityId, detail },
      db ?? undefined,
    );
  },

  async list(query) {
    const { page: pageNo, pageSize, offset } = page(query);
    const { rows, total } = await auditRepository.list({
      action: query.action || null,
      accountId: query.accountId || null,
      offset,
      limit: pageSize,
    });
    return {
      items: rows.map((r) => ({
        logId: r.log_id,
        accountId: r.account_id,
        username: r.username,
        action: r.action,
        entity: r.entity,
        entityId: r.entity_id,
        detail: r.detail,
        createdAt: r.created_at,
      })),
      total,
      page: pageNo,
      pageSize,
    };
  },
};
