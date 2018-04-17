var Chatbot = function () {
	var temperature,
		location,
		messagesContainer = findElement('messages');

	/**
		* fetchData - makes ajax call to fetch data
		* @param {object} - object with details required to make an ajax call
		* {string} url (required) - URL to send the request to 
		* {string} type (required) - type of request
		* {function} success (required) - callback to be called on successful request
		* {function} error (optional) - callback to be called on failed request
	*/
	function fetchData ({ url, type, success, error }) {   
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == "200") {
                success(JSON.parse(xhttp.responseText));
            }
            else if(error)
            	error();
        };
        xhttp.open(type, url, true);
        xhttp.send();
    }

    /**
		* findElement - find the DOM element with the specified selector
		* @param {string} selector - element id
		* @returns {object} - DOM element
	*/
    function findElement (selector) {
    	return document.getElementById(selector);
    }

    /**
		* createDOMElement - create a new DOM element
		* @param {object} - object with details of new element to be created
		* {string} tag (required) - tag name for new element
		* {object} attributes (optional) - attributes to be added in new element
		* {string} innerText (optional) - inner text to be added in new element
		* {string} innerHtml (optional) - inner HTML to be added in new element
		* {object} parent (required) - DOM element where the new element is to be appended
	*/
    function createDOMElement ({ tag, attributes, innerText, innerHtml, parent }) {
    	var element = document.createElement(tag);

    	if(attributes) {
    		for(var key in attributes) {
    			element.setAttribute(key, attributes[key]);
    		}
    	}

    	if(innerText)
    		element.innerText = innerText;

    	if(innerHtml)
    		element.innerHTML = innerHtml;

    	parent.appendChild(element);
    }

    /**
		* createMessageBlock - create a new chat message block
		* @param {object} - object with details of new chat message block to be created
		* {string} messageText (required) - message to be added
		* {string} messageType (required) - initiator of the message
		* {string} temperature (optional) - current tremperature
		* {string} location (optional) - current location
		* {string} number (optional) - number of washes
		* {string} hairCondition (optional) - hair condition of user
		* {string} recommendedShampoo (optional) - shampoo recommended by the bot
	*/
    function createMessageBlock ({ messageText, messageType, temperature, location, number, hairCondition, recommendedShampoo}) {
    	if(temperature && location)
			messageText = messageText.replace('{temperature}', temperature).replace('{cityName}', location);
		if(number && hairCondition)
			messageText = messageText.replace('{number}', number).replace('{hairCondition}', hairCondition);
		if(recommendedShampoo)
			messageText = messageText.replace('{recommendedShampoo}', recommendedShampoo);

		createDOMElement({
			tag: 'div',
			attributes: {
				class: messageType
			},
			innerText: messageText,
			parent: messagesContainer
		});

		messagesContainer.children[messagesContainer.children.length - 1].scrollIntoView();
	}

	/**
		* createVideoBlock - create a new chat message block with video element
		* @param {string} link - the youtube URL for the video
	*/
	function createVideoBlock (link) {
		createDOMElement({
			tag: 'iframe',
			attributes: {
				class: 'bot-msg',
				src: link,
				frameborder: 0,
				allowfullscreen: true
			},
			parent: messagesContainer
		});

		messagesContainer.children[messagesContainer.children.length - 1].scrollIntoView();
	}

	/**
		* createCarouselBlock - create a new chat message block with image carousel
		* @param {Array} imageList - list of image paths 
	*/
	function createCarouselBlock (imageList) {
		createDOMElement({
			tag: 'div',
			attributes: {
				class: 'bot-msg slide',
				id: 'slide'
			},
			parent: messagesContainer
		});

		createDOMElement({
			tag: 'span',
			attributes: {
				class: 'slide-left',
				id: 'slide-left'
			},
			innerHtml: '&#10094;',
			parent: findElement('slide')
		});

		imageList.forEach(function(image, index) {
			var carouselImage,
				carouselImageContainer = {
				tag: 'div',
				attributes: {
					class: (!index)? 'slide-item active' : 'slide-item',
					id: `slideItem${index}`,
					name: index
				},
				parent: findElement('slide')
			};
			createDOMElement(carouselImageContainer);

			carouselImage = {
				tag: 'img',
				attributes: {
					src: image
				},
				parent: findElement(`slideItem${index}`)
			};
			createDOMElement(carouselImage);
		});

		createDOMElement({
			tag: 'span',
			attributes: {
				class: 'slide-right',
				id: 'slide-right'
			},
			innerHtml: '&#10095;',
			parent: findElement('slide')
		});

		messagesContainer.children[messagesContainer.children.length - 1].scrollIntoView();

	}

	/**
		* fetchLocationAndTemp - makes ajax call to fetch th e current loaction of user and temperature
		* @param {function} successCallback - callback called on success of request for temperature
		* @param {function} failureCallback - callback called on failure of fetching user's location
	*/
	function fetchLocationAndTemp (successCallback, failureCallback) {		
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(location) {
				url = "http://api.openweathermap.org/data/2.5/weather?lat="+location.coords.latitude+"&lon="+location.coords.longitude+"&units=metric&APPID=d677437bdfcc77537e197a05bed652ab";
				fetchData({
					url, 
					type: 'GET',
					success: successCallback,
					error: function () {
						console.log('some error occured while fetching temperature');
					}
				});
			},
			failureCallback,
			{timeout:5000});
		}
		else
			console.error('Geolocation not supported in your browser');
	}

	return {
		fetchData: fetchData,
		findElement: findElement,
		createMessageBlock: createMessageBlock,
		createVideoBlock: createVideoBlock,
		createCarouselBlock: createCarouselBlock,
		fetchLocationAndTemp: fetchLocationAndTemp
	}
}();