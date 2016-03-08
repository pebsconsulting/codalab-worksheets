var RunBundleBuilder = React.createClass({

  getInitialState: function() {
    return {
      showBuilder: false,
      selectedDependencies: [],
      dependencyKeyList: [],
      command: null,
      clCommand: 'cl run ',
    };
  },

  toggleBuilder: function() {
    if (this.state.showBuilder) {
      $('#run-bundle-builder').css('display', 'none');
      $(".run-bundle-check-box").attr("checked", false);
      this.setState({
        selectedDependencies: [],
        dependencyKeyList: [],
        command: null,
        clCommand: 'cl run ',
      });
    } else {
      $('#run-bundle-builder').css('display', 'block');
    }
    this.setState({showBuilder: !this.state.showBuilder});
  },

  createRunBundle: function(e) {
    e.preventDefault();
    var clCommand = this.getClCommand(this.state.selectedDependencies, this.state.dependencyKeyList, this.state.command, true)
    // console.log(command)
    var response = $('#command_line').terminal().exec(clCommand);
    this.toggleBuilder();
  },

  handleDependencySelection: function(bundle_uuid, bundle_name, path, e) {
    // console.log(bundle_uuid);
    // console.log(bundle_name);
    // console.log(path)
    var newDep = {
      'bundle_uuid': bundle_uuid,
      'bundle_name': bundle_name,
      'path': path
    };
    var selectedDependencies = this.state.selectedDependencies.slice();
    var dependencyKeyList = this.state.dependencyKeyList.slice();
    if (e.target.checked) {
      // add a dependency
      selectedDependencies.push(newDep);
      var key = newDep.path === '' ? newDep.bundle_name : newDep.path.substring(newDep.path.lastIndexOf('/') + 1);
      dependencyKeyList.push(key);
    } else {
      // remove a dependency
      var removedDepIndex = null;
      selectedDependencies = selectedDependencies.filter(function(ele, i) {
        depEqual = ele.bundle_uuid === newDep.bundle_uuid && ele.bundle_name === newDep.bundle_name && ele.path === newDep.path
        if (depEqual)
          removedDepIndex = i;
        return !depEqual;
      });
      dependencyKeyList.splice(removedDepIndex, 1);      
    }
    var clCommand = this.getClCommand(selectedDependencies, dependencyKeyList, this.state.command, false);
    console.log(clCommand)
    this.setState({
      selectedDependencies: selectedDependencies,
      dependencyKeyList: dependencyKeyList,
      clCommand: clCommand
    });
    // console.log(this.state.selectedDependencies);
  },

  handleKeyChange: function(index, event) {
    var dependencyKey = event.target.value;
    var dependencyKeyList = this.state.dependencyKeyList.slice();
    dependencyKeyList[index] = dependencyKey
    var clCommand = this.getClCommand(this.state.selectedDependencies, dependencyKeyList, this.state.command, false);
    this.setState({
      dependencyKeyList: dependencyKeyList,
      clCommand: clCommand,
    });
  },

  handleCommandChange: function(event) {
    var command = event.target.value;
    var clCommand = this.getClCommand(this.state.selectedDependencies, this.state.dependencyKeyList, command, false);
    this.setState({
      command: command,
      clCommand: clCommand,
    });
  },

  getClCommand: function(selectedDependencies, dependencyKeyList, command, usingBundleId) {
    var clCommand = ['cl run'];
    for (var i = 0; i < dependencyKeyList.length; i++) {
      var key = dependencyKeyList[i];
      var target = selectedDependencies[i];
      if (usingBundleId) {
        target = target.path === '' ? target.bundle_uuid : target.bundle_uuid + '/' + target.path
      } else {
        target = target.path === '' ? target.bundle_name : target.bundle_name + '/' + target.path
      }
      clCommand.push(key + ':' + target);
    }
    if (command != null) {
      clCommand.push('\'' + command + '\'')
    }
      // if (this.state.name != null) {
      //   command.push('-n')
      //   command.push(this.state.name)
      // }
    clCommand = clCommand.join(' ');
    return clCommand
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
        createRunBundle={this.createRunBundle}
      />
    );

    return (
      <div>
        <div id='run-bundle-builder'>
          <span className='close' onClick={this.toggleBuilder}>×</span>
          <div className='pop-up-title'>Create Run Bundle</div>
          <div className='run-bundle-container'>
            <div className='run-bundle-text pop-up-text'>Step 1: Specify your depedency. You can use the file browser below to drill down.</div>
            <div id='bundle-browser'>
              {bundles_html}
            </div>
          </div>
          <div className='run-bundle-container'>
            <div className='run-bundle-text pop-up-text'>Step 2: Rename your depedency (optional) and run your program. Below is the environment that you will run a program in. Refer to your depedencies by their keys in your program.</div>
            <div id='run-bundle-terminal'>
              {run_bundle_terminal}
            </div>
          </div>
          <div className='pop-up-text'>Equivalent web terminal command:
            <div id='run-bundle-cl-command' className='pop-up-command'>{this.state.clCommand}</div>
          </div>
          <div id='run-bundle-button'>
            <button className='pop-up-button' onClick={this.toggleBuilder}>Cancel</button>
            <button className='pop-up-button' onClick={this.createRunBundle}>Run</button>
          </div>
        </div>
        <button onClick={this.toggleBuilder}>Create Run Bundle</button>
      </div>
      );
  }
});


var BundleBrowser = React.createClass({
  getInitialState: function() {
    return {
      bundleIdList: [],
      bundleInfoList: [],
    };
  },

  componentDidMount: function() {
    this.updateBundleInfoList(this.props);
  },

    // To-do: when new bundle is added, refresh the build run bundle page
  // componentWillReceiveProps: function(nextProps) {
  //   this.updateBundleInfoList(nextProps);
  // },

  updateBundleInfoList: function(props) {
    this.state.bundleInfoList = [];
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

    var rows = [];
    this.state.bundleInfoList.forEach(function(b) {
      var url = "/bundles/" + b.uuid;
      var short_uuid = shorten_uuid(b.uuid);

      if (b.type === 'directory') {
        var fileBrowser = (<FileBrowser
          bundle_uuid={b.uuid}
          hasCheckbox={true}
          handleCheckbox={this.props.handleDependencySelection}
          bundle_name={b.metadata.name}
          startCollapsed={true}
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
                className="run-bundle-check-box"
                onChange={this.props.handleDependencySelection.bind(this, b.uuid, b.metadata.name, '')}
              />
              <a href={url} target="_blank">{b.metadata.name}({short_uuid})</a>
            </td>
          </tr>
          );
      }
    }.bind(this));
    if (rows.length === 0) {
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
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 13)
      this.props.createRunBundle();
  },
  render: function () {
    var command = (<div>
      $ <input type='text' id='run-bundle-terminal-command' className='inline-block run-bundle-terminal-input' value={this.props.command} placeholder="run your program here (e.g 'cat data.txt')" onChange={this.props.handleCommandChange}></input>
    </div>
    )
    var depedencies = this.props.selectedDependencies.map(function(d, i) {
      var short_uuid = shorten_uuid(d.bundle_uuid);
      var target = d.path === '' ? d.bundle_name : d.bundle_name + '/' + d.path
      return (<div>
         <input type='text' className='run-bundle-terminal-input' value={this.props.dependencyKeyList[i]} onChange={this.props.handleKeyChange.bind(this, i)} onKeyUp={this.handleKeyUp}></input>
          &#8594; {target}({short_uuid})
        </div>)
    }.bind(this));
    return (
      <div>
        <div>$ ls</div>
        <div> key (referred in your program) &#8594; target bundle/file</div>
        {depedencies}
        {command}
      </div>
    );
  }
});



