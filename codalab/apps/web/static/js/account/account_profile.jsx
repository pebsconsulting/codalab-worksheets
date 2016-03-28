var AccountProfile = React.createClass({
  mixins: [JsonApiResourceViewMixin],
  resourceType: 'users',
  render: function() {
    return <form className="account-profile-form">
      <AccountProfileField {...this.props} title="Username" fieldKey="user_name" />
      <AccountProfileField {...this.props} title="Email" fieldKey="email" readOnly />
      <AccountProfileField {...this.props} title="First Name" fieldKey="first_name" />
      <AccountProfileField {...this.props} title="Last Name" fieldKey="last_name" />
      <AccountProfileField {...this.props} title="Organization/Affiliation" fieldKey="affiliation" />
      <AccountProfileField {...this.props} title="Website URL" fieldKey="url" />
      <AccountProfileField {...this.props} title="Last Login" fieldKey="last_login" readOnly />
      <AccountProfileField {...this.props} title="Date Joined" fieldKey="date_joined" readOnly />
      <AccountProfileField {...this.props} title="Disk Quota (bytes)" fieldKey="disk_quota" readOnly />
      <AccountProfileField {...this.props} title="Disk Used (bytes)" fieldKey="disk_used" readOnly />
      <AccountProfileField {...this.props} title="Time Quota" fieldKey="time_quota" readOnly />
      <AccountProfileField {...this.props} title="Time Used" fieldKey="time_used" readOnly />
    </form>;
  }
});


var AccountProfileField = React.createClass({
  mixins: [JsonApiResourceViewMixin],
  resourceType: 'users',
  propTypes: {
    title: React.PropTypes.string.isRequired,
    fieldKey: React.PropTypes.string.isRequired,
    fieldType: React.PropTypes.string,
    readOnly: React.PropTypes.bool,
    writeOnly: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      readOnly: false,
      writeOnly: false,
      fieldType: "text"
    };
  },
  inputId: function() {
    return "account_profile_" + this.props.fieldKey;
  },
  handleKeyPress: function(event) {
    // Blur input on Enter
    if (event.charCode === 13) {
      $('#' + this.inputId()).blur();
    }
  },
  render: function() {
    var user = this.getResource();

    // Multiplex display element for read-only and editable fields.
    var fieldElement;
    if (this.props.readOnly) {
      fieldElement = <span>{user[this.props.fieldKey]}</span>;
    } else {

      var formStateIcon = <span></span>;
      if (this.state.jsonApiDirty) {
        if (this.state.jsonApiFailed) {
          formStateIcon = <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
        } else {
          formStateIcon = <span className="glyphicon glyphicon-ok" aria-hidden="true"></span>
        }
      }
      fieldElement = <div className="row">
        <div className="col-sm-10">
          <input
            id={this.inputId()}
            className="form-control"
            placeholder={this.props.title}
            type={this.props.fieldType}
            defaultValue={user[this.props.fieldKey]}
            onBlur={this.linkAttribute(this.props.fieldKey)}
            onKeyPress={this.handleKeyPress}
          />
        </div>
        <div className="col-sm-2">
          {formStateIcon}
        </div>
      </div>;
    }

    // Naively concatenate errors with spaces.
    var errorMessage = _.pluck(this.state.jsonApiErrors, 'detail').join(' ');


    return <div>
      <div className="form-group row ">
        <label htmlFor={this.inputId()}
               className="col-sm-4 form-control-label">
          {this.props.title}:
        </label>
        <div className="col-sm-8">
          <div>{fieldElement}</div>
          <div className="account-profile-error">{errorMessage}</div>
        </div>
      </div>
    </div>;
  }
});


// Bootstrap on the ID of the authenticated user
$.getJSON("/rest/user", function(response) {
  var store = new JsonApiDataStore();
  var user = store.sync(response);
  var dispatcher = new JsonApiDispatcher(store, {
    'users': '/rest/users/'
  });
  var profileView = React.render(<AccountProfile dispatcher={dispatcher} store={store} resourceId={user.id} />,
    document.getElementById('account_profile_container'));
  dispatcher.addView(profileView);
});
