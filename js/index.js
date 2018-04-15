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

	const userInput = Chatbot.findElement(settings.selectors.userInput),
		submitBtn = Chatbot.findElement(settings.selectors.submitBtn);

	submitBtn.addEventListener("click", submitHandler);

	Chatbot.fetchLocationAndTemp(fetchLocationSuccess, fetchLocationFailure)

	function fetchLocationSuccess(res) {
		temperature = res.main.temp;
		location = res.name;

		Chatbot.fetchData({
			url: 'js/response.json',
			type: 'GET',
			success: function (res) {
				responseJson = res;
				Chatbot.createMessageBlock({
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
		Chatbot.fetchData({
			url: 'js/response.json',
			type: 'GET',
			success: function (res) {
				responseJson = res;
				Chatbot.createMessageBlock({
					messageText: responseJson.query[queryCounter],
					messageType: settings.classes.botMessage
				});
			}
		});
	}

	function submitHandler (event) {
		event.preventDefault();

		Chatbot.createMessageBlock({
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

				Chatbot.createMessageBlock({
					messageText: responseJson.query[queryCounter],
					messageType: settings.classes.botMessage
				});
			}

			else {
				answer[userInput].botResponse.forEach( function(res, index) {
					Chatbot.createMessageBlock({
						messageText: res,
						messageType: settings.classes.botMessage
					});
				});
				Chatbot.createVideoBlock(answer[userInput].mediaLink);
			}
		}

		else if(queryCounter == 1 && typeof parseInt(userInput) === 'number') {
			if((userInput > washes.noOfWash && userData.userInput === 'dull') || (userInput <= washes.noOfWash && userData.userInput === 'oily')) {
				Chatbot.createMessageBlock({
					messageText: washes.optionalResponse,
					messageType: settings.classes.botMessage,
					number: userInput,
					hairCondition: userData.userInput
				});
			}

			Chatbot.createMessageBlock({
				messageText: washes.botResponse,
				messageType: settings.classes.botMessage,
				recommendedShampoo: userData.recommendedShampoo
			});
		}

		else {
			Chatbot.createMessageBlock({
				messageText: responseJson.userResponse.default,
				messageType: settings.classes.botMessage
			});

			Chatbot.createMessageBlock({
				messageText: responseJson.query[queryCounter],
				messageType: settings.classes.botMessage,
				temperature,
				location
			});
		}
	}

})();