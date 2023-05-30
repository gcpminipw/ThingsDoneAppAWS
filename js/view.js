(function scopeWrapper($) {
    scoreMapping = {
        "1": "Bad",
        "2": "Meh",
        "3": "Ok",
        "4": "Good",
        "5": "Awesome"
    }

    callbacks.draw = async function () {
        const data = await notes.get()
        $("body").removeClass('during-edit')
        fillList($('#owned'), data.filter(n => n.username == notes.user()))
        for (let i in scoreMapping) {
            fillList($(`#rate-${i}`), data.filter(n => n.score == i))
        }
    }

    $(function onDocReady() {
        for (let i in scoreMapping) {
            const rating = scoreMapping[i]
            $('#rated').prepend(`
            <div class="col" style="max-width: 380px">
                <div class="fs-5 fw-semibold text-light text-center py-2 pt-4 border-bottom">${rating}</div>
                <div id="rate-${i}" class="list-group list-group-flush border-bottom scrollarea"></div>
            </div>`)
        }
        callbacks.draw()
        $('#new').click(function () { makeEditable(addEntry({}, $('#owned'))) })
        setInterval(() => {
            for (let i in scoreMapping) {
                $(`#rate-${i}`).css({
                    top: `min(0px, calc(100vh - ${$(`#rate-${i}`).outerHeight()}px - 1.5rem))`
                })
            }
        }, 200)
    });

    function addEntry(entry, $parent) {
        const $entry = $(`
            <div class="list-group-item list-group-item-action py-3 lh-sm" ondragstart="return false;" ondrop="return false;">
                <div class="d-flex w-100 align-items-center justify-content-between">
                    <strong class="mb-1"></strong>
                    <small class="text-body-secondary">
                        <select disabled data="pull-right" data-style="text-right">
                            <option value="5">Awesome</option>
                            <option value="4">Good</option>
                            <option value="3">Ok</option>
                            <option value="2">Meh</option>
                            <option value="1">Bad</option>
                        </select>
                    </small>
                </div>
                <div class="d-flex w-100 align-items-center justify-content-between">
                    <div class="col-10 mb-1 small" style="min-height: 16px">Some placeholder content in a paragraph below the heading and date.</div>
                    <svg class="icon-edit" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                </div>
                <div class="entry-buttons d-flex w-100 align-items-center justify-content-around">
                    <a class="small fw-bold link-body-emphasis text-decoration-none">Save</a>
                    <a class="small fw-bold link-body-emphasis text-decoration-none">Cancel</a>
                    <a class="small fw-bold link-body-emphasis text-decoration-none">Delete</a>
                </div>
            </div>
        `)
        $entry.find('strong').text(entry.title || "")
        $entry.find('div.mb-1').text(entry.comment || "")
        $entry.find('select').val(entry.score || 3)
        if (entry.timestamp_created) $entry.id = entry.timestamp_created
        else $entry.addClass('new')
        if (entry.username == notes.user()) $entry.addClass('owned')

        $entry.find('.icon-edit').on('click', () => makeEditable($entry))
        $entry.find('.entry-buttons a:nth-child(1)').on('click', () => makeUneditable($entry, true))
        $entry.find('.entry-buttons a:nth-child(2)').on('click', () => makeUneditable($entry, false))
        $entry.find('.entry-buttons a:nth-child(3)').on('click', () => notes.delete($entry.id))

        $parent.prepend($entry)
        return $entry
    }

    function fillList($parent, data) {
        $parent.empty()
        if (data.length == 0) $parent.append('<div class="list-group-item list-group-item-action py-3 lh-sm small text-center font-italic" style="filter: brightness(0.7)">No entries yet</div>')
        else data.sort((a, b) => a.timestamp_created - b.timestamp_created).forEach(entry => addEntry(entry, $parent))
    }

    function makeEditable($entry) {
        $entry.find('strong').attr('contenteditable', true)
        $entry.find('strong').attr('data-original', $entry.find('strong').text())
        $entry.find('div.mb-1').attr('contenteditable', true)
        $entry.find('div.mb-1').attr('data-original', $entry.find('div.mb-1').text())
        $entry.find('select').removeAttr('disabled')
        $entry.find('select').attr('data-original', $entry.find('select').val())
        $entry.addClass('editable')
        $("body").addClass('during-edit')
    }

    function makeUneditable($entry, save) {
        const uid = $entry.id
        if (save) {
            const $title = $entry.find('strong')
            const title = $title.text()
            if (!title) {
                $title.removeClass('error')
                setTimeout(() => $title.addClass('error'), 30)
                return
            }

            const comment = $entry.find('div.mb-1').text()
            const score = $entry.find('select').val()
            if (uid === undefined) {
                notes.new(title, comment, score)
            } else {
                notes.update(uid, title, comment, score)
            }
        } else {
            if (uid === undefined) {
                $entry.remove()
            } else {
                $entry.find('strong').text($entry.find('strong').attr('data-original'))
                $entry.find('div.mb-1').text($entry.find('div.mb-1').attr('data-original'))
                $entry.find('select').val($entry.find('select').attr('data-original'))
                $entry.find('strong').attr('data-original', '')
                $entry.find('div.mb-1').attr('data-original', '')
                $entry.find('select').attr('data-original', '')
            }
        }

        $entry.find('strong').attr('contenteditable', false).removeClass('error')
        $entry.find('div.mb-1').attr('contenteditable', false)
        $entry.find('select').attr('disabled', true)
        $entry.removeClass('editable')
        $("body").removeClass('during-edit')
    }

}(jQuery));