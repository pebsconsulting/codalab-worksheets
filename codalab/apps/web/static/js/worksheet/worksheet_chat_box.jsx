
var WorksheetChatBox = React.createClass({

  isFocusBundle: function(focusIndex, subFocusIndex) {
    return focusIndex == 1 && subFocusIndex != -1;
  },

  getInitialState: function() {
    return {
      worksheetId: -1,
      bundleId: -1,
      chatHistory: []
    }
  },

  componentWillReceiveProps: function(nextProps) {
    var bundleId = -1
    if (this.isFocusBundle(nextProps.focusIndex, nextProps.subFocusIndex)) {
      bundleId = nextProps.ws.info.items[nextProps.focusIndex].bundle_info[nextProps.subFocusIndex].uuid
    }
    // console.log(bundleId)
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
    this.loadChatHistory();
  },

  loadChatHistory: function() {
    $.ajax({
      url: '/api/chatbox/',
      dataType: 'json',
      cache: false,
      type: 'GET',
      success: function(data) {
        console.log(data)
        data.chats['Chengshu'].forEach(function(ele) {
          $("#chat_box").chatbox("option", "boxManager").addMsg("You", ele.chat);
        })
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
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
                                  bundleId: self.state.bundleId,
                                  worksheetId: self.state.worksheetId,
                                  // focusIndex: self.props.focusIndex,
                                  // subFocusIndex: self.props.subFocusIndex
                                },
                                type: 'POST',
                                success: function (data, status, jqXHR) {
                                  // console.log(self.props.ws);
                                  // console.log(self.props.focusIndex);
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