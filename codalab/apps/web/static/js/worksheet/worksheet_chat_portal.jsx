
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
      url: '/api/chatportal/',
      dataType: 'json',
      cache: false,
      type: 'GET',
      success: function(data) {
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

  handleAnswerChat: function(chatId, answer) {
  	$.ajax({
      url: '/api/chatportal/',
      dataType: 'json',
      type: 'POST',
      data: {
      	'chat_id': chatId,
      	'answer': answer
      },
      success: function(data) {
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
        	handleAnswerChat = {self.props.handleAnswerChat}
        />
      );
    });
    return (
      <div id = 'chat-portal-chat-list'>
        {chatList}
      </div>
    );
  }
});

var WorksheetChatPortalChat = React.createClass({

  render: function () {
  	var date = this.props.chat.date;
    var chat = this.props.chat.chat;
  	var answer_form = (
        <WorksheetChatPortalAnswerForm 
        	chatId={this.props.chat.chat_id}
        	handleAnswerChat = {this.props.handleAnswerChat}
        />
        );
    return (
      <div id = 'chat-portal-chat'>
        {date}
        <br />
        {chat}
        {answer_form}
      </div>
    );
  }
});


var WorksheetChatPortalAnswerForm = React.createClass({
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
    this.props.handleAnswerChat(this.props.chatId, text);
    this.setState({text: ''});
  },
  render: function() {
    return (
      <form className="chat-portal-answer-form" onSubmit={this.handleSubmit}>
        <textarea rows='5' cols='100'
          placeholder="Your answer:"
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});