var exampleModal = document.getElementById('helpModal')
	var modalTitle = document.querySelector(".modal-title");
	var modalBody = document.querySelector(".modal-body");
	exampleModal.addEventListener('show.bs.modal', function (event) {
		// Button that triggered the modal
		var button = event.relatedTarget
		// Extract info from data-bs-* attributes
		var origin = button.getAttribute('data-bs-origin')
		// Update the modal's content.
		modalBody.replaceChildren();
		updateContent(origin);
	})
	
	function setContent(titletext, bodytext) {
		modalTitle.textContent = titletext;
		bodytext.forEach((entry)=>{
			let p = document.createElement("p");
			p.textContent = entry;
			modalBody.append(p);
		})
	}

	function updateContent(origin) {
		if(origin === "bio"){
			var titletext = "Help: Bio Editor";
			var bodytext = [`To activate the Bio Editor, click inside the double-bordered box (the element labeled 'lore-form' for users assisted by screen readers). To close the Bio Editor without saving any changes, click the Cancel button, or click outside the double-bordered box.`];
			setContent(titletext, bodytext);
		} else if(origin === "build"){
			var titletext = "Help: Genetic Builder";
			var bodytext = [`How to use the genetic builder:`, `To create a new Unicorn, you  will need a token, which you can get by playing the Explore game. Customizing an existing unicorn does not require tokens.`, `To create a new Unicorn, select one of the base sprites from the Breeds dropdown list (labeled 'choose a base sprite' for users with screen readers). To customize an existing Unicorn, choose its name from the Unicorns dropdown menu (labeled 'choose a unicorn'). Existing Unicorns will load to the builder display automatically. For new Unicorns, please click 'Preview' to see the breed's base sprite in the builder display.`,
`Choose genes (markings for the body, mane, tail, etc) from the gene dropdown menus, which are labeled with the name of the gene slot. Click 'Preview' to see your gene choices in the builder display. To clear a gene selection from a slot, set the menu dropdown to the 'Clear Slot' option and click Preview to update your selections in the display.`,
`Change the base colors and gene colors with the color selector buttons, which are labeled with the name of each color slot. Select the slot you you want to change by clicking the button for that slot, and then use the color wheel and hue slider to set a color. The active color slot's button will have a green outline, making it easier to keep track of which slot you're currently on. The color wheel will update the selected slot's color automatically without needing to click 'Preview' again. Some genes are not colorable; for these, the gene color will not change in the builder display if you use the color wheel on that gene slot. If you do not set a color for a base color slot, it will default to black(#000000). If you select a colorable gene but do not set a color on it, the gene color will default to black as well. You may fill as many or as few gene slots and color slots as you wish; none of them are required. (But you do need to choose a breed, please!)`,
`When you're satisfied with your selections, click 'Create New Unicorn' or 'Customize Unicorn' at the bottom of the page. TIP: It's advisable to click Preview one more time before submitting, just to make sure all your selections are accounted for!`];
			setContent(titletext, bodytext);
		} else if(origin === "equip"){
			var titletext = "Help: Equipper";
			var bodytext = [`How to use the Equipper:`, 
`Select one of your Unicorns from the dropdown menu (labeled 'choose a unicorn' for users with screen readers).`, 
`In the inventory menu, click an item thumbnail to add it to the equipper display. All items and your Unicorns are draggable; place them wherever you want! (TIP: do not drag items or Unicorns entirely out of the display window, as you will not be able to bring them back! In the event that your item is dragged off the display, please refresh the page or add the item again. If your Unicorn is dragged off the display, you will need to refresh the page to start over.)`, `When an item loads to the display, it will have a boundary box with handles, which are the white squares on the corners and in the middle of each side, as well as one handle that will be above the item. The handles allow you to resize and rotate items. The corner handles can make an item smaller by clicking and dragging inward. Make an item wider or narrower by clicking the right or left side handles and dragging inward or outward. Make an item taller or shorter by clicking the top or bottom side handles and dragging up or down. To rotate an item, click the upper handle and drag clockwise or counterclockwise.`, `TIP: items will load in the top left corner. The upper handle may not be visible till you drag the item away from the corner.`,
`Use the tool buttons to adjust the items to your liking. You can put them behind or in front of the Unicorn, and you can change the layering of items over or behind each other as well. If you resize or rotate an item and want to undo it, the reset button will return it to its original size and rotation.`, `TIP: You can flip an item by clicking any of the boundary box handles and dragging all the way left, right, up, or down.`, `TIP: For items placed behind the Unicorn, changes to item size or rotation will not show up automatically. Please click on or next to the item after changing it to update the image. In addition, items behind the Unicorn will need to be moved in front of the Unicorn for resetting or removal.`, `TIP: To preserve image quality, resizing an item larger than its actual size is not permitted. You can, however, stretch images length-wise or width-wise, which is permitted mostly because it's funny.`,
`Click the Save button anytime to save your progress.`];
			setContent(titletext, bodytext);
		} else if(origin === "explore"){
			var titletext = "Help: Explore";
			var bodytext = [`How to Play:`, 
`Use your keyboard to navigate around the map and collect items.`, 
`RUN LEFT: Left Arrow <-`,
`RUN RIGHT: Right Arrow ->`, 
`JUMP STRAIGHT UP: Up Arrow ^`, 							
`KEY COMBO-- LEAP: Hit LEFT ARROW <- + UP ARROW ^ or RIGHT ARROW -> + UP ARROW ^ to jump forward while running.`,
`LEDGE GRAB: Up Arrow ^ + 'G'`, 
`LEDGE CLIMB: 'C' (While sprite is holding onto a ledge)`,
`HINT: You can leap and grab (G) a ledge! Try Left/Right Arrow <-/-> + UP Arrow ^ + Grab (G)`,
`TIP: Having trouble with a ledge? Some are more challenging than others, but none are impossible! Try moving slightly closer or further from the base of the ledge before jumping Up ^ to grab (G) it, and make sure you're facing towards the ledge you want to grab. Let go of ledges while grabbing by hitting the Left < or Right > arrows.`];
			setContent(titletext, bodytext);
		}
	}
	
	