import fs from 'fs';
import MasterConfig from '../models/configure.model.js'
import { uploadToConfigureS3, deleteFromS3 } from '../services/s3Uploder.js';

export const createMasterConfig = async (req, res) => {
  try {
    const {
      title,
      description,
      features,
      name,
      email,
      phone,
      address,
      website,
      socialMediaURL
    } = req.body;

    const places_images = {};
    const feature_images = [];
    const tiles = [];

    let slider_images = [];

    // Map of files by fieldname (e.g., room1, image1, tiles[], slider)
    const imageMap = {};
    req.files.forEach(file => {
      imageMap[file.fieldname] = imageMap[file.fieldname] || [];
      imageMap[file.fieldname].push(file);
    });

    // Upload all files to S3 + cleanup
    for (const [field, files] of Object.entries(imageMap)) {
      for (const file of files) {
        const s3Url = await uploadToConfigureS3(file);
        fs.unlinkSync(file.path); // Delete temp file

        // Room images (e.g., room1, room2...)
        if (field.startsWith('room')) {
          if (!places_images[field]) places_images[field] = [];
          places_images[field].push(s3Url);
        }

        // Feature images (e.g., image1, image2… with name1, description1…)
        else if (field.startsWith('image')) {
          const index = field.replace('image', '');
          const feature = {
            name: req.body[`name${index}`],
            description: req.body[`description${index}`],
            image: s3Url
          };
          if (feature.name && feature.description) {
            feature_images.push(feature);
          }
        }

        // Tiles images (multiple)
        else if (field === 'tiles') {
          tiles.push(s3Url);
        }

        // Slider image (single)
        else if (field === 'slider_image') {
            if (!slider_images) slider_images = [];
            slider_images.push(s3Url);
            }
      }
    }

    // Parse features[] if sent as comma-separated or JSON string
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = Array.isArray(features)
          ? features
          : JSON.parse(features); // stringified array
      } catch (err) {
        parsedFeatures = features.split(',').map(f => f.trim());
      }
    }

    // Final payload
    const payload = {
      places_images,
      feature_images,
      tiles_info: {
        title,
        description,
        features: parsedFeatures,
        tiles
      },
      contact_info: {
        name,
        email,
        phone,
        address,
        website,
        socialMediaURL
      },
      slider_images
    };

    const saved = await MasterConfig.create(payload);

    res.status(201).json({
      success: true,
      message: 'MasterConfig created successfully',
      data: saved
    });
  } catch (error) {
    console.error('Create MasterConfig Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating MasterConfig',
      error: error.message
    });
  }
};


export const updateMasterConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterConfig.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }

    const {
      title,
      description,
      features,
      name,
      email,
      phone,
      address,
      website,
      socialMediaURL
    } = req.body;

    // const updatedFields = { ...existing._doc };
    const updatedFields = {
    ...existing._doc,
    places_images: Object.fromEntries(existing.places_images) // convert Map to plain object
    };
    const imageMap = {};
    req.files.forEach(file => {
      imageMap[file.fieldname] = imageMap[file.fieldname] || [];
      imageMap[file.fieldname].push(file);
    });

    for (const [field, files] of Object.entries(imageMap)) {
      for (const file of files) {
        const s3Url = await uploadToConfigureS3(file);
        fs.unlinkSync(file.path);

        // Tiles update by index
        if (field === 'tiles') {
          const tileIndex = parseInt(req.body.tile_replace_index);
          if (!isNaN(tileIndex) && updatedFields.tiles_info.tiles[tileIndex]) {
            await deleteFromS3(updatedFields.tiles_info.tiles[tileIndex]);
            updatedFields.tiles_info.tiles[tileIndex] = s3Url;
          } else {
            updatedFields.tiles_info.tiles.push(s3Url);
          }
        }

        // Slider image update by index
        else if (field === 'slider_image') {
          const sliderIndex = parseInt(req.body.slider_replace_index);
          if (!isNaN(sliderIndex) && updatedFields.slider_images?.[sliderIndex]) {
            await deleteFromS3(updatedFields.slider_images[sliderIndex]);
            updatedFields.slider_images[sliderIndex] = s3Url;
          } else {
            updatedFields.slider_images = updatedFields.slider_images || [];
            updatedFields.slider_images.push(s3Url);
          }
        }

        // Room image update by index (e.g., room_roome3_index = 1)
        else if (field in updatedFields.places_images) {
            const roomIndexKey = Object.keys(req.body).find(k => k.startsWith(`room_${field}_index`));
            const roomIndex = roomIndexKey ? parseInt(req.body[roomIndexKey]) : NaN;

            if (!isNaN(roomIndex) && updatedFields.places_images[field]?.[roomIndex]) {
                await deleteFromS3(updatedFields.places_images[field][roomIndex]);
                updatedFields.places_images[field][roomIndex] = s3Url;
            } else {
                updatedFields.places_images[field].push(s3Url);
            }
            }
            else if (field.startsWith('room')) {
                console.log(`Adding new room image for field: ${field}`);
            updatedFields.places_images[field] = [s3Url]; // add new room dynamically
        }



        // Feature image update by index
        // else if (field.startsWith('image')) {
        //   const featureIndex = parseInt(req.body.feature_index);
        //   const nameKey = `name${featureIndex}`;
        //   const descKey = `description${featureIndex}`;

        //   const feature = {
        //     name: req.body[nameKey],
        //     description: req.body[descKey],
        //     image: s3Url
        //   };

        //   if (!isNaN(featureIndex) && updatedFields.feature_images?.[featureIndex]) {
        //     await deleteFromS3(updatedFields.feature_images[featureIndex].image);
        //     updatedFields.feature_images[featureIndex] = feature;
        //   } else {
        //     updatedFields.feature_images.push(feature);
        //   }
        // }

        else if (field.startsWith('image')) {
            const index = parseInt(field.replace('image', ''));
            const name = req.body[`name${index}`];
            const description = req.body[`description${index}`];

            if (!isNaN(index)) {
                const oldFeature = updatedFields.feature_images[index];

                // Delete old image from S3 if exists
                if (oldFeature?.image) {
                await deleteFromS3(oldFeature.image);
                }

                // Build new object
                const newFeature = {
                name: name || oldFeature?.name || '',
                description: description || oldFeature?.description || '',
                image: s3Url
                };

                updatedFields.feature_images[index] = newFeature;
            }
            }

      }
    }

    // Text fields
    if (title || description || features) {
      updatedFields.tiles_info.title = title || updatedFields.tiles_info.title;
      updatedFields.tiles_info.description = description || updatedFields.tiles_info.description;
      if (features) {
        try {
          updatedFields.tiles_info.features = Array.isArray(features)
            ? features
            : JSON.parse(features);
        } catch (err) {
          updatedFields.tiles_info.features = features.split(',').map(f => f.trim());
        }
      }
    }

    updatedFields.contact_info = {
      name: name || updatedFields.contact_info.name,
      email: email || updatedFields.contact_info.email,
      phone: phone || updatedFields.contact_info.phone,
      address: address || updatedFields.contact_info.address,
      website: website || updatedFields.contact_info.website,
      socialMediaURL: socialMediaURL || updatedFields.contact_info.socialMediaURL
    };

    const updated = await MasterConfig.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({
      success: true,
      message: 'MasterConfig updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update MasterConfig Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating MasterConfig',
      error: error.message
    });
  }
};


export const deleteMasterConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MasterConfig.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }

    res.status(200).json({
      success: true,
      message: 'MasterConfig deleted successfully'
    });
  } catch (error) {
    console.error('Delete MasterConfig Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting MasterConfig',
      error: error.message
    });
  }
};



export const getAllConfigs = async (req, res) => {
  try {
    const configs = await MasterConfig.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'All Master Configurations fetched successfully',
      data: configs
    });
  } catch (error) {
    console.error('Error fetching all configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configurations',
      error: error.message
    });
  }
};


export const getConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await MasterConfig.findById(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Configuration fetched successfully',
      data: config
    });
  } catch (error) {
    console.error('Error fetching config by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration',
      error: error.message
    });
  }
};
