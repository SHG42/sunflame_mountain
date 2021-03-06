var common = require("../common");
var express = require("express");
var router 	= express.Router({mergeParams: true});

var mstorage = common.multer.memoryStorage();
var upload = common.multer({ storage: mstorage });

router.route("/home/:userid")
.get([isLoggedIn, finishedRegistration], function(req, res){
	//get info and unicorns of PAGE-OWNER
	common.User.findOne({userid: req.params.userid}).populate({path: "region"}).populate({path: "unicorns", populate: { path: 'imgs.img', model: 'Image' }}).exec(function(err, foundPageOwner){
		if (err) {
			req.flash('error', "Something's not right here... Can't find that user...");
			console.error('Uhoh, there was an error (/home/:userid findOne GET)', err);
			res.redirect('/index');
		}

		if(foundPageOwner.unicorns.length === 0) {
			req.flash("error", "This user isn't ready for visitors just yet! Please try again later.");
			res.redirect("/index");
		} else if(!foundPageOwner.region) {
			req.flash("error", "This user isn't ready for visitors just yet! Please try again later.");
			res.redirect("/index");
		} else {
			res.render("home", {currentPageOwner: foundPageOwner, loggedInUser: req.loggedInUser});
		}
	});
})
.put(isLoggedIn, function(req, res){
	var newName = req.body.newName;
	common.Unicorn.findByIdAndUpdate(req.body.unicornid, {$set: {name: newName}}, {new: true}, function(err, foundUnicorn){
		if (err) {
			req.flash('error', "Something's not right here...");
			console.error('Uhoh, there was an error Unicorn.findByIdAndUpdate{$set: {name: newName}} PUT', err)
			res.redirect('/index');
		}
		
		req.flash("success", "Name successfully updated!");
		res.redirect("/home/" + req.params.userid);
	});
});

// SHOW unicorn bio page
router.route("/home/:userid/unicorn/:uniid")
.get([isLoggedIn, finishedRegistration], function(req, res){
	common.User.findOne({userid: req.params.userid}).populate("region").populate("unicorns").exec(function(err, foundPageOwner){
		if (err) return console.error('Uhoh, there was an error finding the User that owns this page (/home/userid/unicorn/uniid GET findOne)', err)
		common.Unicorn.findOne({uniid: req.params.uniid}).populate({path: "imgs.img", model: "Image"}).exec(function(err, foundUnicorn){
			if (err) {
				req.flash('error', "Something's not right here... Can't find that unicorn...");
				console.error("error in bio route at Unicorn.findOne", err)
				return res.redirect('/index');
			}
			res.render("bio", {currentPageOwner: foundPageOwner, loggedInUser: req.loggedInUser, unicorn: foundUnicorn, origin: "bio"});
		});
	});
})
.put(isLoggedIn, function(req,res){
	var newLore = req.body.lore;
	common.Unicorn.findOneAndUpdate({uniid: req.params.uniid}, {$set: {lore: newLore}}, {new: true}, function(err, foundUnicorn){
		if (err) {
			req.flash('error', "Something's not right here...");
			console.error('Uhoh, there was an error Unicorn.findOneAndUpdate{$set: {lore: newLore}} PUT', err)
			res.redirect('/index');
		}
		req.flash("success", "Bio successfully updated!");   
		res.redirect("/home/" + req.params.userid + "/unicorn/" + req.params.uniid);
	});
});

//////////////////////////////////
//check login middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "You're not logged in!");
    res.redirect("/login");
}

//middleware for checking if loggedIn user finished registration
function finishedRegistration(req, res, next) {
	common.User.findById(req.user._id).populate({path: "region"}).populate({path: "unicorns"}).exec(function(err, foundUser){
		if (err) {
			req.flash('error', "Something's not right here... Can't find that user...");
			console.error('Uhoh, there was an error in finishedRegistration middleware ', err)
			res.redirect('/index');
		}

		if(foundUser.unicorns.length === 0) {
			req.flash("error", "You haven't finished registration yet! Please create your founder.");
			res.redirect("/founder");
		} else if(!foundUser.region) {
			req.flash("error", "You haven't finished registration yet! Please select a region.");
			res.redirect("/region");
		} else {
			req.loggedInUser = foundUser;
			next();
		}
	});
}


module.exports = router;