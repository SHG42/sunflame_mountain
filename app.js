var
	  express                 = require("express"),
    app                     = express(),
	  common					        = require('./common');	
// //ROUTE REQUIRES
var newPlayerRoutes = require("./routes/newplayer"),
	  homeRoutes      = require("./routes/homepages"),
	  indexRoutes     = require("./routes/index");

common.mongoose.connect(process.env.DB_CONN, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

app.use(common.bodyParser.json());
app.use(common.bodyParser.urlencoded({extended: true}));
app.use(common.expressSanitizer());
app.use(express.static("public"));
app.use(common.methodOverride("_method"));
app.set("view engine", "ejs");

app.use(common.session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: false,
	store: common.MongoStore.create({
		mongoUrl: process.env.DB_CONN,
		secret: process.env.EXPRESS_SECRET,
		touchAfter: 24 * 60 * 60
	})
}));

app.use(function (req, res, next) {
    res.locals.req = req;
    res.locals.res = res;

    if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
      throw new Error('Missing CLOUDINARY_URL environment variable');
    } else {
		// Expose cloudinary package to view
		res.locals.cloudinary = cloudinary;
		res.locals.cloudname = process.env.CLOUDNAME;
      next();
    }
  });

app.use(common.passport.initialize());
app.use(common.passport.session());
common.passport.use(new common.LocalStrategy(common.User.authenticate()));
common.passport.serializeUser(common.User.serializeUser());
common.passport.deserializeUser(common.User.deserializeUser());

app.use(newPlayerRoutes);
app.use(homeRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, () => {
	console.log("Welcome to unicorn hell");
});
