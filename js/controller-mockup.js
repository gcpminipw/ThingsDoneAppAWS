(function scopeWrapper($) {
    const db = {}
    notes.get = function (filter) { return Object.values(db).filter(n => !filter || n.title.indexOf(filter) != -1) }
    notes.new = function (title, comment, score) { let now = Date.now(); db[now] = { title, comment, score, uid: now, timestamp_last_modified: now }; callbacks.draw(); console.warn(db) }
    notes.update = function (uid, title, comment, score) { db[uid] = { title, comment, score, uid, timestamp_last_modified: Date.now() }; callbacks.draw() }
    notes.delete = function (uid) { delete db[uid]; callbacks.draw() }

    notes.new('Example', 'Example note with example description', 5)
    notes.new('Example 2', 'Completely different example', 4)

}(jQuery));