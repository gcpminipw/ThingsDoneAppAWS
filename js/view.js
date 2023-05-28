(function scopeWrapper($) {
    callbacks.draw = async function () {
        const data = await notes.get()
        fillList($('#owned'), data)
    }

    function addEntry(entry, $parent) {
        const $entry = $(`
            <a href="#" class="list-group-item list-group-item-action py-3 lh-sm">
                <div class="d-flex w-100 align-items-center justify-content-between">
                    <strong class="mb-1"></strong>
                    <small class="text-body-secondary"></small>
                </div>
                <div class="col-10 mb-1 small">Some placeholder content in a paragraph below the heading and date.
                </div>
            </a>
        `)
        $entry.find('strong').text(entry.title)
        $entry.find('small').text(entry.score)
        $entry.find('div.mb-1').text(entry.comment)
        $entry.id = entry.uid

        $parent.append($entry)
    }

    function fillList($parent, data) {
        $parent.empty()
        data.sort((a, b) => b.uid - a.uid).forEach(entry => addEntry(entry, $parent))
    }


    $(function onDocReady() {
        callbacks.draw()
    });
}(jQuery));