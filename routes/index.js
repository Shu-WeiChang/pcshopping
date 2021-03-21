var express = require('express');
var router = express.Router();

var async = require("async");

var Category = require("../models/category");
var ComputerPart = require("../models/computerpart");
var Manufacturer = require("../models/manufacturer");

var mongoose = require("mongoose");
var path = require("path");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + FILE.originalname);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: { fileSize: 1000000 },
});

//Require controller modules.
var category_controller = require('../controllers/categoryController');
var computerpart_controller = require('../controllers/computerpartController');
var manufacturer_controller = require('../controllers/manufacturerController');

function getStoredParts(req, next) {
  let promises = [];
  for (const categoryID in req.cookies) {
    if (
      mongoose.Types.ObjectId.isValid(categoryID) &&
      mongoose.Types.ObjectId.isValid(req.cookies[categoryID])
    ) {
      promises.push(
        new Promise(function (resolve, reject) {
          ComputerPart.findById(req.cookies[categoryID]).exec(function (
            err,
            part
          ) {
            if (err) return next(err);
            resolve([categoryID, part]);
          });
        })
      );
    }
  }
  return promises;
}
/* GET home page. */
router.get('/', function (req, res) {
  res.redirect('list');
});

router.get('/list', function (req, res, next) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find(callback);
      },
    },
    async function (err, results) {
      if (err) return next(err);
      const userList = {};
      await Promise.all(getStoredParts(req, next)).then(function (parts) {
        parts.forEach((part) => {
          userList[part[0]] = part[1];
        });
      });
      res.render('list', {
        title: 'My List - PC Part Planner',
        userList: userList,
        categories: results.categories,
      });
    }
  );
});

/// CATEGORY ROUTES ///

// GET request for creating Category.
router.get('/category/create', category_controller.category_create_get);

// POST
router.post('/category/create', category_controller.category_create_post);

// GET
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET
// router.get('/category/:id/update', category_controller.category_update_get);

// POST
router.post('/category/:id/update', category_controller.category_update_post);

// GET
router.get('/category/:id', category_controller.category_detail);

// GET
router.get('/category/:id', category_controller.category_detail);

// GET
router.get('/categories', category_controller.category_list);

/// COMPUTERPART ROUTES ///

// GET
router.get(
  '/component/create',
  computerpart_controller.computerpart_create_get
);

// POST
router.post(
  '/component/create',
  upload.single('part_image'),
  computerpart_controller.computerpart_create_post
);

// GET
router.get(
  '/component/:id/delete',
  computerpart_controller.computerpart_delete_get
);

// POST
router.post(
  '/component/:id/delete',
  computerpart_controller.computerpart_delete_post
);

// GET
router.get(
  '/component/:id/image/delete',
  computerpart_controller.computerpart_delete_image_get
);

// POST
router.post(
  '/component/:id/image/delete',
  computerpart_controller.computerpart_delete_image_post
);

// GET
router.get(
  '/component/:id/update',
  computerpart_controller.computerpart_update_get
);

// POST
router.post(
  '/component/:id/update',
  upload.single('part_image'),
  computerpart_controller.computerpart_update_post
);

// GET
router.get('/component/:id', computerpart_controller.computerpart_detail);

// GET
router.get('/components', computerpart_controller.computerpart_list);

/// MANUFACTURER ROUTES ///

// GET
router.get(
  '/manufacturer/create',
  manufacturer_controller.manufacturer_create_get
);

// POST
router.post(
  '/manufacturer/create',
  manufacturer_controller.manufacturer_create_post
);

// GET
router.get(
  '/manufacturer/:id/delete',
  manufacturer_controller.manufacturer_delete_get
);

// POST
// router.post(
//   '/manufacturer/:id/delete',
//   manufacturer_controller.manufacturer_delete_post
// );

// GET
router.get(
  '/manufacturer/:id/update',
  manufacturer_controller.manufacturer_update_get
);

// POST
router.post(
  '/manufacturer/:id/update',
  manufacturer_controller.manufacturer_update_post
);

// GET
router.get('/manufacturer/:id', manufacturer_controller.manufacturer_detail);

//GET
router.get('/manufacturers', manufacturer_controller.manufacturer_list);

module.exports = router;


