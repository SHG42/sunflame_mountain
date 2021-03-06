var express 			= require("express"),
	mongoose    		= require("mongoose"),
	Sharp				= require('sharp'),
	cloudinary 			= require('cloudinary').v2,
	fs 					= require('fs'),
	path 				= require('path'),
	stream 				= require('stream'),
	async = require("async");
var User        = require("./models/user"),
    Unicorn     = require("./models/unicorn"),
    Region      = require("./models/region"),
	BaseColor	= require("./models/baseColor"),
	Breed       = require("./models/breed"),
	Gene        = require("./models/gene"),
	Image		= require("./models/image"),
	Inventory	= require("./models/inventory.js");
Sharp.cache(false);
console.log("Hello from Helpers");

//New Unicorn build function
function buildUnicorn(req, res, unicornData, loggedInUser, buffer) {
	console.log("buildUnicorn function in Helpers: ");
	async.waterfall([
		function(callback) {
			Unicorn.create(unicornData, (err, newUnicorn)=>{
				if (err) {
					console.error('Uhoh, there was an error (/build Unicorn.create POST)', err)
					req.flash('error', "Something's not right... something went wrong creating this Unicorn...");
					return res.redirect('/index');
				}
				newUnicorn.save((err)=> {
					callback(null, newUnicorn);
				});
			});
		},
		function(newUnicorn, callback) {
			Image.create(buffer, (err, newImage)=>{
				if (err) {
					console.error('Uhoh, there was an error (/build Image.create POST)', err)
					req.flash('error', "Something's not right... something went wrong creating this Unicorn...");
					return res.redirect('/index');
				}
				newImage.filename = newUnicorn._id.valueOf();
				newImage.save(()=> {
					callback(null, newImage, newUnicorn);
				});
			});
		},
		function(newImage, newUnicorn, callback) {
			var path = newImage.filename;
			var folder = `Unicorns/${newUnicorn._id}/baseImg`;
			let options = {
				upload_preset: 'unicornBaseImgSave',
				resource_type: 'image',
				format: 'png',
				public_id: newImage.filename,
				folder: folder
			}
			var bufferStream = new stream.PassThrough();
			bufferStream.end(Buffer.from(buffer));
			bufferStream.pipe(cloudinary.uploader.upload_stream(options, (error, result)=> {
				if (error) {
					console.error('Uhoh, there was an error (/build upload POST)', err)
					req.flash('error', "Something's not right... something went wrong creating this Unicorn...");
					return res.redirect('/index');
				}
				newImage.public_id = result.public_id;
				newImage.etag = result.etag;
				newImage.version = result.version;
				newImage.img.data = buffer;
				newUnicorn.imgs.baseImg = newImage;
				newUnicorn.imgs.img = newImage;
				newImage.save();
				newUnicorn.save(()=>{
					callback(null, newUnicorn);
				});
			}))
		},
		function(newUnicorn, callback) {
			User.findById(loggedInUser).populate({path: "unicorns"}).exec((err, user)=>{
				if(user.unicorns.length === 0) {
					newUnicorn.founder = true;
				} else {
					newUnicorn.founder = false;
					user.tokens--;
				}
				newUnicorn.owner = user._id;
				user.save();
				newUnicorn.save((err)=>{
					callback(null, newUnicorn, user);
				});
			})
		},
		function(newUnicorn, user, callback) {
			if(req.url.includes("/founder")){
				req.flash("success", "Unicorn successfully created! You may proceed to region selection.");
				res.redirect("/region");
				callback(null, 'done');
			} else if (req.url.includes("/build")){
				req.flash("success", "Unicorn successfully created!");
				res.redirect(`/home/${user.userid}/unicorn/${newUnicorn.uniid}`);
				callback(null, 'done');
			}
		}
	], function (err, result) {
		req.flash('error', "Something's not right here...");
		console.log('End of the create route (/build POST)', err, result);
	});
}

//SORT INVENTORY
function sortInventory() {
	var inventoryBackdrops = [];
	var inventoryCompanions = [];
	var inventoryDecorative = [];
	var inventoryEnvironment = [];
	var inventoryGems = [];
	var inventoryTech = [];
	var inventoryTiles = [];
	
	var inventory = Inventory.find({}).exec()
	var sorted = inventory.then((result)=>{
		result.forEach((item)=>{
			if(item.category === "backdrops") {
				inventoryBackdrops.push(item);
			} else if(item.category === "companions") {
				inventoryCompanions.push(item);	  
			} else if(item.category === "decorative") {
				inventoryDecorative.push(item);	  
			} else if(item.category === "environment") {
				inventoryEnvironment.push(item);	  
			} else if(item.category === "gems") {
				inventoryGems.push(item);	  
			} else if(item.category === "tech") {
				inventoryTech.push(item);	  
			} else if(item.category === "tiles") {
				inventoryTiles.push(item);	  
			}
		})
		return {
			inventoryBackdrops: inventoryBackdrops,
			inventoryCompanions: inventoryCompanions,
			inventoryDecorative: inventoryDecorative,
			inventoryEnvironment: inventoryEnvironment,
			inventoryGems: inventoryGems,
			inventoryTech: inventoryTech,
			inventoryTiles: inventoryTiles
		}
	})
	return sorted;
}


//IMAGE COMPOSITE
function runComposite(foundUnicorn) {
	console.log("running composite function in helpers");
	var backEquips = foundUnicorn.imgs.equipBack;
	var frontEquips = foundUnicorn.imgs.equipFront;
	var baseImg = foundUnicorn.imgs.baseImg;
	var filename = `${foundUnicorn._id}_cmp`
	var x = parseInt(foundUnicorn.canvasposition.x, 10);
	var y = parseInt(foundUnicorn.canvasposition.y, 10);
	
	async function runUpload(foundImage, buffer, foundUnicorn) {
		console.log("running upload in helpers");
		var equipFolder = `Unicorns/${foundUnicorn._id}`;
		let options = {
			upload_preset: 'unicornBaseImgSave',
			resource_type: 'image',
			format: 'png',
			public_id: foundImage.filename,
			folder: equipFolder
		}
		var bufferStream = new stream.PassThrough();
		bufferStream.end(Buffer.from(buffer.buffer));
		bufferStream.pipe(cloudinary.uploader.upload_stream(options, function(error, result) {
			foundImage.public_id = result.public_id;
			foundImage.etag = result.etag;
			foundImage.version = result.version;
			foundImage.save();
			return foundImage;
		}))
		foundUnicorn.set("imgs.img", foundImage);
		foundUnicorn.save();
		return {
			foundUnicorn: foundUnicorn
		}
	}
	
	//run sharp composite : image order- back->baseImg->front | dimensions from back/front | offset baseImg using unicornCoords
	var output = Sharp({
		create: {
			width: 900,
			height: 700,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 }
		}
	})
	.composite([
	{
		input: backEquips.img.data,
		top: 0,
		left: 0
	},
	{
		input: baseImg.img.data,
		top: y,
		left: x,
	}, 
	{
		input: frontEquips.img.data,
		top: 0,
		left: 0
	}
	])
	.withMetadata()
	.png()
	.toBuffer()
	.then((result) => Image.findOneAndUpdate({ "filename": filename}, { "$set": {"filename": filename, "img.data": result}}, {upsert: true, new: true}) )
	.then((result2) => runUpload(result2, result2.img.data, foundUnicorn))
	.then((result3) => {
		return result3
	})
	return output
}

//SET INCOMING USERCHOICES DATA
function setData(userChoices) {
	var data = {
		breedid: userChoices.breedPick.id,
		genes: 
		{
			bodyGene: {
				geneId: userChoices.genePicks.bodyGene.id,
				colorable: userChoices.genePicks.bodyGene.colorable,
				geneName: userChoices.genePicks.bodyGene.name,
				baseImg: userChoices.genePicks.bodyGene.src
			},
			hairGene: {
				geneId: userChoices.genePicks.hairGene.id,
				colorable: userChoices.genePicks.hairGene.colorable,
				geneName: userChoices.genePicks.hairGene.name,
				baseImg: userChoices.genePicks.hairGene.src
			},
			tertiaryGene: {
				geneId: userChoices.genePicks.tertiaryGene.id,
				colorable: userChoices.genePicks.tertiaryGene.colorable,
				geneName: userChoices.genePicks.tertiaryGene.name,
				baseImg: userChoices.genePicks.tertiaryGene.src
			},
			eyeGene: {
				geneId: userChoices.genePicks.eyeGene.id,
				colorable: userChoices.genePicks.eyeGene.colorable,
				geneName: userChoices.genePicks.eyeGene.name,
				baseImg: userChoices.genePicks.eyeGene.src
			},
			hornGene: {
				geneId: userChoices.genePicks.hornGene.id,
				colorable: userChoices.genePicks.hornGene.colorable,
				geneName: userChoices.genePicks.hornGene.name,
				baseImg: userChoices.genePicks.hornGene.src
			},
			hoofGene: {
				geneId: userChoices.genePicks.hoofGene.id,
				colorable: userChoices.genePicks.hoofGene.colorable,
				geneName: userChoices.genePicks.hoofGene.name,
				baseImg: userChoices.genePicks.hoofGene.src
			}
		},
		colors: userChoices.colors
	}
	
	return data;
}


module.exports = {setData, runComposite, sortInventory, buildUnicorn};