var WildRydes = window.WildRydes || {};

(function scopeWrapper($) {
    // TODO @Iluvatar: change endpoint names to standard CRUD names
    notes.get = function (filter) { return makeApiCall('GET', '/getallitems', {}) } // TODO @Iluvatar: merge "getallitems" and "getfilteritems"
    notes.new = function (title, comment, score) { makeApiCall('POST', '/additem', { title, comment, score }).then(callbacks.draw) }
    // notes.update = function (uid, title, comment, score) { makeApiCall('PUT', '/updateitem', { uid, title, comment, score }).then(callbacks.draw) }
    notes.update = function (uid, title, comment, score) { throw 'Not implemented, update by uid is needed' } // TODO @Iluvatar: implement
    // notes.delete = function (uid) { makeApiCall('DELETE', '/deleteitem', { uid }).then(callbacks.draw) }
    notes.delete = function (uid) { throw 'Not implemented, deletion by uid is needed' } // TODO @Iluvatar: implement

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

    function makeApiCall(method, path, data) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                method: method,
                url: _config.api.invokeUrl + path,
                headers: {
                    Authorization: authToken
                },
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: resolve,
                error: reject
            });
        })
    }
}(jQuery));