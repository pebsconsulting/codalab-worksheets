
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
      	<div id = "chat-portal-switch" onClick = {this.togglePortal}> Show/Hide Chat Portal
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
        user_id: 0
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
        senderUserId: 0,
        recipientUserId: recipientUserId,
        chat: msg,
        worksheetId: -1,
        bundleId: -1,
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
  		<div id = 'chat-portal'>
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
      <div id = 'chat-portal-user-list'>
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
      <button id = 'chat-portal-user' onClick = {this.handleClick}>
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
      <div id = 'chat-portal-chat-list'>
        {chatList}
        {chatbox}
      </div>
    );
  }
});

var WorksheetChatPortalChat = React.createClass({

  render: function () {
  	var date = this.props.chat.date;
    var chat = this.props.chat.chat;
    var sender_user_id = this.props.chat.sender_user_id;
    if (sender_user_id == -1) {
      sender_user_id = 'System'
    } else if (sender_user_id == 0) {
      sender_user_id = 'Admin'
    }
    var title = date + ' user_id: ' + sender_user_id
    return (
      <div id = 'chat-portal-chat'>
        {title}
        <br />
        {chat}
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
  render: function() {
    return (
      <form className="chat-portal-chat-box" onSubmit={this.handleSubmit}>
        <textarea rows='5' cols='100'
          placeholder="Chat here:"
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});