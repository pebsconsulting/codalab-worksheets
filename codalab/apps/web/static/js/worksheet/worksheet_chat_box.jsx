DEFAULT_ID = '-1'
SYSTEM_USER_ID = '-1'
ROOT_USER_ID = '0'

var WorksheetChatBox = React.createClass({

  isFocusBundle: function(focusIndex, subFocusIndex) {
    return focusIndex == 0 && subFocusIndex != -1;
  },

  getInitialState: function() {
    return {
      worksheetId: DEFAULT_ID,
      bundleId: DEFAULT_ID,
      numOfChatHistory: 0,
      userId: null,
    }
  },

  componentWillReceiveProps: function(nextProps) {
    var bundleId = DEFAULT_ID;
    if (this.isFocusBundle(nextProps.focusIndex, nextProps.subFocusIndex)) {
      bundleId = nextProps.ws.info.items[nextProps.focusIndex].bundle_info[nextProps.subFocusIndex].uuid;
    }
    this.setState({
      worksheetId: nextProps.ws.uuid,
      bundleId: bundleId,
    })
  },

  componentDidMount: function () {
    $("#chat_box").chatbox({
      chatBoxId: 'chat_box',
      title : "Questions or feedback?",
      user : "You",
      offset: 50
    });
    this.loadChatHistory();
    setInterval(function(){
      this.loadChatHistory();
    }.bind(this), 10 * 1000);
  },

  loadChatHistory: function() {
    $.ajax({
      url: '/api/users/',
      dataType: 'json',
      cache: false,
      type: 'GET',
      success: function(data) {
        var userId = data.user_info.user_id;
        this.setState({userId: userId});
        $.ajax({
          url: '/api/chatbox/',
          dataType: 'json',
          cache: false,
          type: 'GET',
          data: {
            user_id: data.user_info.user_id
          },
          success: function(data) {
            console.log(this.state.numOfChatHistory);
            var chats = data.chats;
            if (Object.keys(chats).length > 0) {
              for (var user_id in chats) {
                if (chats.hasOwnProperty(user_id)) {
                  var newMsgIndex = this.state.numOfChatHistory;
                  for (var i = newMsgIndex; i < chats[user_id].length; i++) {
                    var chat = chats[user_id][i]
                    var sender = '';
                    if (chat.sender_user_id == userId) {
                      sender = 'You';
                    } else if (chat.sender_user_id == SYSTEM_USER_ID) {
                      sender = 'System';
                    } else if (chat.sender_user_id == ROOT_USER_ID) {
                      sender = 'Admin';
                    } else {
                      sender = chat.sender_user_id;
                    }
                    $("#chat_box").chatbox("option", "boxManager").addMsg(sender, chat.message);
                  }
                  this.setState({numOfChatHistory: chats[user_id].length})
                }
              }
            }
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
},

handleMessageSent: function(chatbox, id, user, msg){
  chatbox.boxManager.addMsg(user, msg);
  this.setState({numOfChatHistory: this.state.numOfChatHistory + 1})
  $.ajax({
    url: '/api/chatbox/',
    data: {
      senderUserId: this.state.userId,
      recipientUserId: SYSTEM_USER_ID,
      message: msg,
      worksheetId: this.state.worksheetId,
      bundleId: this.state.bundleId,
    },
    type: 'POST',
    success: function (data, status, jqXHR) {
      // auto response 
      chatbox.boxManager.addMsg('System', data.chats);
      this.setState({numOfChatHistory: this.state.numOfChatHistory + 1})
    }.bind(this),
    error: function (jqHXR, status, error) {
      alert('chat box error');
    }.bind(this)
  })},

  render: function () {
    var self = this;
    $("#chat_box").chatbox("option", "messageSent", function(id, user, msg){
        // this refers to the chat box, self refers to the React component 
        self.handleMessageSent(this, id, user, msg);
      });
    return (
      <div id="chat_box">
      </div>
      );
  }
});