/**
 * SEED SCRIPT — Development only. Never run in production.
 * Creates: 1 admin, 1 owner, 1 renter, 3 camera items, system config
 * Run: npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// ── Inline schemas (avoids circular import issues in seed) ──────────────────
const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String,
    unique: true
   },
  emailVerified: {
     type: Boolean,
    default: false 
  },
  phone: String,
  phoneVerified: {
     type: Boolean, 
     default: false 
    },
  passwordHash: String,
  role: {
     type: String, 
     default: 'user' 
    },
  photoUrl: String,
  city: String,
  bio: String,
  status: {
     type: String, 
     default: 'active' 
    },
  trustScore: { 
    type: Number, 
    default: 50 
  },
  completedRentals: {
     type: Number, 
     default: 0 
    },
  ratingAvg: {
     type: Number, 
     default: 0 
    },
  ratingCount: {
    type: Number, 
    default: 0 
  },
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  category: String,
  brand: String,
  model: String,
  description: String,
  photos: [String],
  itemValue: Number,
  pricePerDay: Number,
  baseDeposit: Number,
  pickupHours: { start: String, end: String },
  minDays: Number,
  maxDays: Number,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  publicLocationOffset: { type: [Number], default: [0, 0] },
  addressPrivate: String,
  city: String,
  status: { type: String, default: 'active' },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
itemSchema.index({ location: '2dsphere' });

const configSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const User   = mongoose.models.User   || mongoose.model('User',   userSchema);
const Item   = mongoose.models.Item   || mongoose.model('Item',   itemSchema);
const Config = mongoose.models.Config || mongoose.model('Config', configSchema);

// ── Helpers ─────────────────────────────────────────────────────────────────
const hash = (plain) => bcrypt.hash(plain, 12);

// ── Main ────────────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  // Clear previous seed data
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Config.deleteMany({}),
  ]);
  console.log('🗑️   Cleared old seed data\n');

  // ── Users ────────────────────────────────────────────────────────────────
  const adminHash  = await hash('Admin@123456');
  const ownerHash  = await hash('Test@123456');
  const renterHash = await hash('Test@123456');

  const [admin, owner, renter] = await User.insertMany([
    {
      name: 'Super Admin',
      email: 'admin@rentlens.in',
      emailVerified: true,
      phone: '+919000000001',
      phoneVerified: true,
      passwordHash: adminHash,
      role: 'admin',
      city: 'Delhi',
      bio: 'Platform administrator',
      status: 'active',
      trustScore: 100,
    },
    {
      name: 'Ravi Sharma',
      email: 'owner@rentlens.in',
      emailVerified: true,
      phone: '+919000000002',
      phoneVerified: true,
      passwordHash: ownerHash,
      role: 'user',
      city: 'Delhi',
      bio: 'Professional photographer. Renting my gear when not in use.',
      status: 'active',
      trustScore: 75,
      completedRentals: 12,
      ratingAvg: 4.7,
      ratingCount: 8,
    },
    {
      name: 'Priya Mehta',
      email: 'renter@rentlens.in',
      emailVerified: true,
      phone: '+919000000003',
      phoneVerified: true,
      passwordHash: renterHash,
      role: 'user',
      city: 'Mumbai',
      bio: 'Freelance videographer looking for quality gear.',
      status: 'active',
      trustScore: 60,
      completedRentals: 3,
      ratingAvg: 4.2,
      ratingCount: 2,
    },
  ]);

  console.log('👥  Users created:');
  console.log(`    Admin  → admin@rentlens.in   / Admin@123456`);
  console.log(`    Owner  → owner@rentlens.in   / Test@123456`);
  console.log(`    Renter → renter@rentlens.in  / Test@123456\n`);

  // ── Items ─────────────────────────────────────────────────────────────────
  await Item.insertMany([
    {
      ownerId: owner._id,
      title: 'Sony Alpha A7 III Full-Frame Camera',
      category: 'Camera Body',
      brand: 'Sony',
      model: 'A7 III',
      description: 'Professional full-frame mirrorless camera. Excellent low-light performance. Includes 2 batteries, charger, and carry strap. Sensor cleaned and tested.',
      photos: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
        'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800',
        'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800',
      ],
      itemValue: 15000000,   // ₹1,50,000 in paise
      pricePerDay: 150000,   // ₹1,500/day in paise
      baseDeposit: 1500000,  // ₹15,000 in paise
      pickupHours: { start: '09:00', end: '20:00' },
      minDays: 1,
      maxDays: 30,
      location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
      publicLocationOffset: [0.003, -0.002],
      addressPrivate: '12, Lajpat Nagar II, New Delhi',
      city: 'Delhi',
      status: 'active',
      ratingAvg: 4.8,
      ratingCount: 6,
    },
    {
      ownerId: owner._id,
      title: 'Canon RF 70-200mm f/2.8 Telephoto Lens',
      category: 'Lens',
      brand: 'Canon',
      model: 'RF 70-200mm f/2.8L IS USM',
      description: 'Professional telephoto zoom lens. Perfect for events, sports, and wildlife. Image stabilized. Includes front/rear caps, UV filter, and padded case.',
      photos:[
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800",
    "https://images.unsplash.com/photo-1606986628218-0c1a16f2a7e4?w=800",
    "https://images.unsplash.com/photo-1455319977598-acbb0a2f04f2?w=800",
    "https://images.unsplash.com/photo-1617529497471-9218633199c0?w=800",
    ],
      itemValue: 25000000,   // ₹2,50,000 in paise
      pricePerDay: 200000,   // ₹2,000/day in paise
      baseDeposit: 2500000,  // ₹25,000 in paise
      pickupHours: { start: '10:00', end: '19:00' },
      minDays: 1,
      maxDays: 14,
      location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
      publicLocationOffset: [-0.004, 0.003],
      addressPrivate: '45, Saket, New Delhi',
      city: 'Delhi',
      status: 'active',
      ratingAvg: 4.9,
      ratingCount: 4,
    },
    {
      ownerId: renter._id, // renter also owns an item
      title: 'DJI Mavic 3 Pro Drone',
      category: 'Drone',
      brand: 'DJI',
      model: 'Mavic 3 Pro',
      description: 'Top-of-the-line cinematic drone with Hasselblad camera. 3 cameras (wide, medium tele, tele). 46min flight time. Fly More combo: 3 batteries, charging hub, ND filters.',
      photos: [
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
        'https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=800',
        'https://images.unsplash.com/photo-1524143986875-3b098d78b363?w=800',
        'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800',
      ],
      itemValue: 35000000,   // ₹3,50,000 in paise
      pricePerDay: 350000,   // ₹3,500/day in paise
      baseDeposit: 3500000,  // ₹35,000 in paise
      pickupHours: { start: '08:00', end: '18:00' },
      minDays: 1,
      maxDays: 7,
      location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Mumbai
      publicLocationOffset: [0.002, 0.005],
      addressPrivate: '78, Bandra West, Mumbai',
      city: 'Mumbai',
      status: 'active',
      ratingAvg: 4.6,
      ratingCount: 3,
    },
  ]);

  console.log('📷  Items created:');
  console.log('    1. Sony A7 III — Delhi — ₹1,500/day');
  console.log('    2. Canon RF 70-200mm Lens — Delhi — ₹2,000/day');
  console.log('    3. DJI Mavic 3 Pro Drone — Mumbai — ₹3,500/day\n');

  // ── System Config ─────────────────────────────────────────────────────────
  await Config.insertMany([
    { key: 'feePercent',           value: 10 },
    { key: 'pickupWindowHours',    value: 24 },
    { key: 'inspectionWindowHours',value: 48 },
    { key: 'disputeReplyHours',    value: 72 },
    { key: 'gracePeriodDays',      value: 2  },
    { key: 'maxRentalDays',        value: 60 },
    { key: 'longTermThresholdDays',value: 31 },
    { key: 'fallbackCapPercent',   value: 50 },
    { key: 'minDepositPercent',    value: 10 },
    { key: 'maxDepositPercent',    value: 50 },
  ]);

  console.log('⚙️   System config created (fee: 10%, grace: 2 days, etc.)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅  SEED COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Open: http://localhost:5173');
  console.log('   Login as Admin  → admin@rentlens.in / Admin@123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
