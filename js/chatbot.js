var Chatbot = function () {
	var temperature,
		location,
		messagesContainer = findElement('messages');

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

    function findElement (selector) {
    	return document.getElementById(selector);
    }

    function createDOMElement ({ tag, attributes, innerText, parent }) {
    	var element = document.createElement(tag);

    	if(attributes) {
    		for(var key in attributes) {
    			element.setAttribute(key, attributes[key]);
    		}
    	}

    	if(innerText)
    		element.innerText = innerText;

    	parent.appendChild(element);
    }

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
		fetchLocationAndTemp: fetchLocationAndTemp
	}
}();