/**
 * Minimal Flux-like dispatcher class for JSON API views.
 * Has a single JsonApiDataStore and many views.
 * @class JsonApiDispatcher
 */
class JsonApiDispatcher {
  /**
   * @method constructor
   * @param {JsonApiDataStore} store Data store.
   * @param {object} endpoints Object mapping resource type to REST API endpoint.
   */
  constructor(store, endpoints) {
    this.store = store;
    this.views = [];
    this.endpoints = endpoints;
  }

  /**
   * Add view to broadcast new model changes to.
   * @param {React.Component} view React component that has JsonApiResourceViewMixin.
   */
  addView(view) {
    this.views.push(view);
  }

  /**
   * Sync an update with the server.
   * @method update
   * @param {object} obj The resource object.
   * @param {object} attributes Array of attributes to update (default: all attributes)
   * @return {object} jQuery Promise object for the JSON API call.
   */
  update(obj, attributes) {
    return $.ajax({
        method: 'PATCH',
        url: this.endpoints[obj._type] + obj.id,
        data: JSON.stringify(obj.serialize({attributes: attributes})),
        dataType: 'json',
        contentType: 'application/json',
        xhr: function() {
          // Hack for IE < 9
          return window.XMLHttpRequest == null || new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        }
      })
      .then(this.refresh.bind(this));
  }

  /**
   * Handle response from API call and refresh views.
   * @param {object} response JSON API response document.
   * @return {JsonApiDataStoreModel} New primary resource object parsed from
   * the response.
   */
  refresh(response) {
    var resource = this.store.sync(response);
    this.views.forEach(function(view) {
      // TODO(sckoo): traverse tree of components
      if (view.resourceType == resource._type) {
        view.forceUpdate();
      }
    });
    return resource;
  }
}


/**
 * React Component Mixin for a component that is bound to a specific
 * JSONAPI resource. The target resource must already be loaded into the store.
 *
 * Components that use this mixin should also have a `resourceType` field
 * defined on it, identifying the JSONAPI resource type.
 */
var JsonApiResourceViewMixin = {
  propTypes: {
    store: React.PropTypes.instanceOf(JsonApiDataStore).isRequired,
    dispatcher: React.PropTypes.instanceOf(JsonApiDispatcher).isRequired,
    resourceId: React.PropTypes.string.isRequired
  },

  /**
   * Fetch the target resource from the store.
   * @return {JsonApiDataStoreModel} Resource object.
   */
  getResource: function() {
    return this.props.store.find(this.resourceType, this.props.resourceId);
  },

  /**
   * Initialize this.state.jsonApiErrors to empty array.
   * @return {{jsonApiErrors: Array}}
   */
  getInitialState: function() {
    return {
      jsonApiErrors: [],
      jsonApiFailed: false
    };
  },

  /**
   * Set this.state.jsonApiErrors to 'errors' field in JSONAPI response
   * document, if any. If no JSON response, artificially generates an error
   * containing the HTTP status code and label.
   * Used as error handler for a jQuery ajax call.
   */
  _onFail: function(jqXHR, textStatus, errorThrown) {
    var errors;
    if (jqXHR.responseJSON && jqXHR.responseJSON.hasOwnProperty('errors')) {
      errors = jqXHR.responseJSON.errors;
    } else {
      errors = [{detail: textStatus + ': ' + errorThrown}]
    }
    this.setState({
      jsonApiErrors: errors,
      jsonApiFailed: true
    });
  },

  /**
   * Reset this.state.jsonApiErrors to empty array.
   * Used as success handler for a jQuery ajax call.
   */
  _onSuccess: function(data) {
    this.setState({
      jsonApiErrors: [],
      jsonApiFailed: false
    });
  },

  /**
   * Mark field as dirty/changed.
   * Used as always handler for a jQuery ajax call.
   */
  _onAlways: function(data) {
    this.setState({
      jsonApiDirty: true
    });
  },

  /**
   * Create event handler that links the value in the target element to an
   * attribute of this component's resource object. When the created handler
   * function is used as the `onChange` handler of an input element in React,
   * changes in the value will be passed to the dispatcher to be propagated
   * back to the server.
   * Empty values are interpreted to be null.
   * @param {string} key Resource attribute name.
   * @return {Function} React event handler for an element with a `value`
   * attribute.
   */
  linkAttribute: function(key) {
    return (function(event) {
      var resource = this.getResource();
      var value = event.target.value || null;
      if (resource[key] === value) return;
      resource[key] = value;
      this.props.dispatcher.update(resource, [key])
        .always(this._onAlways)
        .done(this._onSuccess)
        .fail(this._onFail);
    }).bind(this);
  }
};
