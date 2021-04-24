var mongoose 	= require("mongoose");
var Inventory	= require("./models/inventory"),
	Region      = require("./models/region"),
	BaseColor	= require("./models/baseColor"),
	Breed       = require("./models/breed"),
	Gene        = require("./models/gene"),
	fs 			= require('fs');


////SEEDING REGIONS
// var data = [
// 	{
// 		"name": "Arctic",
// 		"modalBG": "/assets/background_imgs/map_imgs/arctic_onclick.png",
// 		"homeBG": "/assets/background_imgs/region_backgrounds/arcticenvironment.png",
// 		"description": "A region of frigid desolation... but there is also wild, crystalline beauty for those brave enough to seek it. The soaring glaciers harbor dark, silent forests brimming with unknown wonders. Beneath the midnight sun, legends may rise... or fall. The unicorns of this realm are determined and hardy creatures, experts in survival."
// 	},
// 	{
// 		"name": "Desert",
// 		"modalBG": "/assets/background_imgs/map_imgs/desert_onclick.png",
// 		"homeBG": "/assets/background_imgs/region_backgrounds/desertenvironment.png",
// 		"description": "Unicorns here forge a life between blistering sunlight and icy-cold nights, but they are fiercely loyal to this scorching realm. The towering sand dunes offer boundless danger, but also limitless adventure. What mysteries lie in the heart of the Desert? Unicorns of this realm are shrewd and clever."
// 	},
// 	{
// 		"name": "Forest",
// 		"modalBG": "/assets/background_imgs/map_imgs/forest_onclick.png",
// 		"homeBG": "/assets/background_imgs/region_backgrounds/forestenvironment.png",
// 		"description": "Massive trees, ancient and gnarled, stand amid thick fog and lancing shafts of sunlight. The unwary soon find themselves hopelessly lost, but those who know this realm find their way with ease. The Forest bristles with life, not all of it friendly. Unicorns of this realm are studious and slow to trust."
// 	},
// 	{
// 		"name": "Mountains",
// 		"modalBG": "/assets/background_imgs/map_imgs/mountains_onclick.png",
// 		"homeBG": "/assets/background_imgs/region_backgrounds/mountainenvironment.png",
// 		"description": "Many believe that these towering peaks are a sacred realm, due to their proximity to Sunflame Mountain. Sacred or not, the herds that live amidst the peaks must contend with perilous slopes, howling winds, and the beasts that lurk in the mist. Unicorns here are daring and observant."
// 	},
// 	{
// 		"name": "Savannah",
// 		"modalBG": "/assets/background_imgs/map_imgs/savannah_onclick.png",
// 		"homeBG": "/assets/background_imgs/region_backgrounds/savannahenvironment.png",
// 		"description": "A sea of tall grass graces the Savannah, the endless golden waves dotted with twisted trees and rock outcrops. The sun shines brightly here, sometimes unbearably so, and sudden lightning storms can give the uncautious an unpleasant surprise. Unicorns of this realm are quick-witted and sharp-eyed."
// 	},
// 	{
// 		"name": "Swamp",
// 		"modalBG": "/assets/background_imgs/map_imgs/swamp_onclick.png",
// 		"homeBG": "/assets/background_imgs/region_backgrounds/swampenvironment.png",
// 		"description": "Hazy shapes wind their way through the warm, shallow waters here. The thick canopy and dangling branches shield a labyrinth of channels, lagoons, and ponds. On islands of sturdy cypress trees, and on clusters of floating flat-bottomed boats, herds of unicorns make their homes. Unicorns of this realm are relaxed and adventurous."
// 	}
// ]

// function seedDB() {
// 	data.forEach(function(seed){
// 		Region.create(seed, function(err, newGene){
// 			if(err){
// 				console.log(err);
// 			} else {
// 				console.log("added a seed");
// 			}
// 		}); 
// 	});
// }


// //SEEDING BREEDS
// var data = [
// 	{
// 		name: "traditionalcorn",
// 		id: "tra",
// 		lineart: {
// 			baseImg: "/assets/unicorn_base_imgs/traditionalcorn/traditionalcorn_base_lineart.png"
// 		},
// 		basecolors: {
// 			body: {
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/baseColors/traditionalcorn_base_bodyColor.png",
// 				colorClass: "body"
// 			},
// 			hair: {
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/baseColors/traditionalcorn_base_hairColor.png",
// 				colorClass: "hair"
// 			},
// 			eyes: {
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/baseColors/traditionalcorn_base_eyeColor.png",
// 				colorClass: "eyes"
// 			},
// 			hoof: {
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/baseColors/traditionalcorn_base_hoofColor.png",
// 				colorClass: "hoof"
// 			},
// 			horn: {
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/baseColors/traditionalcorn_base_hornColor.png",
// 				colorClass: "horn"
// 			}
// 		},
// 		genes: [
// 			//BODY GENES
// 			{
// 				geneClass: "body",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/body_templates/cloud.png",
// 				name: "Cloud",
// 				id: "1body_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "body",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/body_templates/glitter.png",
// 				name: "Glitter",
// 				id: "2body_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "body",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/body_templates/gradient.png",
// 				name: "Gradient",
// 				id: "3body_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "body",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/body_templates/roan.png",
// 				name: "Roan",
// 				id: "4body_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "body",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/body_templates/sparkle.png",
// 				name: "Sparkle",
// 				id: "5body_tra",
// 				colorable: "true"
// 			},
// 			//HAIR GENES
// 			{
// 				geneClass: "hair",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/hair_templates/flames.png",
// 				name: "Flames",
// 				id: "1hair_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "hair",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/hair_templates/gradient.png",
// 				name: "Gradient",
// 				id: "2hair_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "hair",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/hair_templates/sparkle.png",
// 				name: "Sparkle",
// 				id: "3hair_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "hair",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/hair_templates/ticked.png",
// 				name: "Ticked",
// 				id: "4hair_tra",
// 				colorable: "true"
// 			},
// 			//TERT GENES
// 			{
// 				geneClass: "tertiary",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/tertiary_templates/bioluminescence.png",
// 				name: "Bioluminescence",
// 				id: "1tert_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "tertiary",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/tertiary_templates/jagged.png",
// 				name: "Jagged",
// 				id: "2tert_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "tertiary",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/tertiary_templates/runes.png",
// 				name: "Runes",
// 				id: "3tert_tra",
// 				colorable: "true"
// 			},
// 			{
// 				geneClass: "tertiary",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/tertiary_templates/scales.png",
// 				name: "Scales",
// 				id: "4tert_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "tertiary",
// 				baseImg: "/assets/unicorn_base_imgs/unicorn_base_imgs/traditionalcorn/template_imgs/tertiary_templates/swirls.png",
// 				name: "Swirls",
// 				id: "5tert_tra",
// 				colorable: "true"
// 			},
// 			//EYE GENES
// 			{
// 				geneClass: "eye",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/eyes_glitter.png",
// 				name: "Glitter Eye",
// 				id: "1eyes_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "eye",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/eyes_iridescent.png",
// 				name: "Iridescent Eye",
// 				id: "2eyes_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "eye",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/eyes_rainbow.png",
// 				name: "Rainbow Eye",
// 				id: "3eyes_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "eye",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/eyes_starlight.png",
// 				name: "Starlight Eye",
// 				id: "4eyes_tra",
// 				colorable: "false"
// 			},
// 			//HOOF GENES
// 			{
// 				geneClass: "hoof",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/hoof_glitter.png",
// 				name: "Glitter Hoof",
// 				id: "1hoof_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "hoof",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/hoof_starlight.png",
// 				name: "Starlight Hoof",
// 				id: "2hoof_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "hoof",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/hoof_striped.png",
// 				name: "Striped Hoof",
// 				id: "3hoof_tra",
// 				colorable: "true"
// 			},
// 			//HORN GENES
// 			{
// 				geneClass: "horn",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/horn_glitter.png",
// 				name: "Glitter Horn",
// 				id: "1horn_tra",
// 				colorable: "false"
// 			},
// 			{
// 				geneClass: "horn",
// 				baseImg: "/assets/unicorn_base_imgs/traditionalcorn/template_imgs/extras_templates/horn_starlight.png",
// 				name: "Starlight Horn",
// 				id: "2horn_tra",
// 				colorable: "false"
// 			}
// 		]
// 	}
// ];


// function seedDB() {
//     data.forEach(function(seed){
// 		Breed.create(seed, function(err, newbreed){
// 			if(err){
// 				console.log(err);
// 			} else {
// 				console.log("added a seed");
// 			}
// 		}); 
// 	});    
// }

////SEEDING GENES
// var data = [
// 	{
// 		"id": "1body",
// 		"geneClass": "body",
// 		"name": "Cloud",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "2body",
// 		"geneClass": "body",
// 		"name": "Glitter",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "3body",
// 		"geneClass": "body",
// 		"name": "Gradient",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "4body",
// 		"geneClass": "body",
// 		"name": "Roan",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "5body",
// 		"geneClass": "body",
// 		"name": "Sparkle",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "1hair",
// 		"geneClass": "hair",
// 		"name": "Flames",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "2hair",
// 		"geneClass": "hair",
// 		"name": "Gradient",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "3hair",
// 		"geneClass": "hair",
// 		"name": "Sparkle",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "4hair",
// 		"geneClass": "hair",
// 		"name": "Ticked",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "1tert",
// 		"geneClass": "tertiary",
// 		"name": "Bioluminescence",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "2tert",
// 		"geneClass": "tertiary",
// 		"name": "Jagged",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "3tert",
// 		"geneClass": "tertiary",
// 		"name": "Runes",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "4tert",
// 		"geneClass": "tertiary",
// 		"name": "Scales",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "5tert",
// 		"geneClass": "tertiary",
// 		"name": "Swirls",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "1eyes",
// 		"geneClass": "eye",
// 		"name": "Glitter Eye",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "2eyes",
// 		"geneClass": "eye",
// 		"name": "Iridescent Eye",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "3eyes",
// 		"geneClass": "eye",
// 		"name": "Rainbow Eye",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "4eyes",
// 		"geneClass": "eye",
// 		"name": "Starlight Eye",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "1hoof",
// 		"geneClass": "hoof",
// 		"name": "Glitter Hoof",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "2hoof",
// 		"geneClass": "hoof",
// 		"name": "Starlight Hoof",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "3hoof",
// 		"geneClass": "hoof",
// 		"name": "Striped Hoof",
// 		"colorable": "true"
// 	},
// 	{
// 		"id": "1horn",
// 		"geneClass": "horn",
// 		"name": "Glitter Horn",
// 		"colorable": "false"
// 	},
// 	{
// 		"id": "2horn",
// 		"geneClass": "horn",
// 		"name": "Starlight Horn",
// 		"colorable": "false"
// 	}
// ]
// function seedDB() {
// 	data.forEach(function(seed){
// 		Gene.create(seed, function(err, newGene){
// 			if(err){
// 				console.log(err);
// 			} else {
// 				console.log("added a seed");
// 			}
// 		}); 
// 	});
// }




////SEEDING INVENTORY
function seedDB() {
	var dataArray = [];
	const dir1 = './public/assets/inventory/decorative'
	var files = fs.readdirSync(dir1)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		var data = {
			img: img,
			name: name,
			category: "decorative",
			publicName: publicName
		}
		dataArray.push(data);
	}
	const dir2 = './public/assets/inventory/companions'
	var files = fs.readdirSync(dir2)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		// console.log(img, name, publicName);
		var data = {
			img: img,
			name: name,
			category: "companions",
			publicName: publicName
		}
		dataArray.push(data);
	}
	const dir3 = './public/assets/inventory/environment'
	var files = fs.readdirSync(dir3)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		// console.log(publicName);
		var data = {
			img: img,
			name: name,
			category: "environment",
			publicName: publicName
		}
		dataArray.push(data);
	}
	const dir4 = './public/assets/inventory/backdrops'
	var files = fs.readdirSync(dir4)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		// console.log(publicName);
		var data = {
			img: img,
			name: name,
			category: "backdrops",
			publicName: publicName
		}
		dataArray.push(data);
	}
	const dir5 = './public/assets/inventory/gems'
	var files = fs.readdirSync(dir5)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		// console.log(publicName);
		var data = {
			img: img,
			name: name,
			category: "gems",
			publicName: publicName
		}
		dataArray.push(data);
	}
	const dir6 = './public/assets/inventory/tech'
	var files = fs.readdirSync(dir6)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		// console.log(publicName);
		var data = {
			img: img,
			name: name,
			category: "tech",
			publicName: publicName
		}
		dataArray.push(data);
	}
	const dir7 = './public/assets/inventory/tiles'
	var files = fs.readdirSync(dir7)
	for(var i=0; i < files.length; i++) {
		let img = files[i];
		let name = files[i].slice(0, -4);
		let publicName = name.replace(/-/g, ": ").replace( /_/g, " ");
		// console.log(publicName);
		var data = {
			img: img,
			name: name,
			category: "tiles",
			publicName: publicName
		}
		dataArray.push(data);
	}
	
	dataArray.forEach(function(seed){
		Inventory.create(seed, function(err, newItem){
			if(err){
				console.log(err);
			} else {
				console.log("added a seed");
			}
		}); 
	});
}

module.exports = {seedDB};