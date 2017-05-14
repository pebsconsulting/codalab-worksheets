
var FileBrowser = React.createClass({
    getInitialState: function() {
      return {
        currentWorkingDirectory: '',
        fileBrowserData: {},
        // FileBrowser has a collapsible-header that can show/hide the content of FileBrowser.
        // isVisible keeps track of whether the content is visible now. If isVisible is false, FileBrowser is collapsed. Vice versa.
        isVisible: false
      };
    },

    componentWillReceiveProps: function(nextProps) {
      if (nextProps.isRunBundleUIVisible === false && this.state.isVisible) {
        this.setState({isVisible: false});
        this.getDOMNode().getElementsByClassName('file-browser-arrow')[0].click();
      }
    },

    componentWillMount: function() {
      if (!this.props.startCollapsed) {
        this.setState({isVisible: true});
        this.updateFileBrowser('');
      }
    },

    updateFileBrowserWhenDrilledIn: function() {
      if (!this.state.isVisible) {
        this.updateFileBrowser('');
      }
      this.setState({isVisible: !this.state.isVisible});
    },

    updateFileBrowser: function(folder_path) {
      // folder_path is an absolute path
      if (folder_path === undefined) folder_path = this.state.currentWorkingDirectory
      this.setState({currentWorkingDirectory: folder_path});
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
          this.setState({"fileBrowserData": {}});
          $('.file-browser').hide();
        }.bind(this)
      });
    },

    render: function() {
        var items = [];
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
        var arrow = this.state.isVisible ? <span className='file-browser-arrow' onClick={this.updateFileBrowserWhenDrilledIn}>&#x25BE;</span> : <span className='file-browser-arrow' onClick={this.updateFileBrowserWhenDrilledIn}>&#x25B8;</span>;
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
        return (<div className='file-browser'>
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

var encodeBundleContentsPath = function(path) {
  // Encode each segment of the path separately, because we want to escape
  // everything (such as questions marks) EXCEPT slashes in the path.
  return path.split('/').map(encodeURIComponent).join('/');
};

var FileBrowserItem = React.createClass({
    browseToFolder: function(path) {
        this.props.updateFileBrowser(path);
    },
    render: function() {
        var size = '';
        var file_location = '';
        if (this.props.type === '..') {
          file_location = this.props.currentWorkingDirectory.substring(0, this.props.currentWorkingDirectory.lastIndexOf('/'));
        } else if (this.props.currentWorkingDirectory) {
          file_location = this.props.currentWorkingDirectory + '/' + this.props.index;
        } else {
          file_location = this.props.index;
        }
        if (this.props.hasOwnProperty('size_str'))
          size = this.props['size_str'];
        // this.props.hasCheckbox is true in run_bundle_builder for the user to select bundle depedency
        // otherwise, it is always false
        var checkbox = this.props.hasCheckbox && this.props.type !== '..' ? (<input
          className="run-bundle-check-box"
          type="checkbox"
          onChange={this.props.handleCheckbox.bind(this, this.props.bundle_uuid, this.props.bundle_name, file_location)}
        />) : null;
        if (this.props.type == 'directory' || this.props.type == '..') {
          item = (
            <span className={this.props.type} onClick={this.browseToFolder.bind(null, file_location)}>
                <span className="glyphicon-folder-open glyphicon" alt="More"></span>
                <a target="_blank">{this.props.index}</a>
                <span className="pull-right">{size}</span>
            </span>
          );
        } else if (this.props.type == 'file') {
          var file_link = '/rest/bundles/' + this.props.bundle_uuid + '/contents/blob/' + encodeBundleContentsPath(file_location);
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
