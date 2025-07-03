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
    const userId = req.user.userId;
    const places_images = {};
    const feature_images = [];
    const tiles = [];

    let slider_images = [];

    const imageMap = {};
    req.files.forEach(file => {
      imageMap[file.fieldname] = imageMap[file.fieldname] || [];
      imageMap[file.fieldname].push(file);
    });

    for (const [field, files] of Object.entries(imageMap)) {
  for (const file of files) {
    const s3Url = await uploadToConfigureS3(file);
    fs.unlinkSync(file.path);

    // Feature images: image1, image2, etc.
    if (/^image\d+$/.test(field)) {
      const index = field.match(/\d+/)?.[0];
      const fname = req.body[`name${index}`];
      const fdesc = req.body[`description${index}`];
      if (fname && fdesc) {
        feature_images.push({
          name: fname,
          description: fdesc,
          image: s3Url,
        });
      }
    }

    // Tiles
    else if (field === 'tiles') {
      tiles.push(s3Url);
    }

    // Slider
    else if (field === 'slider_image') {
      slider_images.push(s3Url);
    }

    else {
      if (!places_images[field]) places_images[field] = [];
      places_images[field].push(s3Url);
    }
  }
}

    // Parse features[] if sent as comma-separated or JSON string
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = Array.isArray(features)
          ? features
          : JSON.parse(features);
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
      slider_images,
      created_by: userId
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
        
        else if (!['tiles', 'slider_image', 'feature_images'].includes(field)) {
            updatedFields.places_images[field] = [s3Url];
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
    const userId = req.user.userId;
    const configs = await MasterConfig.find({ created_by: userId }).sort({ createdAt: -1 });
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


// export const getAllConfigs = async (req, res) => {
//   try {
//     const configs = await MasterConfig.find().sort({ createdAt: -1 });
//     const dummy = [{
//       places_images: {
//         roome1: [
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/ce999694-bdfa-4d36-84fb-369bb880b9d7.jpg",
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/75979a7a-3f9a-4128-a12c-336717ab9ef1.jpg",
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/93dac3db-8e3b-4e52-a4ae-1bbd281be657.jpg"
//         ],
//         roome2: [
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/48efd030-8a3e-47f0-93df-a4e4f84edf0c.jpg",
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/f4962940-5c7b-44dd-8442-023bda7dc09a.jpg"
//         ],
//         room3: [
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/33b87680-9557-445d-a880-76c4ecec7e5f.jpg",
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/b5e06405-69bc-4ddc-9ca6-b45a116f77e3.jpg",
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/df364460-04ff-43ff-b638-3bd14c040a5f.jpg"
//         ]
//       },
//       feature_images: [
//         {
//           name: "name1 data",
//           image: "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/5a5db3da-8d3b-40f6-8b72-9b71762afd4e.jpg",
//           description: "description1 data"
//         },
//         {
//           name: "name2 data",
//           image: "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/5615555c-ce45-481e-8878-514edf275322.jpeg",
//           description: "description2 data"
//         }
//       ],
//       tiles_info: {
//         title: "test1",
//         description: "Tiles Info Description",
//         features: ["glossy", "Anti-slip"],
//         tiles: [
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/7a8135aa-2061-49b7-a837-b87dba583ff4.jpg",
//           "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/fb22db54-340d-41e0-93d6-104b8f8f295d.jpg"
//         ]
//       },
//       contact_info: {
//         name: "Company Name",
//         email: "admin@example.com",
//         phone: "9999999999",
//         address: "City, Country",
//         website: "https://yourdomain.com",
//         socialMediaURL: "https://linkedin.com/in"
//       },
//       slider_images: [
//         "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/c16f6e8f-7cea-4ccb-bc58-75556348c453.jpg",
//         "https://ats-tiles-bucket.s3.eu-north-1.amazonaws.com/configure/95115292-d95c-4333-9dfb-939512dbde03.jpg"
//       ],
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       __v: 0
//     }];

//     const filledConfigs = configs.map((config) => {
//       const obj = config.toObject();
//       return {
//         _id: obj._id,
//         places_images: Object.keys(obj.places_images || {}).length ? obj.places_images : dummy[0].places_images,
//         feature_images: (obj.feature_images || []).length ? obj.feature_images : dummy[0].feature_images,
//         tiles_info: {
//             title: obj.tiles_info?.title || dummy[0].tiles_info.title,
//             description: obj.tiles_info?.description || dummy[0].tiles_info.description,
//             features:
//               (Array.isArray(obj.tiles_info?.features) && obj.tiles_info.features.length)
//                 ? obj.tiles_info.features
//                 : dummy[0].tiles_info.features,
//             tiles: (obj.tiles_info?.tiles && obj.tiles_info.tiles.length)
//               ? obj.tiles_info.tiles
//               : dummy[0].tiles_info.tiles
//           },
//         contact_info: obj.contact_info || dummy[0].contact_info,
//         slider_images: (obj.slider_images || []).length ? obj.slider_images : dummy[0].slider_images,
//         createdAt: obj.createdAt,
//         updatedAt: obj.updatedAt,
//         __v: obj.__v
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: 'All Master Configurations fetched successfully',
//       data: filledConfigs.length ? filledConfigs : [dummy[0]]
//     });
//   } catch (error) {
//     console.error('Error fetching all configs:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch configurations',
//       error: error.message
//     });
//   }
// };


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
