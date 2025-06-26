import mongoose from 'mongoose';

// Feature Image Subdocument
const featureImageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

// Tiles Info Subdocument
const tilesInfoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  features: {
    type: [String],
    default: [],
  },
  tiles: {
    type: [String],
    required: true,
  },
}, { _id: false });

// Contact Info Subdocument
const contactInfoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL (http/https)'],
  },
  socialMediaURL: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Social media URL must be a valid URL (http/https)'],
  },
}, { _id: false });

// Main Master Schema
const masterConfigSchema = new mongoose.Schema({
  // 1. Room-wise images
  places_images: {
    type: Map,
    of: [String],
    default: {},
  },

  // 2. Feature Images (multiple)
  feature_images: {
    type: [featureImageSchema],
    default: [],
  },

  // 3. Tiles Info (single block)
  tiles_info: {
    type: tilesInfoSchema,
    required: false,
  },

  // 4. Contact Info (single block)
  contact_info: {
    type: contactInfoSchema,
    required: false,
  },

  // 5. Slider Image
  slider_images: {
  type: [String], // array of URLs
  default: [],
}
}, { timestamps: true });

export default mongoose.model('MasterConfig', masterConfigSchema);