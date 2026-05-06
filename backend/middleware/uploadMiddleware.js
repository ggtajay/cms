const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { cloudinary } = require('../config/cloudinary')

const storageProfiles = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cms/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
})

const storageDocuments = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cms/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  }
})

const uploadProfileImage = multer({
  storage: storageProfiles,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB limit
})

const uploadDocuments = multer({
  storage: storageDocuments,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

module.exports = { uploadProfileImage, uploadDocuments }
