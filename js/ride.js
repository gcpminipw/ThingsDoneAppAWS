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

    // function to get the list of items from the server
    // use jquery ajax to get the items from API endpoint _config.api.invokeUrl + '/getallitems',
    // using the authToken
    function getItems() {
        console.log("getting all items");
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/getallitems',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: displayItems,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error getting items: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when getting your items:\n' + jqXHR.responseText);
            }
        });
    }

    // function to display items in the list from json
    // the html list has the id "items"
    function displayItems(json) {
        console.log('Response received from API: ', json);
        var items = document.getElementById("items");
        items.innerHTML = "";
        for (var i = 0; i < json.length; i++) {
            var li = document.createElement("li");
            items.appendChild(li);
            li.innerHTML = json[i].title + " " + json[i].comment + " " + json[i].score;
            var deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Delete";
            deleteButton.onclick = function() {
                deleteItem(li);
            };
            li.appendChild(deleteButton);
            var editButton = document.createElement("button");
            editButton.innerHTML = "Edit";
            editButton.onclick = function() {
                makeItemEditable(li);
            };
            li.appendChild(editButton);
            li.title = json[i].title;
        }
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
        
        // // thingsdoneapp
        // $('#search_button').click(searchitems);
        $('#additem_button').click(addItem);
        $('#refresh_button').click(getItems);
        // get the list of items from the server
        console.log("getting items");
        getItems();
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



    // function to add an item to the list
    function addItem() {
        // get the title, comment and score from the html form
        var title = document.getElementById("title").value;
        var comment = document.getElementById("comment").value;
        var score = document.getElementById("score").value;
        // use jquery ajax to post the item to API endpoint _config.api.invokeUrl + '/additem',
        // using the authToken
        console.log('Adding item');
        //print item to be added
        console.log('Title: ' + title);
        console.log('Comment: ' + comment);
        console.log('Score: ' + score);
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
            success: function() {
                //log the data
                console.log('success in adding new data');
                getItems();
            }
        });
    }

    //function to delete selected item from the list
    function deleteItem(li) {
        var title = li.title;
        // use jquery ajax to delete the item with API endpoint _config.api.invokeUrl + '/deleteitem',
        console.log('Deleting item');
        console.log(title_lowercase);

        $.ajax({
            method: 'DELETE',
            url: _config.api.invokeUrl + '/deleteitem',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                original_json: {
                    'title': title
                }
            }),
            contentType: 'application/json',
            success: function() {
                console.log('success in deleting data');
                getItems();
            }
        });
    }



}(jQuery));
