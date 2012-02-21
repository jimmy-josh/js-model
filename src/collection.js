;(function(Model) {
  var Collection = Model.Collection = function(array) {
    array = array || []

    this.length = 0
    this.models = []

    for (var i = 0, length = array.length; i < length; i++) {
      this.push(array[i])
    }
  }

  var methods = [
    // name      chainable?   enumerable?  updateLength?
    "every",       false,       true,         false,
    "filter",      true,        true,         false,
    "forEach",     false,       true,         false,
    "indexOf",     false,       false,        false,
    "lastIndexOf", false,       false,        false,
    "map",         false,       true,         false,
    "pop",         false,       false,        true,
    "push",        false,       false,        true,
    "reverse",     true,        false,        false,
    "shift",       false,       false,        true,
    "some",        false,       true,         false,
    "sort",        true,        false,        false,
    "splice",      true,        false,        true,
    "unshift",     false,       false,        true
  ]

  for (var i = 0; i < methods.length; i += 4) {
    (function(name, clone, enumerable, updateLength) {
      Collection.prototype[name] = function(callback, context) {
        var self = this
          , models = this.models
          , value

        if (enumerable) {
          // Ensure enumerable method callbacks are passed this collection as
          // as the third argument instead of the `this.models` array.
          value = models[name](function() {
            arguments[2] = self
            return callback.apply(this, arguments)
          }, context)
        } else {
          value = models[name].apply(models, arguments)
        }

        if (updateLength) this.length = this.models.length

        // Ensure appropriate methods return another collection instance.
        return clone ? this.clone(value) : value
      }
    })(methods[i], methods[i + 1], methods[i + 2], methods[i + 3])
  }

  Collection.prototype.add = function(model) {
    if (!~this.indexOf(model)) {
      var length = this.push(model)
      this.trigger("add", [model])
      return length
    }
  }

  Collection.prototype.at = function(index) {
    return this.models[index]
  }

  Collection.prototype.clone = function(collection) {
    return new this.constructor(collection)
  }

  Collection.prototype.detect = function(callback, context) {
    var i = 0
      , length = this.length
      , collection = this
      , model

    for (; i < length; i++) {
      model = this.at(i)
      if (callback.call(context, model, i, collection)) return model
    }
  }

  Collection.prototype.first = function() {
    return this.at(0)
  }

  Collection.prototype.last = function() {
    return this.at(this.length - 1)
  }

  Collection.prototype.pluck = function(attribute) {
    return this.map(function(model) {
      return model.attr(attribute)
    })
  }

  Collection.prototype.remove = function(model) {
    var index = this.indexOf(model)

    if (~index) {
      this.splice(index, 1)
      this.trigger("remove", [model])
      return this.length
    }
  }

  Collection.prototype.sortBy = function(attribute_or_func) {
    var is_func = Model.Utils.isFunction(attribute_or_func)
    var extract = function(model) {
      return attribute_or_func.call(model)
    }

    return this.sort(function(a, b) {
      var a_attr = is_func ? extract(a) : a.attr(attribute_or_func)
      var b_attr = is_func ? extract(b) : b.attr(attribute_or_func)

      if (a_attr < b_attr) {
        return -1
      } else if (a_attr > b_attr) {
        return 1
      } else {
        return 0
      }
    })
  }

  Collection.prototype.toArray = function() {
    return this.models.slice()
  }

  Collection.prototype.toJSON = function() {
    return this.map(function(model) {
      return model.toJSON()
    })
  }

  Model.Utils.extend(Model.Collection.prototype, Model.Callbacks)
})(Model);
