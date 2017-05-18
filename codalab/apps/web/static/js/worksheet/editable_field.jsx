var EditableField = React.createClass({
  propTypes: {
    value: React.PropTypes.any,
    method: React.PropTypes.string,
    url: React.PropTypes.string.isRequired,
    buildParams: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func,
    canEdit: React.PropTypes.bool.isRequired
  },

  defaultProps: {
    method: 'POST'
  },

  componentDidMount: function() {
    $(this.refs.field.getDOMNode()).editable({
      send: 'always',
      type: 'text',
      mode: 'inline',
      value: this.props.value,
      url: this.props.url,
      emptytext: $('<div/>').text('<none>').html(),
      ajaxOptions: {
        method: this.props.method,
        contentType: 'application/json; charset=UTF-8'
      },
      params: function(params) {
        return JSON.stringify(this.props.buildParams(params));
      }.bind(this),
      success: function(response, newValue) {
        if (response.exception) {
          return response.exception;
        }
        if (this.props.onChange !== undefined) {
          this.props.onChange();
        }
      }.bind(this)
    }).on('click', function() {
      // Hack to put the right input into the field, since the jQuery plugin doesn't update it properly
      // in response to new values.
      if (!this.props.canEdit) return;
      $(this.refs.field.getDOMNode()).data('editable').input.value2input(this.props.value);
    }.bind(this));
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.value !== this.props.value;
  },

  componentDidUpdate: function() {
    $(this.refs.field.getDOMNode()).editable('setValue', this.props.value)
    $(this.refs.field.getDOMNode()).editable('option', 'disabled', this.props.canEdit === false);
  },
  render: function () {
    return (
      <a href="#" ref='field'></a>
    );
  }
});

var WorksheetEditableField = React.createClass({
  propTypes: {
    uuid: React.PropTypes.string,
    fieldName: React.PropTypes.string
  },
  buildParams: function(params) {
    var payload = {
      data: [{
        id: this.props.uuid,
        type: 'worksheets',
        attributes: {},
      }]
    };
    payload.data[0].attributes[this.props.fieldName] = params.value;
    return payload;
  },
  render: function () {
    return (
      <EditableField
        {...this.props}
        url="/rest/worksheets"
        method="PATCH"
        buildParams={this.buildParams} />
    );
  }
});

var BundleEditableField = React.createClass({
  propTypes: {
    uuid: React.PropTypes.string.isRequired,
    fieldName: React.PropTypes.string.isRequired,
    dataType: React.PropTypes.string,
  },
  defaultProps: {
    dataType: 'string',
  },
  buildParams: function(params) {
    var metadataUpdate = {};
    metadataUpdate[this.props.fieldName] = serializeFormat(params.value, this.props.dataType);
    return {
      data: [{
        id: this.props.uuid,
        type: 'bundles',
        attributes: {
          metadata: metadataUpdate
        }
      }]
    };
  },
  render: function () {
    return (
      <EditableField
        {...this.props}
        value={renderFormat(this.props.value, this.props.dataType)}
        url={"/rest/bundles"}
        method="PATCH"
        buildParams={this.buildParams} />
    );
  }
});
