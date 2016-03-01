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

  handleNameChange: function(event) {
    this.setState({newWorksheetName: event.target.value});
  },

  createNewWorksheet: function(e) {
    var command = 'cl new ' + this.state.newWorksheetName;
    $('#command_line').terminal().exec(command);
    this.setState({newWorksheetName: ''});
  },

  render: function () {
    var new_worksheet_name = (<div>
        <input type='text' className='' value={this.state.newWorksheetName} onChange={this.handleNameChange}></input>
      </div>);
    return (
      <div>
        <div id='new-worksheet'>
          <span className='close' onClick={this.toggleNewWorksheet}>×</span>
          New Worksheet Name: {new_worksheet_name}
          <button className='pop-up-button' onClick={this.createNewWorksheet}>Create</button>
        </div>
        <button onClick={this.toggleNewWorksheet}>Create New Worksheet</button>
      </div>
      );
  }
});




