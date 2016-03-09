var SAMPLE_WORKSHEET_TEXT = 'username-sampleworksheet'
var NewWorksheet = React.createClass({

  getInitialState: function() {
    return {
      showNewWorksheet: false,
      newWorksheetName: SAMPLE_WORKSHEET_TEXT,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.userInfo != this.props.userInfo) {
      console.log(nextProps.userInfo)
      this.setState({newWorksheetName: SAMPLE_WORKSHEET_TEXT})
    }
  },

  toggleNewWorksheet: function() {
    if (this.state.showNewWorksheet) {
      $('#new-worksheet').css('display', 'none');
      this.setState({newWorksheetName: SAMPLE_WORKSHEET_TEXT});
    } else {
      $('#new-worksheet').css('display', 'block');
      var inputVal = $('#new-worksheet-input').val()
      // highlight the second part of the suggested title for the user to change
      $('#new-worksheet-input')[0].setSelectionRange(inputVal.indexOf('-') + 1, inputVal.length);
      $('#new-worksheet-input').focus()
    }
    this.setState({showNewWorksheet: !this.state.showNewWorksheet});
  },

  handleNameChange: function(event) {
    this.setState({newWorksheetName: event.target.value});
  },

  createNewWorksheet: function(e) {
    var command = 'cl new ' + this.state.newWorksheetName;
    response = $('#command_line').terminal().exec(command);
    this.toggleNewWorksheet();
  },

  render: function () {
    var new_worksheet_name = (
        <input type='text' id='new-worksheet-input' value={this.state.newWorksheetName} onChange={this.handleNameChange} ></input>
      );
    return (
      <div>
        <div id='new-worksheet'>
          <span className='close' onClick={this.toggleNewWorksheet}>×</span>
          <p className='pop-up-title'>New Worksheet</p>{new_worksheet_name}
          <p id='new-worksheet-message' className='pop-up-text'>Equivalent web terminal command:<br />
            <span className='pop-up-command'>cl new {this.state.newWorksheetName}</span>
          </p>
          <div id='new-worksheet-button'>
            <button className='pop-up-button' onClick={this.toggleNewWorksheet}>Cancel</button>
            <button className='pop-up-button' onClick={this.createNewWorksheet}>Create</button>
          </div>
        </div>
        <button onClick={this.toggleNewWorksheet}>Create New Worksheet</button>
      </div>
      );
  }
});
