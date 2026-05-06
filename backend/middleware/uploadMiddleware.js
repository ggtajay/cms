const fs = require('fs')
const path = require('path')
const multer = require('multer')

const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles')
const documentsDir = path.join(__dirname, '..', 'uploads', 'documents')

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true })
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true })
}

const storageProfiles = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
    cb(null, `${Date.now()}-${safeBaseName}${extension}`)
  }
})

const storageDocuments = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
    cb(null, `doc-${Date.now()}-${safeBaseName}${extension}`)
  }
})

const profileFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
    return
  }
  cb(new Error('Only image files are allowed for profiles'))
}

const documentFileFilter = (req, file, cb) => {
  // Allow images and PDFs for documents
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true)
    return
  }
  cb(new Error('Only images and PDF files are allowed for documents'))
}

const uploadProfileImage = multer({
  storage: storageProfiles,
  fileFilter: profileFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB limit
})

const uploadDocuments = multer({
  storage: storageDocuments,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per document
})

module.exports = { uploadProfileImage, uploadDocuments }
