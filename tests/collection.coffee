$(document).ready ->

  module("Backbone.Collection")

  window.lastRequest = null

  class Backbone.sync
    constructor: (others...) ->
      window.lastRequest = others

  setup = () ->
    a = new Backbone.Model({id: 3, label: 'a'})
    b = new Backbone.Model({id: 2, label: 'b'})
    c = new Backbone.Model({id: 1, label: 'c'})
    d = new Backbone.Model({id: 0, label: 'd'})
    return [new Backbone.Collection([a,b,c,d]), [a, b, c, d]]

  test "Collection: new and sort", () ->
    [col, [a, b, c, d]] = setup()
    equals(col.first(), a, "a should be first")
    equals(col.last(), d, "d should be last")
    col.comparator = (model) -> model.id
    col.sort()
    equals(col.first(), d, "d should be first")
    equals(col.last(), a, "a should be last")
    equals(col.length, 4)

  test "Collection: get, getByCid", () ->
    [col, [a, b, c, d]] = setup()
    equals(col.get(0), d)
    equals(col.get(2), b)
    equals(col.getByCid(col.first().cid), col.first())

  test "Collection: update index when id changes", () ->
    [col, [a, b, c, d]] = setup()
    col = new Backbone.Collection()
    col.add([
      {id : 0, name : 'one'},
      {id : 1, name : 'two'}
    ])
    one = col.get(0)
    equals(one.get('name'), 'one')
    one.set({id : 101})
    equals(col.get(0), null)
    equals(col.get(101).get('name'), 'one')

  test "Collection: at", () ->
    [col, [a, b, c, d]] = setup()
    equals(col.at(2), c)

  test "Collection: pluck", () ->
    [col, [a, b, c, d]] = setup()
    equals(col.pluck('label').join(' '), 'a b c d')

  test "Collection: add", () ->
    [col, [a, b, c, d]] = setup()
    added = opts = null
    col.bind('add', (model, collection, options) ->
      added = model.get('label')
      opts = options
    )
    e = new Backbone.Model({id: 10, label : 'e'})
    col.add(e, {amazing: true})
    equals(added, 'e')
    equals(col.length, 5)
    equals(col.last(), e)
    ok(opts.amazing)

  test "Collection: remove", () ->
    [col, [a, b, c, d]] = setup()
    removed = null
    col.bind('remove', (model) ->
      removed = model.get('label')
    )
    col.remove(d)
    equals(removed, 'd')
    equals(col.length, 3)
    equals(col.first(), a)

  test "Collection: remove in multiple collections", () ->
    [col, [a, b, c, d]] = setup()
    modelData =
      id : 5
      title : 'Othello'

    passed = false
    e = new Backbone.Model(modelData)
    f = new Backbone.Model(modelData)
    f.bind('remove', () ->
      passed = true
    )
    colE = new Backbone.Collection([e])
    colF = new Backbone.Collection([f])
    ok(e != f)
    ok(colE.length is 1)
    ok(colF.length is 1)
    colE.remove(e)
    equals(passed, false)
    ok(colE.length is 0)
    colF.remove(e)
    ok(colF.length is 0)
    equals(passed, true)

  test "Collection: fetch", () ->
    [col, [a, b, c, d]] = setup()
    col.fetch()
    equals(lastRequest[0], 'read')
    equals(lastRequest[1], col)

  test "Collection: create", () ->
    [col, [a, b, c, d]] = setup()
    model = col.create({label: 'f'})
    equals(lastRequest[0], 'create')
    equals(lastRequest[1], model)
    equals(model.get('label'), 'f')
    equals(model.collection, col)

  test "collection: initialize", () ->
    class Collection extends Backbone.Collection
      initialize: () ->
        @one = 1

    coll = new Collection()
    equals(coll.one, 1)

  test "Collection: toJSON", () ->
    [col, [a, b, c, d]] = setup()
    equals(JSON.stringify(col),
           '[{"id":3,"label":"a"},{"id":2,"label":"b"},{"id":1,"label":"c"},{"id":0,"label":"d"}]')

  test "Collection: Underscore methods", () ->
    [col, [a, b, c, d]] = setup()
    equals(col.map((model) -> model.get('label')).join(' '), 'a b c d')
    equals(col.any((model) -> model.id is 100), false)
    equals(col.any((model) -> model.id is 0), true)
    equals(col.indexOf(b), 1)
    equals(col.size(), 4)
    equals(col.rest().length, 3)
    ok(!_.include(col.rest()), a)
    ok(!_.include(col.rest()), d)
    ok(!col.isEmpty())
    ok(!_.include(col.without(d)), d)
    equals(col.max((model) -> model.id).id, 3)
    equals(col.min((model) -> model.id).id, 0)
    same(col.chain()
            .filter((o) -> o.id % 2 is 0)
            .map((o) -> o.id * 2)
            .value(),
         [4, 0])

  test "Collection: refresh", () ->
    [col, [a, b, c, d]] = setup()
    refreshed = 0
    models = col.models
    col.bind('refresh', () -> refreshed += 1)
    col.refresh([])
    equals(refreshed, 1)
    equals(col.length, 0)
    equals(col.last()?, false)
    col.refresh(models)
    equals(refreshed, 2)
    equals(col.length, 4)
    equals(col.last(), d)
    col.refresh(_.map(models, (m) -> m.attributes ))
    equals(refreshed, 3)
    equals(col.length, 4)
    ok(col.last() isnt a)
    ok(_.isEqual(col.last().attributes, d.attributes))
