var RunBundleBuilder = React.createClass({

  getInitialState: function() {
    return {
      showBuilder: false,
      selectedDependencies: [],
      dependencyKeyList: [],
      command: null,
      clCommand: null,
    };
  },

  toggleBuilder: function() {
    if (this.state.showBuilder) {
      $('#run-bundle-builder').css('display', 'none');
    } else {
      $('#run-bundle-builder').css('display', 'block');
    }
    this.setState({showBuilder: !this.state.showBuilder});
  },

  buildRunBundle: function(e) {
    e.preventDefault();
    var command = this.createCommand()
    console.log(command)
    var response = $('#command_line').terminal().exec(command);
    console.log(response);
    this.setState({clCommand: command});
  },

  handleDependencySelection: function(uuid, path, name, e) {
    console.log(uuid);
    console.log(name);
    console.log(path)
    var newDep = {
      'uuid': uuid,
      'name': name,
      'path': path
    };
    var selectedDependencies = this.state.selectedDependencies.slice();
    var dependencyKeyList = this.state.dependencyKeyList.slice();
    if (e.target.checked) {
      selectedDependencies.push(newDep);
      dependencyKeyList.push(newDep.name);
    } else {
      var removedDepIndex = null;
      selectedDependencies = selectedDependencies.filter(function(ele, i) {
        depEqual = ele.uuid === newDep.uuid && ele.name === newDep.name && ele.path === newDep.path
        if (depEqual)
          removedDepIndex = i;
        return !depEqual;
      });
      dependencyKeyList.splice(removedDepIndex, 1);      
    }
    this.setState({
      selectedDependencies: selectedDependencies,
      dependencyKeyList: dependencyKeyList,
    });
    // console.log(this.state.selectedDependencies);
  },

    handleKeyChange: function(index, event) {
      var dependencyKey = event.target.value;
      var dependencyKeyList = this.state.dependencyKeyList.slice();
      dependencyKeyList[index] = dependencyKey
      this.setState({dependencyKeyList: dependencyKeyList});
    },

    handleCommandChange: function(event) {
      this.setState({command: event.target.value});
    },

    createCommand: function(e) {
      var command = ['cl run'];
      for (var i = 0; i < this.state.dependencyKeyList.length; i++) {
        var key = this.state.dependencyKeyList[i];
        var target = this.state.selectedDependencies[i];
        target = target.path === '' ? target.uuid : target.uuid + '/' + target.path
        command.push(key + ':' + target);
      }
      if (this.state.command != null) {
        command.push('\'' + this.state.command + '\'')
      }
      // if (this.state.name != null) {
      //   command.push('-n')
      //   command.push(this.state.name)
      // }
      command = command.join(' ');
      return command;
    // cl run sort.py:sort.py input:a.txt 'python sort.py < input > output' -n sort-run
    },

  render: function () {
    var bundles_html = (
      <BundleBrowser
        ws={this.props.ws}
        handleDependencySelection={this.handleDependencySelection}
      />
    );

    var run_bundle_terminal = (
      <RunBundleTerminal
        selectedDependencies={this.state.selectedDependencies}
        dependencyKeyList={this.state.dependencyKeyList}
        command={this.state.command}
        handleKeyChange={this.handleKeyChange}
        handleCommandChange={this.handleCommandChange}
        buildRunBundle={this.buildRunBundle}
      />
    );

    var clCommand;
    if (this.state.clCommand) {
      // var b = this.state.
      // var url = "/bundles/" + b.uuid;
      // var short_uuid = shorten_uuid(b.uuid);
      clCommand = <div>You have successfully built a run bundle. Check out your result WITHIN this run bundle.</div>
    } 
    

    return (
      <div>
        <div id='run-bundle-builder'>
          <span className='close' onClick={this.toggleBuilder}>×</span>
          <p>Build Your Run Bundle</p>
          <div className='run-bundle-container'>
            <div className='run-bundle-text'>Step 1: Specify your depedency. For example, if you need to sort a file called a.txt. Select a.txt and sort.py.</div>
            <div id='bundle-browser'>
              {bundles_html}
            </div>
          </div>
          <div className='run-bundle-container'>
            <div className='run-bundle-text'>Step 2: Rename your depedency (optional) and run your program, For example, you can rename 'a.txt' to 'input' and then run 'python sort.py &#9;input&#9; output'</div>
            <div id='run-bundle-terminal'>
              {run_bundle_terminal}
            </div>
          </div>
          <div>
            <button className='pop-up-button' onClick={this.buildRunBundle}>Run</button>
          </div>
          {clCommand}
        </div>
        <button onClick={this.toggleBuilder}>Build Run Bunddle</button>
      </div>
      );
  }
});


var BundleBrowser = React.createClass({
    getInitialState: function() {
      return {
        bundleInfoList: [],
      };
    },

    componentDidMount: function() {
      this.updateBundleInfoList(this.props);
    },

    // To-do: when new bundle is added, refresh the build run bundle page
    // componentWillReceiveProps: function(newProps) {
    //   this.setState({ bundleInfoList: [] });
    //   this.updateBundleInfoList(newProps);
    // },

    updateBundleInfoList: function(props) {
      var worksheet = props.ws.info;
      if (worksheet && worksheet.items) {
        worksheet.items.forEach(function(item) {
          if (item.bundle_info) {
            var bundle_infos = item.bundle_info;
            if (!(bundle_infos instanceof Array)) {
              bundle_infos = [bundle_infos];
            }
            bundle_infos.forEach(function(bundle_info) {
              $.ajax({
                type: "GET",
                url: "/api/bundles/" + bundle_info.uuid,
                dataType: 'json',
                cache: false,
                success: function(data) {
                  var bundleInfoList = this.state.bundleInfoList.slice()
                  bundleInfoList.push(data)
                  this.setState({ bundleInfoList: bundleInfoList })
                }.bind(this),
                error: function(xhr, status, err) {
                  console.log(xhr, status, err);
                }.bind(this)
              });
            }.bind(this));
          }
        }.bind(this));
      }
    },

    render: function () {
      var worksheet = this.props.ws.info;
      if (!worksheet) return <div />;

      // Show brief summary of contents.
      var rows = [];
      // Show bundle
      this.state.bundleInfoList.forEach(function(b) {
        var url = "/bundles/" + b.uuid;
        var short_uuid = shorten_uuid(b.uuid);

        if (b.type == 'directory') {
          var fileBrowser = (<FileBrowser
            bundle_uuid={b.uuid}
            hasCheckbox={true}
            handleCheckbox={this.props.handleDependencySelection}
            bundle_name={b.metadata.name}
            />);
          rows.push(
            <tr><td>{fileBrowser}</td></tr>
            );
        } else {
          rows.push(
            <tr>
              <td>
                <input
                  type="checkbox"
                  onChange={this.props.handleDependencySelection.bind(this, b.uuid, '', b.metadata.name)}
                />
                <a href={url} target="_blank">{b.metadata.name}({short_uuid})</a>
              </td>
            </tr>
            );  
        }
      }.bind(this));
      if (rows.length == 0) {
        return (<div>
          You don't have any bundle in this worksheet
        </div>);
      }
      return (
        <div className="bundles-table">
            <table className="bundle-meta table">
                <tbody>
                  {rows}
                </tbody>
            </table>
        </div>
      );
    }
});

var RunBundleTerminal = React.createClass({
    handleKeyUp: function(e) {
      if ((e.ctrlKey || e.metaKey) && e.keyCode == 13)
        this.props.buildRunBundle();
    },
    render: function () {
      var command = (<div>
        $ <input type='text' id='run-bundle-terminal-command' className='inline-block run-bundle-terminal-input' value={this.props.command} placeholder="type your command here (e.g 'python sort.py <input> output')" onChange={this.props.handleCommandChange}></input>
      </div>
      )
      var depedencies = this.props.selectedDependencies.map(function(d, i) {
        var short_uuid = shorten_uuid(d.uuid);
        return (<div>
           <input type='text' className='run-bundle-terminal-input' value={this.props.dependencyKeyList[i]} onChange={this.props.handleKeyChange.bind(this, i)} onKeyUp={this.handleKeyUp}></input>
           &#8594; {d.name}({short_uuid})
          </div>)
      }.bind(this));
      return (
        <div>
          <div>$ ls</div>
          {depedencies}
          {command}
        </div>
      );
    }
});



