(function scopeWrapper($) {
    const db = {}
    notes.get = function (filter) { return Object.values(db).filter(n => !filter || n.title.indexOf(filter) != -1) }
    notes.new = function (title, comment, score, user = notes.user()) { let now = Date.now(); db[now] = { title, comment, score, uid: now, timestamp_last_modified: now }; callbacks.draw() }
    notes.update = function (uid, title, comment, score) { db[uid] = { title, comment, score, uid, timestamp_last_modified: Date.now() }; callbacks.draw() }
    notes.delete = function (uid) { delete db[uid]; callbacks.draw() }
    notes.user = function () { return "mockup-user" }

    // notes.new('Example', 'Example note with example description', 5)
    // setTimeout(() => {
    //     notes.new('Example 2', 'Completely different example', 4)
    // }, 1000)

    let i = 0
    const inter = setInterval(() => {
        const vowels = 'aeiou'
        const consonants = 'bcdfgjklmnpstvwxz'
        const randomString = (length, chars) => Array(length).fill().map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
        const randomWord = () => Array(Math.floor(Math.random() * 3) + 1).fill().map(() => randomString(1, consonants) + randomString(Math.floor(Math.random() * 1.5) + 1, vowels)).join("") + randomString(1, consonants + vowels)
        const randomSentence = () => Array(Math.floor(Math.random() * 10) + 1).fill().map(() => randomWord()).join(' ')
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

        notes.new(capitalize(randomWord()), capitalize(randomSentence()), Math.floor(Math.random() * 5) + 1)

        i++
        if (i > 120) clearInterval(inter)
    }, 5)

}(jQuery));