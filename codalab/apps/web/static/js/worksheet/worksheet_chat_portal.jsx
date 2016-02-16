DEFAULT_WORKSHEET_ID = '-1'
DEFAULT_BUNDLE_ID = '-1'
SYSTEM_USER_ID = '-1'
ROOT_USER_ID = '0'

var WorksheetChatPortal = React.createClass({

  getInitialState: function() {
    return {
      showChatPortal: false
    }
  },

  togglePortal: function() {
  	this.setState({showChatPortal: !this.state.showChatPortal})
  },

  render: function () {
    var portalStyle = {
    	display: this.state.showChatPortal ? 'inline' : 'none'
	};
    return (
      <div>
      	<div id="chat-portal-switch" onClick = {this.togglePortal}> Show/Hide Chat Portal
      	</div>
      	{ this.state.showChatPortal ? <WorksheetChatPortalInterface /> : null }
      </div>
    )
  }
});


var WorksheetChatPortalInterface = React.createClass({

  getInitialState: function() {
    return {
      data : [],
      activeUser: null
    }
  },

  componentDidMount: function() {
    $.ajax({
      url: '/api/chatbox/',
      dataType: 'json',
      cache: false,
      type: 'GET',
      data: {
        user_id: ROOT_USER_ID,
      },
      success: function(data) {
        // console.log(data.chats)
        this.setState({data: data.chats});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleChangeUser: function(newUser) {
  	this.setState({activeUser: newUser});
  },

  handleAnswerChat: function(recipientUserId, msg) {
  	$.ajax({
      url: '/api/chatbox/',
      dataType: 'json',
      type: 'POST',
      data: {
        senderUserId: ROOT_USER_ID,
        recipientUserId: recipientUserId,
        message: msg,
        worksheetId: DEFAULT_WORKSHEET_ID,
        bundleId: DEFAULT_BUNDLE_ID,
      },
      success: function(data) {
        // console.log(data.chats);
        this.setState({data: data.chats});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function () {
  	var user_list = (
        <WorksheetChatPortalUserList
            activeUser={this.state.activeUser}
            userList={Object.keys(this.state.data)}
            handleChangeUser={this.handleChangeUser}
        />
        );

  	var chats = this.state.activeUser != null && this.state.data[this.state.activeUser]
                     ? this.state.data[this.state.activeUser] : []
  	var chat_list = (
        <WorksheetChatPortalChatList
            userId={this.state.activeUser}
            chats={chats}
            handleAnswerChat={this.handleAnswerChat}
        />
        );
  	return (
  		<div id='chat-portal'>
  			{user_list}
  			{chat_list}
  		</div>
  	)
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
  	this.props.handleChangeUser(this.props.user)
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
        	chat = {chat}
        />
      );
    });
    var chatbox = this.props.chats.length == 0 ? null : (
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
    var date = time.substr(6,2) + '/' + time.substr(9,2);
    var hour = time.substr(12,5);
    time = date + ', ' + hour;
    var sender_user_id = this.props.chat.sender_user_id;
    if (sender_user_id == SYSTEM_USER_ID) {
      sender_user_id = 'System';
    } else if (sender_user_id == ROOT_USER_ID) {
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
      if ((e.ctrlKey || e.metaKey) && e.keyCode == 13) {
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