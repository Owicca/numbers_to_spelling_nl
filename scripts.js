const MAX_INT = 10000;

let Application = function (){
	let self = this;

	self.components = {
		"app": document.getElementById("app"),
		"legend": document.getElementById("legend"),
		"running": document.getElementById("running"),
		"description": document.getElementById("description"),
		"translator": null,
		"max": 100000,
	};

	self.init = function(options) {
		for(let opt in options) {
			if(opt in self.components) {
				self.components[opt] = options[opt];
			}
		}

		let start = self.components.description.querySelector("input");
		start.addEventListener("click", function(evt) {
			self.components.app.classList.toggle("running");
		});

		let submit = self.components.running.querySelector("#skip");
		submit.addEventListener("click", function(evt) {
			self.newRound();
		});

		let check = self.components.running.querySelector("#check");
		check.addEventListener("click", function(evt) {
			let spelled = self.components.running.querySelector("#user_input").value
				.trim().replace(/\s{2,}/g, " ");
			let generated = self.components.running.querySelector("#spelled_number").textContent
				.trim().replace(/\s{2,}/g, " ");
			//console.log(generated, spelled, self.checkResponse(generated, spelled));
			let message = self.checkResponse(generated, spelled);
			alert(message);
			if (message == true) {
				check.setAttribute("disabled", true);
				submit.value = "Next";
			}
		});

		self.newRound();
	};

	self.showError = function(message) {
		alert(message);
	};
	self.checkResponse = function(val1, val2) {
		return val1 === val2;
	}

	self.generateRandomNumber = function (max) {
		return Math.floor(Math.random() * Math.floor(max));
	};

	self.newRound = function () {
		let check = self.components.running.querySelector("#check");
		let skip = self.components.running.querySelector("#skip");
		let genContainer = self.components.running.querySelector("#generated_number");
		let spelledContainer = self.components.running.querySelector("#spelled_number");

		check.removeAttribute("disabled");
		skip.value = "Skip";

		let number = self.generateRandomNumber(self.components.max);

		genContainer.textContent = String(number);
		spelledContainer.textContent = self.components.translator.spellNumber(number);
	};

	return self;
};

let Translator = function() {
	let self = this;

	self.numbers = {
		0: "nul",
		1: "een",
		2: "twee",
		3: "drie",
		4: "vier",
		5: "vijf",
		6: "zes",
		7: "zegen",
		8: "acht",
		9: "negen",
		10: "tien"
	};

	self.uniqueSpelling = Object.assign(self.numbers, {
		100: "honderd",
		1000: "duizend",
		1000000: "miljoen",
	});
	self.tens = function(number) {
		switch(number) {
			case "2":
				return self.tens("twin");
			case "3":
				return self.tens("der");
			case "4":
				return self.tens("veer");
			case "8":
				return self.tens("t" + self.numbers["8"]);
			default:
				return number + "tig";
		}
	};
	self.tenToTwenty = function(number) {
		switch(number) {	
			case "11":
				return "elf";
			case "12":
				return "twaalf";
			case "13":
				return self.tenToTwenty("der");
			case "14":
				return self.tenToTwenty("veer");
			default:
				return number + "tien";
		}
	};
	self.compoundTen = function(group) {
		let split = group.match(/\w/g);
		return self.numbers[split[1]] + "en" + self.tens(split[0]);
	}
	self.hundred = function(hundred) {
		return self.numbers[hundred] + self.uniqueSpelling[100];
	}
	self.thousand = function(thousand) {
		return self.numbers[thousand] + self.uniqueSpelling[1000];
	}
	self.million = function(million) {
		return self.numbers[million] + self.uniqueSpelling[1000000];
	}

	self.spellNumber = function(number) {//write a fuzzer, check the 10 case
		let spelled = "";
		number = String(number);
		let length = number.length;
		let number_array = number.match(/\d/g);
		//console.log("Data: ", contents, length);
		if (length <= 3) {
			spelled += self.spellThree(number_array);
			//console.log("Less than 3");
		} else {
			//console.log("More than 3");
			let contents = number_array.reverse().join("").match(/\d{1,3}/g);
			// console.log("contents: ", contents);
			for(let i = contents.length - 1; contents[i]; i--) {
				let number_array = contents[i].match(/\d/g).reverse();
				spelled += self.spellThree(number_array);
				//console.log(`For ${contents[i]} we have ${self.spellThree(number_array)}`);
				if (i > 0) {
					if (contents.length >= 2) {
						let uniqueIndex = Math.pow(10, 3 + i - 1);
						let multi = self.uniqueSpelling[uniqueIndex];
						if(multi) {
							spelled += multi;
							// console.log("added multi: ", multi);
						}
						// console.log("multi :", uniqueIndex , " ", multi)
					}

					spelled += " ";
					// console.log("added separator");
				}
			}
		}

		return spelled.trim();
	};
	self.spellTwo = function(number_array) {
		let spelled = "";

		//console.log(`In spellTwo for: ${number_array} check ${number_array[1] > 0}`);
		if(number_array[1] > 0) {
			if (number_array[0] == "1") {
				spelled += self.tenToTwenty(number_array.join(""));
			} else {
				spelled += self.compoundTen(number_array.join(""));
			}
		} else {
			spelled += self.tens(number_array[0]);
		}

		return spelled;
	};
	self.spellThree = function(number_array) {
		let spelled = "";

		if(number_array.length == 3 && number_array[0] > 0) {
			spelled += self.numbers[number_array[0]] + self.uniqueSpelling[100] + " ";
		}
		//console.log(`For: ${number_array} check ${number_array[1] > 0}`);
		if(number_array[1] > 0) {
			spelled += " " + self.spellTwo(number_array.slice(1, 3));
		} else if(number_array[2] > 0) {
			spelled += " " + self.numbers[number_array[2]];
		} else if (number_array.length == 1) {
			spelled += " " + self.numbers[number_array[0]];
		}

		return spelled;
	};

	self.init = function() {};

	return self;
};

let options = {
	"max": MAX_INT,
	"translator": Translator(),
};

app = Application();
app.init(options);