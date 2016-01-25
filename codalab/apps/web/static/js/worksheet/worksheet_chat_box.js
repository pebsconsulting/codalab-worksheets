/** @jsx React.DOM */

var WorksheetChatBox = React.createClass({

  isFocusBundle: function(focusIndex, subFocusIndex) {
    return focusIndex == 1 && subFocusIndex != -1;
  },

  getInitialState: function() {
    return {
      worksheetId: undefined,
      bundleId: undefined
    }
  },

  componentWillReceiveProps: function(nextProps) {
    var bundleId = undefined
    if (this.isFocusBundle(nextProps.focusIndex, nextProps.subFocusIndex)) {
      bundleId = nextProps.ws.info.items[nextProps.focusIndex].bundle_info[nextProps.subFocusIndex].uuid
    }
    console.log(bundleId)
    this.setState({
      worksheetId: nextProps.ws.uuid,
      bundleId: bundleId
    })
  },

  componentDidMount: function () {
    $("#chat_box").chatbox({
                            chatBoxId: 'chat_box',
                            title : "Have questions for CodaLab?",
                            hidden: true,
                            user : "You",
                            offset: 50
                          });
  },
  
  render: function () {
    var self = this;
    $("#chat_box").chatbox("option", "messageSent", function(id, user, msg){
                              this.boxManager.addMsg(user, msg);
                              $.ajax({
                                url: '/api/chatbox/',
                                data: {
                                  request: msg,
                                  worksheetId : self.state.worksheetId,
                                  bundleId: self.state.bundleId
                                  // focusIndex: self.props.focusIndex,
                                  // subFocusIndex: self.props.subFocusIndex
                                },
                                type: 'GET',
                                success: function (data, status, jqXHR) {
                                  console.log(self.props.ws);
                                  console.log(self.props.focusIndex);
                                  console.log(data);
                                  response = data.response;
                                  response += '\nYou can run the following command:\n'
                                  response += data.command;
                                  this.boxManager.addMsg('Codalab', response);
                                }.bind(this),
                                error: function (jqHXR, status, error) {
                                  alert('chat box error');
                                }.bind(this)
                              })});

    return (
      <div id="chat_box">
      </div>
    )
  }
});