$(document).ready () ->

  module("Backbone.Controller")

  class Controller extends Backbone.Controller
    routes: {
      "search/:query":              "search"
      "search/:query/p:page":       "search"
      "splat/*args/end":            "splat"
      "*first/complex-:part/*rest": "complex"
    },

    initialize: (options) ->
      @testing = options.testing

    search: (query, page) ->
      @query = query
      @page = page

    splat: (args) ->
      @args = args

    complex: (first, part, rest) ->
      @first = first
      @part = part
      @rest = rest

  controller = new Controller({testing: 101})

  Backbone.history.interval = 9
  Backbone.history.start()


  test "Controller: initialize", () ->
    equals(controller.testing, 101)

  asyncTest "Controller: routes (simple)", 2, () ->
    window.location.hash = 'search/news'
    setTimeout(() ->
      equals(controller.query, 'news')
      equals(controller.page, null)
      start()
    , 10)

  asyncTest "Controller: routes (two part)", 2, () ->
    window.location.hash = 'search/nyc/p10'
    setTimeout(() ->
      equals(controller.query, 'nyc')
      equals(controller.page, '10')
      start()
    , 10)

  asyncTest "Controller: routes (splats)", () ->
    window.location.hash = 'splat/long-list/of/splatted_99args/end'
    setTimeout(() ->
      equals(controller.args, 'long-list/of/splatted_99args')
      start()
    , 10)

  asyncTest "Controller: routes (complex)", 3, () ->
    window.location.hash = 'one/two/three/complex-part/four/five/six/seven'
    setTimeout(() ->
      equals(controller.first, 'one/two/three')
      equals(controller.part, 'part')
      equals(controller.rest, 'four/five/six/seven')
      start()
      window.location.hash = ''
    , 10)
