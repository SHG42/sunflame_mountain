import { multer, passport, User, Helpers, Breed, Gene, stream, cloudinary, Image, Unicorn } from "../common";
import { Router } from "express";
var router 	= Router({mergeParams: true});

var mstorage = multer.memoryStorage();
var upload = multer({ storage: mstorage });

router.get("/", function(req, res){
   res.render("landing"); 
});

router.route("/login")
.get(function(req, res){
  res.render("login"); 
})
.post(passport.authenticate("local", {
        successRedirect: "/index",
        failureRedirect: "/login"
    }), function(req, res) {
});

router.get("/credits", function(req, res){
   res.render("credits"); 
});

//INDEX, SITE HOMEPAGE
router.get("/index", isLoggedIn, function(req, res) {
	//get data of LOGGEDINUSER
	// console.log("req.user._id and req.params.userid from index route: ");
	// console.log(req.user._id);
	// console.log(req.params.userid);
	User.findById(req.user._id).populate("region").exec(function(err, foundLoggedInUser){
		if (err) return console.error('Uhoh, there was an error (/index User.findById GET)', err)
		res.render("index", {loggedInUser: foundLoggedInUser});
	});
});

// SHOW inventory
router.get("/inventory", isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, foundLoggedInUser){
		if (err) return console.error('Uhoh, there was an error (/inventory User.findById GET)', err)
		let sort = Helpers.sortInventory();
		sort.then((result)=>{
			res.render("inventory", {
				loggedInUser: foundLoggedInUser,
				inventoryBackdrops: result.inventoryBackdrops,
				inventoryCompanions: result.inventoryCompanions,
				inventoryDecorative: result.inventoryDecorative,
				inventoryEnvironment: result.inventoryEnvironment,
				inventoryGems: result.inventoryGems,
				inventoryTech: result.inventoryTech,
				inventoryTiles: result.inventoryTiles
			});
		})
	});
});

// SHOW directory
router.get("/directory", isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, foundLoggedInUser){
		if (err) return console.error('Uhoh, there was an error (/directory User.findById GET)', err)
		//retrieve all users from database
		User.find({}, function(err, foundUsers){
			if (err) return console.error('Uhoh, there was an error (/directory User.find({}) GET)', err)
			res.render("directory", {loggedInUser: foundLoggedInUser, registeredUsers: foundUsers});
		});
	});
});


//SHOW game
router.route("/explore")
.get(isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, foundLoggedInUser){
		res.render("explore", {loggedInUser: foundLoggedInUser}); 
	});
})
.put(isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, foundLoggedInUser){
		if (err) return console.error('Uhoh, there was an error (/explore User.findByIdAndUpdate PUT)', err);
		foundLoggedInUser.tokens++;
		foundLoggedInUser.save();
		res.redirect(303, "/index");
	})
})

// SHOW customize
router.route("/build")
.get(isLoggedIn, function(req, res){
	Breed.find({}, function(err, foundAllBreeds){
		if (err) return console.error('Uhoh, there was an error (/build Breed.find GET)', err)
		Gene.find({}, function(err, foundAllGenes){
			if (err) return console.error('Uhoh, there was an error (/build Gene.find GET)', err)
			User.findById(req.user._id).populate("unicorns").exec(function(err, foundLoggedInUser){
				if (err) return console.error('Uhoh, there was an error (/build User.findById GET)', err)
				res.render("build", {loggedInUser: foundLoggedInUser, Breeds: foundAllBreeds, Genes: foundAllGenes}); 
			});
		});
	});
})
.post([isLoggedIn, upload.any()], function(req, res){
	console.log("Incoming POST user data in /build route: ");
	let userChoices = JSON.parse(req.body.userChoices);
	let unicornData = Helpers.setData(userChoices);
	let loggedInUser = req.user._id;
	let buffer = req.files[0].buffer;

	function runUpload(newImage, buffer, newUnicorn) {
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
		bufferStream.pipe(cloudinary.uploader.upload_stream(options, function(error, result) {
			console.log("output from newUnicorn cloudinary upload: ");
			console.log(error, result);
			newImage.public_id = result.public_id;
			newImage.etag = result.etag;
			newImage.version = result.version;
			newImage.img.data = buffer;
			newUnicorn.imgs.baseImg = newImage;
			newUnicorn.imgs.img = newImage;
			newImage.save();
			newUnicorn.save();
			return {
				newImage: newImage,
				newUnicorn: newUnicorn
			}
		}))
		return {
			newUnicorn: newUnicorn
		}
	}
	
	function createImage(newUnicorn) {
		return Image.create(buffer)
		.then((newImage)=>{
			newImage.filename = newUnicorn._id.valueOf();
			return {
				newUnicorn: newUnicorn,
				newImage: newImage
			}
		})
	}
	
	var unicornCreate = Unicorn.create(unicornData)
	.then((newUnicorn)=> {
		var hasUnicorns = User.findById(loggedInUser).populate("unicorns").exec()
		hasUnicorns.then((res)=>{
			if(res.unicorns.length === 0) {
				newUnicorn.founder = true;
			} else {
				newUnicorn.founder = false;
				res.tokens--;
				res.save();
			}
			return res;
		})
		newUnicorn.owner = loggedInUser;
		return newUnicorn
	})
	.then((newUnicorn)=> createImage(newUnicorn))
	.then((res1)=> runUpload(res1.newImage, buffer, res1.newUnicorn))
	.catch((err)=>{
		console.error(err);
	})
	
	unicornCreate.then(()=>{
		if(req.headers.referer.includes("/founder")){
			res.redirect(303, "/region");
		} else if (req.headers.referer.includes("/build")){
			res.redirect(303, "/index");
		}
	})
	.catch((err)=>{
		console.error(err);
	})
})
.put([isLoggedIn, upload.any()], function(req, res){
	console.log("Incoming PUT user data in /build route: ");
	let userChoices = JSON.parse(req.body.userChoices);
	let unicornData = Helpers.setData(userChoices);
	let buffer = req.files[0].buffer;
	
	function runUpload(foundImage, buffer, foundUnicorn) {
		var path = foundImage.filename;
		var folder = `Unicorns/${foundUnicorn._id}/baseImg`;
		let options = {
			upload_preset: 'unicornBaseImgSave',
			resource_type: 'image',
			format: 'png',
			public_id: path,
			folder: folder
		}
		var bufferStream = new stream.PassThrough();
		bufferStream.end(Buffer.from(buffer));
		bufferStream.pipe(cloudinary.uploader.upload_stream(options, function(error, result) {
			// console.log(error, result);
			foundImage.version = result.version;
			foundImage.img.data = buffer;
			foundImage.save();
			return foundImage;
		}))
		return {
			foundUnicorn: foundUnicorn
		}
	}
	
	function findImage(foundUnicorn) {
		return Image.findById({_id: foundUnicorn.imgs.baseImg._id})
		.then(foundImage => {
			return {
				foundUnicorn: foundUnicorn,
				foundImage: foundImage
			}
		})
	}
	
	var unicornUpdate = Unicorn.findByIdAndUpdate(req.body.unicornId, { "$set": { "genes": unicornData.genes, "colors": unicornData.colors}}, {new: true})
	.populate({path: "imgs.baseImg imgs.equipBack imgs.equipFront", model: "Image"})
	.exec()
	.then((foundUnicorn) => findImage(foundUnicorn))
	.then((res1) => runUpload(res1.foundImage, buffer, res1.foundUnicorn))
	.then((res2) => {
		if(res2.foundUnicorn.equips.length !== 0){
			Helpers.runComposite(res2.foundUnicorn)
		} else {
			return res2;
		}
	})
	.then((res3) => {
		return res3
	})
	.catch((err)=>{
		console.error(err);
	})
	
	unicornUpdate.then(()=>{
		res.redirect(303, "/index");
	})
	.catch((err)=>{
		console.error(err);
	})
})

// SHOW equip
router.route("/equip")
.get(isLoggedIn, function(req, res){
	User.findById(req.user._id).populate({ path: 'unicorns', populate: { path: 'imgs.baseImg', model: 'Image' }}).exec(function(err, foundLoggedInUser){
		if (err) return console.error('Uhoh, there was an error (/equip User.findById GET)', err)
		let sort = Helpers.sortInventory();
		sort.then((result)=>{
			res.render("equip", {
				loggedInUser: foundLoggedInUser,
				inventoryBackdrops: result.inventoryBackdrops,
				inventoryCompanions: result.inventoryCompanions,
				inventoryDecorative: result.inventoryDecorative,
				inventoryEnvironment: result.inventoryEnvironment,
				inventoryGems: result.inventoryGems,
				inventoryTech: result.inventoryTech,
				inventoryTiles: result.inventoryTiles
			});
		})
	});
})
.put([isLoggedIn, upload.any()], function(req, res){
	console.log("Incoming PUT user data in /equip route: ");
	let userChoices = JSON.parse(req.body.userChoices);
	let unicornId = req.body.unicornId;
	let unicornCoords = JSON.parse(req.body.unicornCoords);
	var bufferBack = {
			buffer: req.files[0].buffer,
			filename: unicornId + "back"
		} 
	var bufferFront = {
			buffer: req.files[1].buffer,
			filename: unicornId + "front"
		}
	
	function runUpload(foundImage, buffer, foundUnicorn) {
		var equipFolder = `Unicorns/${unicornId}/equips`;
		let options = {
			upload_preset: 'equipSave',
			resource_type: 'image',
			format: 'png',
			public_id: foundImage.filename,
			folder: equipFolder
		}
		var bufferStream = new stream.PassThrough();
		bufferStream.end(Buffer.from(buffer.buffer));
		bufferStream.pipe(cloudinary.uploader.upload_stream(options, function(error, result) {
			// console.log("output from cloudinary upload: ");
			// console.log(error, result);
			foundImage.public_id = result.public_id;
			foundImage.etag = result.etag;
			foundImage.version = result.version;
			foundImage.save();
			return foundImage;
		}))
		if(foundImage.filename.includes("back")){
			foundUnicorn.set("imgs.equipBack", foundImage);
		} else if(foundImage.filename.includes("front")){
			foundUnicorn.set("imgs.equipFront", foundImage);
		}
		return {
			foundUnicorn: foundUnicorn
		}
	}
	
	function saveEquipImgBack(foundUnicorn) {
		return Image.findOneAndUpdate({ "filename": bufferBack.filename}, { "$set": {"filename": bufferBack.filename, "img.data": bufferBack.buffer}}, {upsert: true, new: true})
		.then(foundImage => {
			return {
				foundImageBack: foundImage,
				foundUnicorn: foundUnicorn
			}
		})
	}
	function saveEquipImgFront(foundUnicorn) {
		return Image.findOneAndUpdate({ "filename": bufferFront.filename}, { "$set": {"filename": bufferFront.filename, "img.data": bufferFront.buffer}}, {upsert: true, new: true})
		.then(foundImage => {
			return {
				foundImageFront: foundImage,
				foundUnicorn: foundUnicorn
			}
		})
	}
	
	var unicornUpdate = Unicorn.findByIdAndUpdate({_id: unicornId}, { "$set": { "equips": userChoices, "canvasposition.x": unicornCoords.x, "canvasposition.y": unicornCoords.y}}, {new: true})
	.populate("imgs.baseImg")
	.exec()
	.then((foundUnicorn) => saveEquipImgBack(foundUnicorn))
	.then((res1) => runUpload(res1.foundImageBack, bufferBack, res1.foundUnicorn))
	.then((res2) => {
		return res2.foundUnicorn
	})
	.then((foundUnicorn) => saveEquipImgFront(foundUnicorn))
	.then((res3) => runUpload(res3.foundImageFront, bufferFront, res3.foundUnicorn))
	.then((res4) => Helpers.runComposite(res4.foundUnicorn))
	.then((res5) => {
		return res5
	})
	.catch((err)=>{
		console.error(err);
	})
	unicornUpdate.then((output)=>{
		res.redirect(303, "/equip");
	})
})


//MIDDLEWARE FOR CHECKING LOGIN STATUS
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//MIDDLEWARE TO CHECK HOMEPAGE OWNERSHIP and only display edit buttons if on your own page
// function checkOwnership(req, res, next) {
	
// }


//LOGOUT
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});

export default router;