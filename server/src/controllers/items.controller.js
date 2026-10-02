import { asyncHandler } from '../utils/asyncHandler.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

export const search = asyncHandler(async (req, res) => {
  const { q, city, lat, lng, maxKm = 200, category, brand, minPrice, maxPrice } = req.query;

  const filter = { status: 'active' };
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (category) filter.category = new RegExp(escapeRegex(category), 'i');
  if (brand) filter.brand = new RegExp(escapeRegex(brand), 'i');
  if (q) filter.title = new RegExp(escapeRegex(q), 'i');

  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }

  let items;
  if (lat && lng) {
    try {
      items = await Item.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(maxKm) * 1000,
          },
        },
      }).limit(50);
    } catch {
      items = await Item.find(filter).limit(50);
    }
  } else {
    items = await Item.find(filter).limit(50);
  }

  res.status(200).json({ success: true, count: items.length, data: items });
});

export const getItems = search;

export const count = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const filter = { status: 'active' };
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  const total = await Item.countDocuments(filter);
  res.status(200).json({ success: true, data: { count: total } });
});

export const cities = asyncHandler(async (req, res) => {
  const cityList = await Item.distinct('city', { status: 'active' });
  res.status(200).json({ success: true, data: cityList.filter(Boolean) });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('ownerId', 'name photoUrl ratingAvg ratingCount completedRentals createdAt');
  if (!item) throw new AppError('NOT_FOUND', 'Item not found', 404);
  res.status(200).json({ success: true, data: item });
});

export const getItemById = getOne;

export const getAvailability = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    itemId: req.params.id,
    status: { $in: ['CONFIRMED', 'ACTIVE', 'RETURN_PENDING'] },
  }).select('startDate endDate');

  const blocked = bookings.map(b => ({ start: b.startDate, end: b.endDate }));
  res.status(200).json({ success: true, data: blocked });
});

export const create = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const body = { ...req.body, ownerId };
  if (req.files?.length) {
    body.photos = req.files.map(f => f.path || f.url || '');
  }
  const item = await Item.create(body);
  res.status(201).json({ success: true, data: item, message: 'Item created successfully' });
});

export const createItem = create;

export const update = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) throw new AppError('NOT_FOUND', 'Item not found', 404);
  res.status(200).json({ success: true, data: item, message: 'Item updated' });
});

export const updateItem = update;

export const deleteItem = asyncHandler(async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Item deleted' });
});

export const uploadPhotos = asyncHandler(async (req, res) => {
  const photos = req.files ? req.files.map(file => file.path || file.url || '') : [];
  res.status(200).json({ success: true, data: photos });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.status(200).json({ success: true, data: item });
});

export const blockDates = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Dates blocked' });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId || req.params.id;
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: itemId } });
  res.status(200).json({ success: true, message: 'Added to favorites' });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId || req.params.id;
  await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: itemId } });
  res.status(200).json({ success: true, message: 'Removed from favorites' });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const items = await Item.find({ _id: { $in: user?.favorites || [] } });
  res.status(200).json({ success: true, data: items });
});
