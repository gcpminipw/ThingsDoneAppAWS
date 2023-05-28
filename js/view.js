(function scopeWrapper($) {
    callbacks.draw = async function () {
        const data = await notes.get()
        console.log(data)
    }


    $(function onDocReady() {
        callbacks.draw()
    });
}(jQuery));