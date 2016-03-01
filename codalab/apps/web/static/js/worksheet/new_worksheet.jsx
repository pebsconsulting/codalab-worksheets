var NewWorksheet = React.createClass({

  getInitialState: function() {
    return {
      showNewWorksheet: false,
      newWorksheetName: 'user-',
    };
  },

  toggleNewWorksheet: function() {
    if (this.state.showNewWorksheet) {
      $('#new-worksheet').css('display', 'none');
    } else {
      $('#new-worksheet').css('display', 'block');
    }
    this.setState({showNewWorksheet: !this.state.showNewWorksheet});
  },

  buildRunBundle: function(e) {
    e.preventDefault();
    var command = this.createCommand()
    console.log(command)
    var response = $('#command_line').terminal().exec(command);
    console.log(response);
    this.setState({clCommand: command});
  },

    handleNameChange: function(event) {
      this.setState({newWorksheetName: event.target.value});
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
    var new_worksheet_name = (<div>
        <input type='text' className='' value={this.state.newWorksheetName} onChange={this.props.handleNameChange}></input>
      </div>);
    return (
      <div>
        <div id='new-worksheet'>
          <span className='close' onClick={this.toggleBuilder}>×</span>
          New Worksheet Name: {new_worksheet_name}
          <button id='new-worksheet-button' onClick={this.buildRunBundle}>Run</button>
        </div>
        <button onClick={this.toggleNewWorksheet}>Build Run Bunddle</button>
      </div>
      );
  }
});




