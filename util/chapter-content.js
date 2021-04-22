'use strict'
const cheerio = require('cheerio')
// htmlparser2 is much more forgiving than parse5 (used in cheerio)
const htmlparser2 = require('htmlparser2');

const Chapter = use('fic').Chapter

// htmlparser2 options taken from cheerio defaults
const options = {
  withDomLvl1: true,
  normalizeWhitespace: false,
  xmlMode: true,
  decodeEntities: true
};

class ChapterContent extends Chapter {
  constructor (from, opts) {
    if (!from) {
      opts = {}
      super(opts)
    } else {
      if (from instanceof Chapter) {
        if (from instanceof ChapterContent && from._words == null) {
          from._words = 0
          super(Object.assign(from.toJSON(), {words: null}, opts || {}))
        } else {
          super(Object.assign(from.toJSON(), opts || {}))
        }
      } else {
        opts = from
        from = null
        super(opts)
      }
    }

    this.num = opts.num
    this.filename = opts.filename
    this.base = opts.base
    this._content = opts.content
    this._$content = null
    this._html = opts.html
    this._$html = null
    this.type = opts.type
    this.site = opts.site
    this._words = null
  }
  get html () {
    if (this._$html) {
      return this._$html.html()
    } else {
      return (this._html || '')
    }
  }
  set html (html) {
    this._html = html
    this._$html = null
  }
  get $ () {
    if (this._$html == null) {
      if (this._html == null) throw new Error('No html available')
      this._$html = cheerio.load(htmlparser2.parseDOM(this._html, options));
      this._$html.find = select => this._$html(select)
      this._html = null
    }
    return this._$html
  }
  set $ (html) {
    this._$html = html
    if (!html.find) html.find = select => this._$html(select)
    this._html = null
  }
  get content () {
    if (this._$content) {
      return this._$content.html()
    } else {
      return (this._content || '')
    }
  }
  set content (html) {
    this._content = html
    this._$content = null
  }
  get $content () {
    if (this._$content == null) {
      if (this._content == null) throw new Error('No content available')
      this._$content = cheerio.load(this._content)
      this._$content.find = select => this._$content(select)
      this._content = null
    }
    return this._$content
  }
  set $content (html) {
    this._$content = html
    if (!this._$content.find) html.find = select => this._$content(select)
    this._content = null
    this._words = null
  }
  get words () {
    if (this._words == null) {
      if (this._content == null && this._$content == null) throw new Error('no words for no content')
      this._words = this.site.countStoryWords(this)
    }
    return this._words
  }
  set words (num) {
    this._words = num
  }
}

module.exports = ChapterContent
