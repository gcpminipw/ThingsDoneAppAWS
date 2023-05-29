var WildRydes = window.WildRydes || {};

(function scopeWrapper($) {
    notes.get = function (filter) { return makeApiCall('GET', $`/entries`, {}) }
    notes.new = function (title, comment, score) { makeApiCall('POST', $`/entries`, { title, comment, score }).then(callbacks.draw) }
    notes.update = function (uid, title, comment, score) { makeApiCall('PUT', $`/entries/${uid}`, { uid, title, comment, score }).then(callbacks.draw) }
    notes.delete = function (uid) { makeApiCall('DELETE', $`/entries/${uid}`, {}).then(callbacks.draw) }

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