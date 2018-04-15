(function () {
	var responseJson,
		queryCounter = 0,
		location,
		temperature,
		userData = {},
		settings = {
			classes: {
				"botMessage": "bot-msg",
				"userMessage": "user-msg"
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
		fetchLocationAndTemp
	} = Chatbot,
		userInput = findElement(settings.selectors.userInput),
		submitBtn = findElement(settings.selectors.submitBtn);

	submitBtn.addEventListener("click", submitHandler);

	fetchLocationAndTemp(fetchLocationSuccess, fetchLocationFailure)

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

	function fetchLocationFailure (err) {
		console.error(err.message);
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

	function submitHandler (event) {
		event.preventDefault();

		createMessageBlock({
			messageText: userInput.value,
			messageType: settings.classes.userMessage
		});

		responseGenerator(userInput.value.toLowerCase());
		userInput.value = '';
	}

	function responseGenerator (userInput) {
		var answer = responseJson.userResponse,
			washes = responseJson.recommendedWash;

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

})();