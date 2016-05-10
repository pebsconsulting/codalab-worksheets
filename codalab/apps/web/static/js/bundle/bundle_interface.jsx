var Bundle = React.createClass({
    getInitialState: function() {
      return null;
    },

    componentWillMount: function() {
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
    },

    render: function() {
      //console.log('BundleDetailSidePanel.render');
      var bundle_info = this.state;
      if (bundle_info) {
        var fileBrowser = '';
        if (bundle_info.type == 'directory') {
          fileBrowser = (<FileBrowser
            bundle_uuid={this.state.uuid}
            ref={'file_browser'}
          />);
        }

        return (<div id="panel_content">
          {renderHeader(bundle_info, this.props.bundleMetadataChanged)}
          {renderDependencies(bundle_info)}
          {renderContents(bundle_info)}
          {fileBrowser}
          {renderMetadata(bundle_info, this.props.bundleMetadataChanged)}
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

function renderMetadata(bundle_info, bundleMetadataChanged) {
  /*
  In the current implementaiton, refreshWorksheet method of worksheet_content
  is passed in as bundleMetadataChanged and is just called in order to reflect
  changes made in the side-panel on the main page.
  TODO: The response object contains the uuid of the modified object.
        Use that to update the main view instead of refrsehing the
        entire worksheet.
  */
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
    if (bundle_info.edit_permission && editableMetadataFields && editableMetadataFields.indexOf(property) >= 0){
      metadata_list_html.push(<tr>
        <th>{property}</th>
        <td><BundleEditableField canEdit={true} fieldName={property} uuid={bundle_info.uuid} value={metadata[property]} onChange={bundleMetadataChanged} /></td>
      </tr>);
    }
    else{
      metadata_list_html.push(<tr>
        <th>{property}</th>
        <td><span>{metadata[property]}</span></td>
      </tr>);
    }
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
  var bundle_url = '/bundles/' + bundle_info.uuid;
  var bundle_download_url = "/rest/bundle/" + bundle_info.uuid + "/contents/blob/";
  var bundle_name;
  var bundle_description;
  if (bundle_info.metadata.name) {
    if (bundle_info.edit_permission) {
      bundle_name = <h3 className="bundle-name"><BundleEditableField canEdit={true} fieldName="name" uuid={bundle_info.uuid} value={bundle_info.metadata.name} onChange={bundleMetadataChanged} /></h3>;
      bundle_description = <h3 className="bundle-description">description: <BundleEditableField canEdit={true} fieldName="description" uuid={bundle_info.uuid} value={bundle_info.metadata.description} onChange={bundleMetadataChanged} /></h3>;
    } else {
      bundle_name = <h3 className="bundle-name">{bundle_info.metadata.name}</h3>;
      bundle_description = <h3 className="bundle-description"><b>description:</b> {bundle_info.metadata.description}</h3>;
    }
  }
  var bundle_state_class = 'bundle-state state-' + (bundle_info.state || 'ready');

  // Display basic information
  function createRow(key, value) {
    return (<tr>
      <th>{key}:</th>
      <td>{value}</td>
    </tr>);
  }
  var rows = [];
  rows.push(createRow('uuid', bundle_info.uuid));
  rows.push(createRow('owner', bundle_info.owner_name));
  rows.push(createRow('permissions', render_permissions(bundle_info)));
  if (bundle_info.bundle_type == 'run') {
    rows.push(createRow('command', bundle_info.command));
    rows.push(createRow('state', <span className={bundle_state_class}>{bundle_info.state}</span>));
  }

  return (<div>
    <div className="bundle-header">
      {bundle_name}
      <div className="bundle-links">
        <a href={bundle_download_url} className="bundle-download btn btn-default btn-sm" alt="Download Bundle">
          <span className="glyphicon glyphicon-download-alt"></span>
        </a>
      </div>
    </div>
    {bundle_description}
    <table className="bundle-meta table">
      <tbody>{rows}</tbody>
    </table>
  </div>);
}

function renderContents(bundle_info) {
  var stdout_html = '';
  if (bundle_info.stdout) {
    var stdout_url = '/rest/bundle/' + bundle_info.uuid + '/contents/blob/stdout';
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
    var stderr_url = '/rest/bundle/' + bundle_info.uuid + '/contents/blob/stderr';
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
