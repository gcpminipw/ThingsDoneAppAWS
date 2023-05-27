/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestUnicorn(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var unicorn;
        var pronoun;
        console.log('Response received from API: ', result);
        unicorn = result.Unicorn;
        pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            WildRydes.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = WildRydes.map.selectedPoint;
        event.preventDefault();
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        if (dest.latitude > WildRydes.map.center.latitude) {
            origin.latitude = WildRydes.map.extent.minLat;
        } else {
            origin.latitude = WildRydes.map.extent.maxLat;
        }

        if (dest.longitude > WildRydes.map.center.longitude) {
            origin.longitude = WildRydes.map.extent.minLng;
        } else {
            origin.longitude = WildRydes.map.extent.maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }

    // // functions related to thingsdoneapp

    // function to display items in the list from json
    // the html list has the id "items"
    function displayItems(json) {
        // get the list of items
        var items = document.getElementById("items");
        // clear the list
        items.innerHTML = "";
        // for each item in the json
        for (var i = 0; i < json.length; i++) {
            // create a new list item with the item id as the id
            var li = document.createElement("li");
            li.id = json[i].id;
            // add the item to the list
            items.appendChild(li);
            // add the title, comment and score to the list item
            li.innerHTML = json[i].title + " " + json[i].comment + " " + json[i].score;
            // add a delete button to the list item
            var deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Delete";
            deleteButton.onclick = function() {
                deleteItem(li);
            };
            li.appendChild(deleteButton);
            // add an edit button to the list item
            var editButton = document.createElement("button");
            editButton.innerHTML = "Edit";
            editButton.onclick = function() {
                makeItemEditable(li);
            };
            li.appendChild(editButton);
        }
    }

    // function to get the list of items from the server
    function getItems() {
        // use jquery ajax to get the items from API endpoint _config.api.invokeUrl + '/getallitems',
        // using the authToken
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/getallitems',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: function(data) {
                // when the data is returned, display the items
                displayItems(data);
            }
        });
    }
    // function to add an item to the list
    function addItem() {
        // get the title, comment and score from the html form
        var title = document.getElementById("title").value;
        var comment = document.getElementById("comment").value;
        var score = document.getElementById("score").value;
        // use jquery ajax to post the item to API endpoint _config.api.invokeUrl + '/additem',
        // using the authToken
        console.log('adding item');
        //print item to be added
        console.log(title);
        console.log(comment);
        console.log(score);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/additem',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                title: title,
                comment: comment,
                score: score
            }),
            contentType: 'application/json',
            success: function(data) {
                //log the data
                console.log('success in adding new data');
                console.log(data);
                // when the data is returned, display the items
                getItems();
            }
        });
    }



}(jQuery));
