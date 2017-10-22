var SAMPLE_WORKSHEET_TEXT = '-worksheetname';
var NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_\.\-]*$/i;

var NewWorksheet = React.createClass({
  propTypes: {
    // should be one of 'DEFAULT', 'SIGN_IN_REDIRECT', or 'DISABLED'.
    // 'DEFAULT': the user can access the new worksheet modal.
    // 'SIGN_IN_REDIRECT': the user is redirected to the sign in page.
    // 'DISABLED': the button is grayed out and cannot be clicked.
    clickAction: React.PropTypes
      .oneOf(['DEFAULT', 'SIGN_IN_REDIRECT', 'DISABLED'])
      .isRequired,

    // a worksheet object; bundles are run on this worksheet.
    ws: React.PropTypes.object.isRequired,

    // optional; a userInfo object; contains information about
    // the logged in user
    userInfo: React.PropTypes.object,

    // a callback function that's used as a hack to
    // support escape key functionality
    escCount: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      showNewWorksheet: false,
      newWorksheetName: '',
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.escCount != this.props.escCount && this.state.showNewWorksheet) {
      this.toggleNewWorksheet();
    }
    if (nextProps.userInfo != this.props.userInfo) {
      this.setState({newWorksheetName: nextProps.userInfo.user_name + SAMPLE_WORKSHEET_TEXT});
    }
  },

  toggleNewWorksheet: function() {
    if (this.state.showNewWorksheet) {
      $('#new-worksheet').css('display', 'none');
      this.setState({newWorksheetName: this.props.userInfo.user_name + SAMPLE_WORKSHEET_TEXT});
    } else {
      $('#new-worksheet').css('display', 'block');
      var inputVal = $('#new-worksheet-input').val();
      // highlight the second part of the suggested title for the user to change
      $('#new-worksheet-input')[0].setSelectionRange(inputVal.indexOf('-') + 1, inputVal.length);
      $('#new-worksheet-input').focus();
    }
    this.setState({showNewWorksheet: !this.state.showNewWorksheet});
  },

  handleNameChange: function(event) {
    var name = event.target.value;
    if (name.match(NAME_REGEX) != null || name === '') {
      this.setState({newWorksheetName: event.target.value});
    }
  },

  createNewWorksheet: function() {
    if (this.state.newWorksheetName === '') {
      $('#new-worksheet-input').focus();
      return;
    }
    var args = ['new', this.state.newWorksheetName];
    $('#command_line').terminal().exec(buildTerminalCommand(args));
    this.toggleNewWorksheet();
  },

  handleKeyDown: function(e) {
    if (e.keyCode === 13) {
      // enter shortcut
      e.preventDefault();
      this.createNewWorksheet();
    } else if (e.keyCode === 27) {
      // esc shortcut
      e.preventDefault();
      this.toggleNewWorksheet();
    }
  },

  render: function () {
    var new_worksheet_name = (
        <input type='text' id='new-worksheet-input' value={this.state.newWorksheetName} onChange={this.handleNameChange} onKeyDown={this.handleKeyDown}></input>
      );

    var create_button = (
      <Button
        text='Create'
        type='primary'
        handleClick={this.createNewWorksheet}
      />
    );

    var cancel_button = (
      <Button
        text='Cancel'
        type='default'
        handleClick={this.toggleNewWorksheet}
      />
    );

    /*** creating newWorksheetButton ***/
    var typeProp, handleClickProp;
    switch (this.props.clickAction) {
      case 'DEFAULT':
        handleClickProp = this.toggleNewWorksheet;
        typeProp = 'primary';
        break;
      case 'SIGN_IN_REDIRECT':
        handleClickProp = createHandleRedirectFn(this.props.ws.info ? this.props.ws.info.uuid : null);
        typeProp = 'primary';
        break;
      case 'DISABLED':
        handleClickProp = null;
        typeProp = 'disabled';
        break;
      default:
        break;
    }

    var newWorksheetButton = (
      <Button
        text='New Worksheet'
        type={typeProp}
        width={120}
        handleClick={handleClickProp}
        flexibleSize={true}
      />
    );

    return (
      <div className='inline-block'>
        <div id='new-worksheet'>
          <span className='close' onClick={this.toggleNewWorksheet}>×</span>
          <p className='pop-up-title'>New Worksheet</p>{new_worksheet_name}
          <p id='new-worksheet-message' className='pop-up-text'>CodaLab>&nbsp;
            <span className='pop-up-command'>cl new {this.state.newWorksheetName}</span>
          </p>
          <div id='new-worksheet-button'>
            {cancel_button}
            {create_button}
          </div>
        </div>
        {newWorksheetButton}
      </div>
      );
  }
});
