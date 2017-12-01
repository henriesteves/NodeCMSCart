const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');

const config = require('./config/database');

// Connect to db
mongoose.connect(config.database, { useMongoClient: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>  {
  console.log('Connected to Mongodb')
});

// Init app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page Model
const Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec((err, pages) => {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

// Get Category Model
const Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find((err, categories) => {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

// Express fileUpload Middleware
app.use(fileUpload());

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  //  cookie: { secure: true }
}));

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },
  customValidators: {
    isImage: (value, filename) => {
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        default:
          return false;
      }
    }
  }
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart;

  next();
});

// Set routes
const pages = require('./routes/pages');
const products = require('./routes/products');
const cart = require('./routes/cart');
const adminPages = require('./routes/adminPages');
const adminCategories = require('./routes/adminCategories');
const adminProducts = require('./routes/adminProducts');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/', pages); // must be the last

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log('Server started on port ' + port);
});