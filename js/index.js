(function () {
	var responseJson,
		queryCounter = 0,
		slideCounter,
		location,
		temperature,
		userData = {},
		settings = {
			classes: {
				"botMessage": "bot-msg",
				"userMessage": "user-msg",
				"active": "active"
			},
			selectors: {
				"userInput": "userInput",
				"submitBtn": "submitBtn"
			}
		};

	const { 
		fetchData, 
		findElement, 
		createMessageBlock,
		createVideoBlock, 
		createCarouselBlock,
		fetchLocationAndTemp
	} = Chatbot,
		userInput = findElement(settings.selectors.userInput),
		submitBtn = findElement(settings.selectors.submitBtn);

	submitBtn.addEventListener("click", submitHandler);

	fetchLocationAndTemp(fetchLocationSuccess, fetchLocationFailure)

	/**
		* fetchLocationSuccess - success callback for fetching the local weather
		* @param {object} res - response object after successful ajax call
	*/
	function fetchLocationSuccess(res) {
		temperature = res.main.temp;
		location = res.name;

		fetchData({
			url: 'js/response.json',
			type: 'GET',
			success: function (res) {
				responseJson = res;
				createMessageBlock({
					messageText: responseJson.query[queryCounter],
					messageType: settings.classes.botMessage,
					temperature,
					location
				});
			}
		});
	}

	/**
		* fetchLocationFailure - failure callback for fetching user's location
		* @param {object} err - error object after failed ajax call
	*/
	function fetchLocationFailure (err) {
		console.error(err.message + ': Unable to fetch location and temperature');
		fetchData({
			url: 'js/response.json',
			type: 'GET',
			success: function (res) {
				responseJson = res;
				createMessageBlock({
					messageText: responseJson.query[queryCounter],
					messageType: settings.classes.botMessage
				});
			}
		});
	}

	/**
		* submitHandler - event listener for the submit input button
	*/
	function submitHandler (event) {
		event.preventDefault();

		createMessageBlock({
			messageText: userInput.value,
			messageType: settings.classes.userMessage
		});

		responseGenerator(userInput.value.toLowerCase());
		userInput.value = '';
	}

	/**
		* responseGenerator - generates response based on the user's input
		* @param {String} userInput - input provided by user
	*/
	function responseGenerator (userInput) {
		var answer = responseJson.userResponse,
			washes = responseJson.recommendedWash,
			carouselPrev,
			carouselNext;

		if(queryCounter == 0 && answer[userInput]) {
			if(typeof answer[userInput].botResponse === 'boolean') {
				queryCounter++;
				userData = { 
					userInput,
					recommendedShampoo: answer[userInput].recommendation
				};

				createMessageBlock({
					messageText: responseJson.query[queryCounter],
					messageType: settings.classes.botMessage
				});
			}

			else {
				answer[userInput].botResponse.forEach( function(res, index) {
					createMessageBlock({
						messageText: res,
						messageType: settings.classes.botMessage
					});
				});
				createVideoBlock(answer[userInput].mediaLink);
			}
		}

		else if(queryCounter == 1 && typeof parseInt(userInput) === 'number') {
			if((userInput > washes.noOfWash && userData.userInput === 'dull') || (userInput <= washes.noOfWash && userData.userInput === 'oily')) {
				createMessageBlock({
					messageText: washes.optionalResponse,
					messageType: settings.classes.botMessage,
					number: userInput,
					hairCondition: userData.userInput
				});
			}

			createMessageBlock({
				messageText: washes.botResponse,
				messageType: settings.classes.botMessage,
				recommendedShampoo: userData.recommendedShampoo
			});

			createCarouselBlock(responseJson.carousel);

			slideCounter = 0;
			carouselPrev = findElement('slide-left');
			carouselNext = findElement('slide-right');

			carouselPrev.addEventListener('click', function () {
				changeSlide(slideCounter-1);
			});
			carouselNext.addEventListener('click', function () {
				changeSlide(slideCounter+1);
			});
		}

		else {
			createMessageBlock({
				messageText: responseJson.userResponse.default,
				messageType: settings.classes.botMessage
			});

			createMessageBlock({
				messageText: responseJson.query[queryCounter],
				messageType: settings.classes.botMessage,
				temperature,
				location
			});
		}
	}

	/**
		* changeSlide - event handler for handling the slide change in image carousel
		* @param {Number} currentSlide - index of the new slide in carousal
	*/
	function changeSlide (currentSlide) {
		var carousel = findElement('slide');

		if(currentSlide >= 0 && currentSlide < carousel.children.length - 2) {
			carousel.children.namedItem(slideCounter).classList.remove(settings.classes.active);
			carousel.children.namedItem(currentSlide).classList.add(settings.classes.active);
			slideCounter = currentSlide;
		}
		
	}

})();