import AuditLog from '../models/AuditLog.js';
export const logAudit = async ({ actorId, action, entity, entityId, before, after, ip }) => {
  try { await AuditLog.create({ actorId, action, entity, entityId, before, after, ip }); }
  catch (e) { console.error('Audit log failed:', e); }
};
