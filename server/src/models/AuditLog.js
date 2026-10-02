import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entity: String,
  entityId: mongoose.Schema.Types.ObjectId,
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  ip: String,
}, { timestamps: true });
export default mongoose.model('AuditLog', schema);
