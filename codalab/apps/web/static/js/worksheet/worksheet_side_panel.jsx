/*
Shows the side panel which contains information about the current bundle or
worksheet (with the focus).
*/

var WorksheetSidePanel = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentDidMount: function(e) {
        var self = this;
        $('#dragbar_vertical').mousedown(function(e) {
            self.resizePanel(e);
        });
        $(document).mouseup(function(e) {
            $(this).unbind('mousemove');
        });
        $(window).resize(function(e) {
            self.resetPanel();
        });
        $(document.body).on('click', '.collapsible-header' ,function(){
          $header = $(this);
          $content = $header.next();
          $content.slideToggle(150, function () {
            $header.html(function () {
              return $content.is(":visible") ? ($header.html()).replace(/\u25B8/, '\u25BE') : ($header.html()).replace(/\u25BE/, '\u25B8');
            });
          });
        });
    },

    componentDidUpdate: function() {
        var __innerFetchExtra = function() {
          //console.log('__innerFetchExtra');
          if (this.refs.hasOwnProperty('bundle_info_side_panel'))
            this.refs.bundle_info_side_panel.fetchExtra();
        }
        if (this.debouncedFetchExtra === undefined)
            this.debouncedFetchExtra = _.debounce(__innerFetchExtra, 200).bind(this);
        this.debouncedFetchExtra();
    },

    getFocus: function() {
        // Return the state to show on the side panel
        var info = this.props.ws.info;
        if (!info) return null;
        if (this.props.focusIndex == -1)  // Not focus on anything, show worksheet
          return info;
        return info.items[this.props.focusIndex];
    },

    // What kind of thing is it?
    isFocusWorksheet: function(focus) {
      return focus.mode === undefined || focus.mode == 'worksheet' || focus.mode == 'wsearch';
    },
    isFocusMarkup: function(focus) {
      // If search and didn't return bundles, then count as markup
      return focus.mode == 'markup' || (focus.mode == 'search' && (!focus.interpreted.items[0] || focus.interpreted.items[0].bundle_info === undefined));
    },
    isFocusBundle: function(focus) {
      return !this.isFocusWorksheet(focus) && !this.isFocusMarkup(focus);
    },
    getBundleInfo: function(focus) {
      if (focus.mode == 'table')  // Drill down into row of table
          return this.props.subFocusIndex != -1 ? focus.bundle_info[this.props.subFocusIndex] : null;
      else if (focus.mode == 'search')
          return this.props.subFocusIndex != -1 ? focus.interpreted.items[0].bundle_info[this.props.subFocusIndex] : null;
      else
          return focus.bundle_info;
    },
    getWorksheetInfo: function(focus) {
      if (focus.mode == 'worksheet')
        return focus.subworksheet_info;
      else if (focus.mode == 'wsearch') {
        if (this.props.subFocusIndex == -1)
          return null;
        var item = focus.interpreted.items[this.props.subFocusIndex];
        return item ? item.subworksheet_info : null;
      }
      else
        return focus;
    },

    resizePanel: function(e) {
        e.preventDefault();
        $(document).mousemove(function(e) {
            var windowWidth = $(window).width();
            var panelWidth = windowWidth - e.pageX;
            var panelWidthPercentage = (windowWidth - e.pageX) / windowWidth * 100;
            if (240 < panelWidth && panelWidthPercentage < 55) {
                $('.ws-container').css('width', e.pageX);
                $('.ws-panel').css('width', panelWidthPercentage + '%');
                $('#dragbar_vertical').css('right', panelWidthPercentage + '%');
            }
        });
    },
    resetPanel: function() {
        var windowWidth = $(window).width();
        if (windowWidth < 768) {
            $('.ws-container').removeAttr('style');
        } else {
            var panelWidth = parseInt($('.ws-panel').css('width'));
            var containerWidth = windowWidth - panelWidth;
            $('.ws-container').css('width', containerWidth);
        }
    },

    render: function() {
        //console.log('WorksheetSidePanel.render');

        var bundle_uploader = <BundleUploader
          ws={this.props.ws}
          refreshWorksheet={this.props.bundleMetadataChanged}
        />;

        var run_bundle_builder = <RunBundleBuilder
          ws={this.props.ws}
          escCount={this.props.escCount}
        />;

        var new_worksheet = <NewWorksheet
          escCount={this.props.escCount}
          userInfo={this.props.userInfo}
        />;

        var focus = this.getFocus();
        var side_panel_details = '';
        if (focus) {
          if (this.isFocusWorksheet(focus)) {
            // Show worksheet (either main worksheet or subworksheet)
            var worksheet_info = this.getWorksheetInfo(focus);

            side_panel_details = <WorksheetDetailSidePanel
                                   key={'ws' + this.props.focusIndex}
                                   worksheet_info={worksheet_info}
                                   ref="worksheet_info_side_panel"
                                 />;
          } else if (this.isFocusMarkup(focus)) {
            // Show nothing (maybe later show markdown just for fun?)
          } else if (this.isFocusBundle(focus)) {
            // Show bundle (either full bundle or row in table)
            var bundle_info = this.getBundleInfo(focus);
            if (bundle_info) {
              side_panel_details = <BundleDetailSidePanel
                                     key={'table' + this.props.focusIndex + ',' + this.props.subFocusIndex}
                                     bundle_info={bundle_info}
                                     ref="bundle_info_side_panel"
                                     bundleMetadataChanged={this.props.bundleMetadataChanged}
                                   />;
            }
          } else {
            console.error('Unknown mode: ' + focus.mode);
          }
        }

        return (
          <div className="ws-panel">
            <div className='ws-button-group'>
              {bundle_uploader}
              {run_bundle_builder}
              {new_worksheet}
            </div>
              {side_panel_details}
          </div>
        );
    }
});

////////////////////////////////////////////////////////////

// When selecting a worksheet.
var WorksheetDetailSidePanel = React.createClass({
    getInitialState: function() {
        return { };
    },

    render: function() {
      // Select the current worksheet or the subworksheet.
      var worksheet = this.props.worksheet_info;
      if (!worksheet) return <div />;

      // Show brief summary of contents.
      var rows = [];
      if (worksheet.items) {
        worksheet.items.forEach(function(item) {
          if (item.bundle_info) {
            // Show bundle
            var bundle_infos = item.bundle_info;
            if (!(bundle_infos instanceof Array))
              bundle_infos = [bundle_infos];

            bundle_infos.forEach(function(b) {
              var url = "/bundles/" + b.uuid;
              var short_uuid = shorten_uuid(b.uuid);
              rows.push(<tr>
                <td>{b.bundle_type}</td>
                <td><a href={url} target="_blank">{b.metadata.name}({short_uuid})</a></td>
              </tr>);
            });
          } else if (item.mode == 'worksheet') {
            // Show worksheet
            var info = item.subworksheet_info;
            var title = info.title || info.name;
            var url = '/worksheets/' + info.uuid;
            rows.push(<tr>
              <td>worksheet</td>
              <td><a href={url} target="_blank">{title}</a></td>
            </tr>);
          }
        });
      }

      var bundles_html = (
        <div className="bundles-table">
            <table className="bundle-meta table">
                <thead>
                  <tr>
                    <th>type</th>
                    <th>name</th>
                  </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
            </table>
        </div>
      );

      // TODO: Allow editing of worksheet metadata from side panel.
      return (
          <div id="panel_content">
              <h4 className="ws-title"><WorksheetEditableField canEdit={false} fieldName="title" value={worksheet.title} uuid={worksheet.uuid} /></h4>
              <table className="bundle-meta table">
                <tr><th>name</th><td><WorksheetEditableField canEdit={false} fieldName="name" value={worksheet.name} uuid={worksheet.uuid} /></td></tr>
                <tr><th>uuid</th><td>{worksheet.uuid}</td></tr>
                <tr><th>owner</th><td>{worksheet.owner_name}</td></tr>
                <tr><th>permissions</th><td>{render_permissions(worksheet)}</td></tr>
              </table>
              {bundles_html}
          </div>
      );
    }
});

////////////////////////////////////////////////////////////

// When selecting a bundle.
// props:
// - bundle_info: contains information about the bundle to render
var BundleDetailSidePanel = React.createClass({
    getInitialState: function() {
      return this.props.bundle_info;
    },

    fetchExtra: function() {
      // Fetch detailed information about this bundle.
      var bundle_info = this.state;
      //console.log('BundleDetailSidePanel.fetchExtra', bundle_info.uuid);
      $.ajax({
          type: "GET",
          url: "/rest/api/bundles/" + bundle_info.uuid + "/",
          dataType: 'json',
          cache: false,
          success: function(data) {
              //console.log("BundleDetailSidePanel.fetchExtra success: " + bundle_info.uuid);
              if (this.isMounted()) {
                  this.setState(data);
                  if (this.refs.hasOwnProperty('file_browser'))
                    this.refs.file_browser.updateFileBrowser('');
              }
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(xhr.responseText);
          }.bind(this)
      });
    },

    render: function() {
      //console.log('BundleDetailSidePanel.render');
      var bundle_info = this.state;

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
  var bundle_download_url = "/rest/bundles/" + bundle_info.uuid + "/contents/blob/";
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
      {bundle_description}
    </div>
    <table className="bundle-meta table">
      <tbody>{rows}</tbody>
    </table>
    <div className="bundle-links">
      <a href={bundle_download_url} className="bundle-download btn btn-default btn-sm" alt="Download Bundle">
        <span className="glyphicon glyphicon-download-alt"></span>
      </a>
    </div>
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

////////////////////////////////////////////////////////////
// FileBrowser

var FileBrowser = React.createClass({
    getInitialState: function() {
      return {
        currentWorkingDirectory: '',
        fileBrowserData: {},
      };
    },

    componentDidMount: function(nextProps) {
      this.updateFileBrowser('');
    },

    updateFileBrowser: function(folder_path) {
      if (folder_path == '..') {  // Go to parent directory
        folder_path = this.state.currentWorkingDirectory.substring(0, this.state.currentWorkingDirectory.lastIndexOf('/'));
      }
      else if (this.state.currentWorkingDirectory != '') {
        if (folder_path != '') {
          folder_path = this.state.currentWorkingDirectory + "/" + folder_path;
        } else {
          folder_path = this.state.currentWorkingDirectory;
        }
      }
      this.setState({"currentWorkingDirectory": folder_path});

      var url = '/rest/api/bundles/content/' + this.props.bundle_uuid + '/' + folder_path + '/';
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        cache: false,
        success: function(data) {
          if (this.isMounted())
            this.setState({'fileBrowserData': data});
          }.bind(this),
        error: function(xhr, status, err) {
          $("#bundle-message").html(xhr.responseText).addClass('alert-danger alert');
          $('.bundle-file-view-container').hide();
        }.bind(this)
      });
    },

    render: function() {
        var items = [];
        var file_browser;
        if (this.state.fileBrowserData.contents) {
          // Parent directory (..)
          if (this.state.currentWorkingDirectory) {
            items.push(<FileBrowserItem key=".." index=".."type=".." updateFileBrowser={this.updateFileBrowser} currentWorkingDirectory={this.state.currentWorkingDirectory} />);
          }

          // Sort by name
          var entities = this.state.fileBrowserData.contents;
          entities.sort(function(a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return +1;
            return 0;
          });
          var self = this;

          // Show directories
          entities.forEach(function(item) {
            if (item.type == 'directory')
              items.push(<FileBrowserItem
                bundle_uuid={self.props.bundle_uuid}
                bundle_name={self.props.bundle_name}
                key={item.name}
                index={item.name}
                type={item.type}
                updateFileBrowser={self.updateFileBrowser}
                currentWorkingDirectory={self.state.currentWorkingDirectory}
                hasCheckbox={self.props.hasCheckbox}
                handleCheckbox={self.props.handleCheckbox}
              />);
          });

          // Show files
          entities.forEach(function(item) {
            if (item.type != 'directory')
              items.push(<FileBrowserItem
                bundle_uuid={self.props.bundle_uuid}
                bundle_name={self.props.bundle_name}
                key={item.name}
                index={item.name}
                type={item.type}
                size={item.size}
                size_str={item.size_str}
                link={item.link}
                updateFileBrowser={self.updateFileBrowser}
                currentWorkingDirectory={self.state.currentWorkingDirectory}
                hasCheckbox={self.props.hasCheckbox}
                handleCheckbox={self.props.handleCheckbox}
              />);
          });

          file_browser = (
            <table className="file-browser-table">
              <tbody>{items}</tbody>
            </table>
          );
        } else {
          file_browser = (<b>(no files)</b>);
        }
        var bread_crumbs = (<FileBrowserBreadCrumbs
            updateFileBrowser={this.updateFileBrowser}
            currentWorkingDirectory={this.state.currentWorkingDirectory}/>);
        var content_class_name = this.props.startCollapsed ? "collapsible-content-collapsed" : "collapsible-content";
        var arrow = this.props.startCollapsed ? <span className='file-browser-arrow'>&#x25B8;</span> : <span className='file-browser-arrow'>&#x25BE;</span>;
        var header, checkbox;
        // this.props.hasCheckbox is true in run_bundle_builder for the user to select bundle depedency
        // In other cases, it is false
        if (this.props.hasCheckbox) {
          var url = "/bundles/" + this.props.bundle_uuid;
          var short_uuid = shorten_uuid(this.props.bundle_uuid);
          checkbox = (<input
            type="checkbox"
            className="run-bundle-check-box"
            onChange={this.props.handleCheckbox.bind(this, this.props.bundle_uuid, this.props.bundle_name, '')}
            />);
          header = (
            <div className="collapsible-header inline-block">
              <a href={url} target="_blank">{this.props.bundle_name}({short_uuid})</a>
              &nbsp;{arrow}
            </div>);
          bread_crumbs = null;
        } else {
          header = (<div className="collapsible-header"><span><p>contents {arrow}</p></span></div>);
          checkbox = null
        }
        return (<div>
          {checkbox}
          {header}
          <div className={content_class_name}>
            <div className="panel panel-default">
                {bread_crumbs}
                <div className="panel-body">
                  {file_browser}
                </div>
            </div>
          </div>
        </div>);
    }
});

var FileBrowserBreadCrumbs = React.createClass({
    breadCrumbClicked: function(path) {
      this.props.updateFileBrowser(path);
    },
    render: function() {
      var links = [];
      var splitDirs = this.props.currentWorkingDirectory.split('/');
      var currentDirectory = '';

      // Generate list of breadcrumbs separated by ' / '
      for (var i=0; i < splitDirs.length; i++) {
        if (i > 0)
          currentDirectory += '/';
        currentDirectory += splitDirs[i];
        links.push(<span key={splitDirs[i]} index={splitDirs[i]} onClick={this.breadCrumbClicked.bind(null, currentDirectory)}> / {splitDirs[i]}</span>);
      }

      return <div className="panel-heading">{links}</div>;
    }
});

var FileBrowserItem = React.createClass({
    browseToFolder: function(type) {
        this.props.updateFileBrowser(this.props.index);
    },
    render: function() {
        var size = '';
        var file_location = '';
        if (this.props.currentWorkingDirectory) {
          file_location = this.props.currentWorkingDirectory + '/' + this.props.index;
        } else {
          file_location = this.props.index;
        }
        if (this.props.hasOwnProperty('size_str'))
          size = this.props['size_str'];
        // this.props.hasCheckbox is true in run_bundle_builder for the user to select bundle depedency
        // otherwise, it is always false
        var checkbox = this.props.hasCheckbox ? (<input
          className="run-bundle-check-box"
          type="checkbox"
          onChange={this.props.handleCheckbox.bind(this, this.props.bundle_uuid, this.props.bundle_name, file_location)}
        />) : null;
        var item;
        if (this.props.type == 'directory' || this.props.type == '..') {
          item = (
            <span className={this.props.type} onClick={this.browseToFolder}>
                <span className="glyphicon-folder-open glyphicon" alt="More"></span>
                <a target="_blank">{this.props.index}</a>
                <span className="pull-right">{size}</span>
            </span>
          );
        } else if (this.props.type == 'file') {
          var file_link = '/rest/bundles/' + this.props.bundle_uuid + '/contents/blob/' + encodeURIComponent(file_location);
          item = (
            <span className={this.props.type}>
                <span className="glyphicon-file glyphicon" alt="More"></span>
                <a href={file_link} target="_blank">{this.props.index}</a>
                <span className="pull-right">{size}</span>
            </span>
          );
        } else if (this.props.type == 'link') {
          item = (
            <div className={this.props.type}>
                <span className="glyphicon-file glyphicon"></span>
                {this.props.index + ' -> ' + this.props.link}
            </div>
          );
        }
        
        return (
          <tr>
            <td>
              {checkbox}
              {item}
            </td>
          </tr>
        )
    }
});
