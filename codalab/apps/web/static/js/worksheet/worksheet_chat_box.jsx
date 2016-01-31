
var WorksheetChatBox = React.createClass({

  isFocusBundle: function(focusIndex, subFocusIndex) {
    return focusIndex == 1 && subFocusIndex != -1;
  },

  getInitialState: function() {
    return {
      worksheetId: -1,
      bundleId: -1,
      chatHistory: [],
      userInfo: null
    }
  },

  componentWillReceiveProps: function(nextProps) {
    var bundleId = -1
    if (this.isFocusBundle(nextProps.focusIndex, nextProps.subFocusIndex)) {
      bundleId = nextProps.ws.info.items[nextProps.focusIndex].bundle_info[nextProps.subFocusIndex].uuid
    }
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
      url: '/api/users/',
      dataType: 'json',
      cache: false,
      type: 'GET',
      success: function(data) {
        var userId = data.user_info.user_id;
        $.ajax({
          url: '/api/chatbox/',
          dataType: 'json',
          cache: false,
          type: 'GET',
          data: {
            user_id: data.user_info.user_id
          },
          success: function(data) {
            if (userId in data.chats) {
              data.chats[userId].forEach(function(ele) {
                $("#chat_box").chatbox("option", "boxManager").addMsg("You", ele.chat);
                if (ele.answer != '') $("#chat_box").chatbox("option", "boxManager").addMsg("Staff", ele.answer);
              })
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
  $.ajax({
    url: '/api/chatbox/',
    data: {
      request: msg,
      bundleId: this.state.bundleId,
      worksheetId: this.state.worksheetId,
    },
    type: 'POST',
    success: function (data, status, jqXHR) {
      console.log(data);
      response = data.response;
      response += '\nYou can run the following command:\n'
      response += data.command;
      chatbox.boxManager.addMsg('Codalab', response);
    }.bind(this),
    error: function (jqHXR, status, error) {
      alert('chat box error');
    }.bind(this)
  })},

  render: function () {
    var self = this;
    var haha = "haha"
    $("#chat_box").chatbox("option", "messageSent", function(id, user, msg){
        // this refers to the chat box, self refers to the React component 
        self.handleMessageSent(this, id, user, msg)
      });
    return (
      <div id="chat_box">
      </div>
      )
  }
});