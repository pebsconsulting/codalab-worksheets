
var RunBundleBuilder = React.createClass({

  getInitialState: function() {
    return {
      bundleList: [],
    };
  },

  bundleToString: function(bundle) {
    return bundle.metadata.name + ' (' + bundle.uuid.substring(0, 8) + ')';
  },

  componentDidMount: function() {
    console.log('componentDidMount');
    $.ajax({
      url: '/api/worksheets/bundle_list/',
      data: {
        worksheet_uuid: this.props.ws.uuid
      },
      type: 'GET',
      success: function (data, status, jqXHR) {
        bundles = data.bundles;
        bundleList = []
        bundles.forEach(function(bundle) {
          bundleList.push(this.bundleToString(bundle));
        }.bind(this));
        console.log(bundleList);
        this.setState({bundleList: bundleList});
      }.bind(this),
      error: function (jqHXR, status, error) {
        alert(errorString);
      }.bind(this)
    });
  },

  popupBuilder: function() {
    console.log('popup');
    $('#run-bundle-builder-form').css('display', 'block');
  },

  buildRunBundle: function(e) {
    e.preventDefault();
    console.log(e.target)
    console.log('buildRunBundle');
  },
  
  render: function () {
    return (
      <div>
        <div id="abc">
          <div id="popupContact">
            <form id='run-bundle-builder-form' onSubmit={this.buildRunBundle}>
              <h4>Build Run Bundle</h4>
              <hr></hr>
              <input id="name" name="name" placeholder="Name" type="text"></input>
              <input id="email" name="email" placeholder="Email" type="text"></input>
              <textarea id="msg" name="message" placeholder="Message"></textarea>
              <button type="submit">Build</button>
            </form>
          </div>
        </div>
        <button id="popup" onClick={this.popupBuilder}>Build Run Bunddle</button>
      </div>
      );
  }
});
