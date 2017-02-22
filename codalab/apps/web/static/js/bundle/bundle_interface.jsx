var Bundle = React.createClass({
    getInitialState: function() {
      return null;
    },

    refreshBundle: function() {
      var url = this.props.bundle_uuid ? "/rest/api/bundles/" + this.props.bundle_uuid + "/" : "/rest/api" + document.location.pathname;
      $.ajax({
        type: "GET",
        //  /api/bundles/0x706<...>d5b66e
        url: url,
        dataType: 'json',
        cache: false,
        success: function(data) {
            if(this.isMounted()){
              this.setState(data);
            }
            $("#bundle-message").hide().removeClass('alert-danger alert');
        }.bind(this),
        error: function(xhr, status, err) {
            $("#bundle-message").html(xhr.responseText).addClass('alert-danger alert');
            $("#bundle-message").show();
            $('#bundle-content').hide();
        }.bind(this)
      });
      if (this.refs.file_browser) {
        this.refs.file_browser.updateFileBrowser()
      }
    },

    componentWillMount: function() {
      if (!this.props.bundle_uuid) {
        // if it is the bundle detail page, not the bundle detail side panel
        this.refreshBundle();
        $('.page-header').hide();
      }
    },

    render: function() {
      var bundle_info = this.state;
      if (bundle_info) {
        var fileBrowser = '';
        if (bundle_info.type == 'directory') {
          fileBrowser = (<FileBrowser
            bundle_uuid={this.state.uuid}
            ref={'file_browser'}
          />);
        }
        // if it is the bundle detail side panel, it should call refreshWorksheet, which is passed in as this.props.bundleMetadataChanged.
        var bundleMetadataChanged = this.props.bundle_uuid ? this.props.bundleMetadataChanged : this.refreshBundle
        return (<div id="panel_content">
          {renderHeader(bundle_info, bundleMetadataChanged)}
          {renderDependencies(bundle_info)}
          {renderContents(bundle_info)}
          {fileBrowser}
          {renderMetadata(bundle_info, bundleMetadataChanged)}
          {renderHostWorksheets(bundle_info)}
        </div>);
      } else {
        return null;
      }
    }
});

function renderDependencies(bundle_info) {
  var dependencies_table = [];
  if (!bundle_info.dependencies || bundle_info.dependencies.length == 0) return <div/>;

  bundle_info.dependencies.forEach(function(dep, i) {
    var dep_bundle_url = "/bundles/" + dep.parent_uuid;
    dependencies_table.push(<tr>
      <td>
          {dep.child_path}
      </td>
      <td>
          &rarr; {dep.parent_name}(<a href={dep_bundle_url}>{shorten_uuid(dep.parent_uuid)}</a>){dep.parent_path ? '/' + dep.parent_path : ''}
      </td>
    </tr>);
  });

  return (<div>
    <h4>dependencies</h4>
    <table className="bundle-meta table">
      <tbody>{dependencies_table}</tbody>
    </table>
  </div>);
}

function createRow(bundle_info, bundleMetadataChanged, key, value) {
  // Return a row corresponding to showing
  //   key: value
  // which can be edited.
  var editableMetadataFields = bundle_info.editable_metadata_fields;
  if (bundle_info.edit_permission && editableMetadataFields && editableMetadataFields.indexOf(key) != -1) {
    return (<tr>
      <th><span className="editable-key">{key}</span></th>
      <td><BundleEditableField canEdit={true} fieldName={key} uuid={bundle_info.uuid} value={value} onChange={bundleMetadataChanged} /></td>
    </tr>);
  }
  else {
    return (<tr>
      <th><span>{key}</span></th>
      <td><span>{typeof(value) === 'boolean' ? String(value) : value}</span></td>
    </tr>);
  }
}

function renderMetadata(bundle_info, bundleMetadataChanged) {
  var metadata = bundle_info.metadata;
  var metadata_list_html = [];

  // Sort the metadata by key.
  var keys = [];
  var editableMetadataFields = bundle_info.editable_metadata_fields;
  for (var property in metadata) {
    if (metadata.hasOwnProperty(property))
      keys.push(property);
  }
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    var property = keys[i];
    metadata_list_html.push(createRow(bundle_info, bundleMetadataChanged, property, metadata[property]));
  }

  return (<div>
    <div className="collapsible-header"><span><p>metadata &#x25BE;</p></span></div>
    <div className="collapsible-content">
      <table className="bundle-meta table">
        <tbody>{metadata_list_html}</tbody>
      </table>
    </div>
  </div>);
}

function renderHeader(bundle_info, bundleMetadataChanged) {
  var bundle_download_url = "/rest/bundles/" + bundle_info.uuid + "/contents/blob/";
  var bundle_state_class = 'bundle-state state-' + (bundle_info.state || 'ready');

  // Display basic information
  var rows = [];
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'uuid', bundle_info.uuid));
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'name', bundle_info.metadata.name));
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'description', bundle_info.metadata.description));
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'owner', bundle_info.owner_name));
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'permissions', render_permissions(bundle_info)));
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'created', bundle_info.metadata.created));
  rows.push(createRow(bundle_info, bundleMetadataChanged, 'data_size', bundle_info.metadata.data_size));
  if (bundle_info.bundle_type == 'run') {
    rows.push(createRow(bundle_info, bundleMetadataChanged, 'command', bundle_info.command));
  }
  if (bundle_info.metadata.failure_message) {
    rows.push(createRow(bundle_info, bundleMetadataChanged, 'failure_message', bundle_info.metadata.failure_message));
  }
  if (bundle_info.bundle_type == 'run') {
    if (bundle_info.state == 'running' && bundle_info.metadata.run_status != 'Running')
      rows.push(createRow(bundle_info, bundleMetadataChanged, 'run_status', bundle_info.metadata.run_status));
    rows.push(createRow(bundle_info, bundleMetadataChanged, 'time', bundle_info.metadata.time));
  }

  rows.push(createRow(bundle_info, bundleMetadataChanged, 'state', <span className={bundle_state_class}>{bundle_info.state}</span>));
  var bundle_header;
  if (document.getElementById('bundle-content')) {
    var bundle_name = (<h3 className="bundle-name">{bundle_info.metadata.name}</h3>);
    bundle_header = (
        <div className="bundle-header">
          {bundle_name}
          <div className="bundle-links">
            <a href={bundle_download_url} className="bundle-download btn btn-default btn-sm" alt="Download Bundle">
              <span className="glyphicon glyphicon-download-alt"></span>
            </a>
          </div>
        </div>
    )
  }
  return (
  <div>
    {bundle_header}
    <table className="bundle-meta table">
      <tbody>
        {rows.map(function(elem) {return elem;})}
        <tr>
          <th><span>download</span></th>
          <td>
            <div className="bundle-links">
              <a href={bundle_download_url} className="bundle-download btn btn-default btn-sm" alt="Download Bundle">
                <span className="glyphicon glyphicon-download-alt"></span>
              </a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>);
}

function renderContents(bundle_info) {
  var stdout_html = '';
  if (bundle_info.stdout) {
    var stdout_url = '/rest/bundles/' + bundle_info.uuid + '/contents/blob/stdout';
    stdout_html = (<div>
      <span><a href={stdout_url} target="_blank">stdout</a></span>
      &nbsp;
      <span className="collapsible-header">&#x25BE;</span>
      <div className="collapsible-content bundle-meta">
        <pre>{bundle_info.stdout}</pre>
      </div>
    </div>);
  }

  var stderr_html = '';
  if (bundle_info.stderr) {
    var stderr_url = '/rest/bundles/' + bundle_info.uuid + '/contents/blob/stderr';
    stderr_html = (<div>
      <span><a href={stderr_url} target="_blank">stderr</a></span>
      &nbsp;
      <span className="collapsible-header">&#x25BE;</span>
      <div className="collapsible-content bundle-meta">
        <pre>{bundle_info.stderr}</pre>
      </div>
    </div>);
  }

  var contents_html = '';
  if (bundle_info.file_contents) {
    contents_html = (<div>
      <div className="collapsible-header"><span><p>contents &#x25BE;</p></span></div>
      <div className="collapsible-content bundle-meta">
        <pre>{bundle_info.file_contents}</pre>
      </div>
    </div>);
  }

  return (<div>
    {contents_html}
    {stdout_html}
    {stderr_html}
  </div>);
}

function renderHostWorksheets(bundle_info) {
  if (!bundle_info.host_worksheets) return <div/>;

  var host_worksheets_rows = [];
  bundle_info.host_worksheets.forEach(function(worksheet) {
    var host_worksheets_url = "/worksheets/" + worksheet.uuid;
    host_worksheets_rows.push(<tr>
      <td>
          <a href={host_worksheets_url}>{worksheet.name}</a>
      </td>
    </tr>);
  });

  return (<div>
    <div className="collapsible-header"><span><p>host worksheets &#x25BE;</p></span></div>
    <div className="collapsible-content">
      <div className="host-worksheets-table">
        <table className="bundle-meta table">
          <tbody>
              {host_worksheets_rows}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}

if (document.getElementById('bundle-content')) {
  // Bundle is also used by WorksheetSidePanel, whereas bundle-content only exists on the bundle page
  React.render(<Bundle />, document.getElementById('bundle-content'));
}
