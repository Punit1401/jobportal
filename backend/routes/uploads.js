const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/file', upload.single('file'), (req,res)=>{
  // In prod, upload to S3 and return URL
  const file = req.file;
  res.json({ url: `/uploads/${file.filename}`, name: file.originalname, size: file.size });
});

module.exports = router;
