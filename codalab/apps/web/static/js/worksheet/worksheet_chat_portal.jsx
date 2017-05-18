window.DEFAULT_ID = '-1';

var WorksheetChatPortal = React.createClass({

  getInitialState: function() {
    return {
      showChatPortal: false,
    };
  },

  togglePortal: function() {
    this.setState({showChatPortal: !this.state.showChatPortal});
  },

  render: function () {
    var portalStyle = {
      display: this.state.showChatPortal ? 'inline' : 'none'
    };
    return (
      <div>
        <div id="chat-portal-switch" onClick = {this.togglePortal}> Show/Hide Chat Portal
        </div>{
          this.state.showChatPortal ? <WorksheetChatPortalInterface userInfo={this.props.userInfo} /> : null
        }
      </div>
    )
  }
});


var WorksheetChatPortalInterface = React.createClass({

  getInitialState: function() {
    return {
      // chats is a map whose key is the user id of the target user that Admin has
      // talked to and value is an array of chats between them
      chats : {},
      activeUser: null
    };
  },

  componentDidMount: function() {
    $.ajax({
      url: '/rest/chats',
      dataType: 'json',
      cache: false,
      type: 'GET',
      success: function(data) {
        this.setState({chats: this.groupChatsToUsers(data.chats)});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  // input: chats_list, an array of raw chats with information like recipient_user_id, sender_user_id, message, etc.
  // output: chats, a map that groups raw chats to each user that the Admin / System has had a conversation with.
  //         Key is the user id, value is all the chats between the Admin / System and that user.
  groupChatsToUsers: function(chats_list) {
    var chats = {};
    var chat_list = chats_list;
    for (var i = 0; i < chat_list.length; i++) {
      var target = '';
      var chat = chat_list[i];
      if (chat.recipient_user_id === this.state.systemUserId ||
        chat.recipient_user_id === this.state.rootUserId) {
        target = chat.sender_user_id;
      } else {
        target = chat.recipient_user_id;
      }
      if (!chats.hasOwnProperty(target)) {
        chats[target] = [];
      }
      chats[target].push(chat);
    }
    return chats;
  },

  handleChangeUser: function(newUser) {
    this.setState({activeUser: newUser});
  },

  handleAnswerChat: function(recipientUserId, msg) {
    $.ajax({
      url: '/rest/chats',
      dataType: 'json',
      type: 'POST',
      data: {
        recipientUserId: recipientUserId,
        message: msg,
        worksheetId: window.DEFAULT_ID,
        bundleId: window.DEFAULT_ID,
      },
      success: function(data) {
        this.setState({chats: this.groupChatsToUsers(data.chats)});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  render: function () {
    var user_list = (
        <WorksheetChatPortalUserList
            activeUser={this.state.activeUser}
            userList={Object.keys(this.state.chats)}
            handleChangeUser={this.handleChangeUser}
        />
        );
    var chats = this.state.activeUser != null && this.state.chats[this.state.activeUser]
      ? this.state.chats[this.state.activeUser] : [];
    var chat_list = (
        <WorksheetChatPortalChatList
            userId={this.state.activeUser}
            chats={chats}
            handleAnswerChat={this.handleAnswerChat}
            userInfo={this.props.userInfo}
        />
        );
    return (
      <div id='chat-portal'>
        {user_list}
        {chat_list}
      </div>
    );
  }

});

var WorksheetChatPortalUserList = React.createClass({

  render: function () {
    var self = this;
    var userList = this.props.userList.map(function(user) {
      return (
        <WorksheetChatPortalUser
          user={user}
          handleChangeUser={self.props.handleChangeUser}
        />
      );
    });
    return (
      <div id='chat-portal-user-list'>
        {userList}
      </div>
    );
  }
});

var WorksheetChatPortalUser = React.createClass({

  handleClick: function() {
    this.props.handleChangeUser(this.props.user);
  },

  render: function () {
    return (
      <button className='chat-portal-user' onClick = {this.handleClick}>
        {this.props.user}
      </button>
    );
  }
});

var WorksheetChatPortalChatList = React.createClass({

  render: function () {
    var self = this;
    var chatList = this.props.chats.map(function(chat) {
      return (
        <WorksheetChatPortalChat
          chat={chat}
          userInfo={this.props.userInfo}
        />
      );
    }.bind(this));
    var chatbox = this.props.chats.length === 0 ? null : (
        <WorksheetChatPortalChatBox
            userId={this.props.userId}
            handleAnswerChat={this.props.handleAnswerChat}
        />
    );
    return (
      <div id='chat-portal-chat-list'>
        {chatList}
        {chatbox}
      </div>
    );
  },

  componentDidUpdate: function() {
    var chatListDiv =$('#chat-portal-chat-list');
    chatListDiv.scrollTop(chatListDiv[0].scrollHeight);
  }
});

var WorksheetChatPortalChat = React.createClass({

  render: function () {
    var time = this.props.chat.time;
    var msg = this.props.chat.message;
    var date = time.split(' ')[0];
    var hour = time.split(' ')[1];
    time = date + ', ' + hour;
    var sender_user_id = this.props.chat.sender_user_id;
    if (sender_user_id === this.state.systemUserId) {
      sender_user_id = 'System';
    } else if (sender_user_id === this.state.rootUserId) {
      sender_user_id = 'Admin';
    }
    var target = <span className='chat-portal-chat-target'>
      {sender_user_id}
    </span>;
    var timestamp = <span className='chat-portal-chat-timestamp'>
      {time}
    </span>;
    var message = <div className='chat-portal-chat-message'>
      {msg}
    </div>
    return (
      <div className='chat-portal-chat'>
        {target}
        {timestamp}
        {message}
      </div>
    );
  }
});


var WorksheetChatPortalChatBox = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },

  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    if (!text) {
      return;
    }
    this.props.handleAnswerChat(this.props.userId, text);
    this.setState({text: ''});
  },

  componentDidMount: function() {
    $('#chat-portal-chat-box-input').keydown(function (e) {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
        e.preventDefault();
        $('#chat-portal-chat-box-submit').click();
      }
    });
  },

  render: function() {
    return (
      <form id="chat-portal-chat-box" onSubmit={this.handleSubmit}>
        <textarea id="chat-portal-chat-box-input" rows='5' cols='100'
          placeholder="Chat here: (Ctrl/Command + Enter to send)"
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input id="chat-portal-chat-box-submit" type="submit" value="Send" />
      </form>
    );
  }
});
