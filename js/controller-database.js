var Journify = window.Journify || {};

(function scopeWrapper($) {
    notes.get = function (filter = "") { return makeApiCall('GET', `/entries`, { filter }, false) }
    notes.new = function (title, comment, score) { makeApiCall('POST', `/entries`, { title, comment, score }).then(callbacks.draw) }
    notes.update = function (uid, title, comment, score) { makeApiCall('PUT', `/entries/${uid}`, { title, comment, score }).then(callbacks.draw) }
    notes.delete = function (uid) { makeApiCall('DELETE', `/entries/${uid}`, {}).then(callbacks.draw) }
    notes.user = function () { return Journify.username }

    var authToken;
    Journify.authToken.then(function setAuthToken(token) {
        console.log("Token: ", token)
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin';
    });

    function makeApiCall(method, path, data, auth = true) {
        return new Promise(function (resolve, reject) {
            const onError = (error) => {
                console.warn(error)
                reject(error)
            }
            $.ajax({
                method: method,
                url: _config.api.invokeUrl + path,
                headers: auth ? { Authorization: authToken } : {},
                data: method == "GET" ? data : JSON.stringify(data),
                contentType: 'application/json',
                success: resolve,
                error: reject
            });
        })
    }
}(jQuery));