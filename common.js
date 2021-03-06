module.exports = {
    bodyParser              : require("body-parser"),
    methodOverride          : require("method-override"),
    mongoose                : require("mongoose"),
	session					: require("express-session"),
	MongoStore				: require('connect-mongo'),
    passport                : require("passport"),
    LocalStrategy           : require("passport-local"),
    passportLocalMongoose   : require("passport-local-mongoose"),
	fs 					  	: require('fs'),
	path 				  	: require('path'),
	stream 				  	: require('stream'),
	multer 				  	: require('multer'),
	cloudinary 			  	: require('cloudinary').v2,
	Konva 					: require('konva'),
	Sharp					: require('sharp'),
	Helpers 			  	: require("./helpers"),
    User                    : require("./models/user"),
    Unicorn                 : require("./models/unicorn"),
    Region                  : require("./models/region"),
	BaseColor				: require("./models/baseColor"),
	Breed                   : require("./models/breed"),
	Gene                    : require("./models/gene"),
	Image				  	: require("./models/image"),
	Inventory				: require("./models/inventory.js")
}