/** @jsx React.DOM */

var WorksheetChatBox = React.createClass({

  componentDidMount: function () {
    self = this;
    $("#chat_box").chatbox({
                            chatBoxId: 'chat_box',
                            title : "Have questions for CodaLab?",
                            hidden: true,
                            user : "You",
                            offset: 50,
                            messageSent: function(id, user, msg){
                              this.boxManager.addMsg(user, msg);
                              $.ajax({
                                url: '/api/chatbox/',
                                data: {
                                  request: msg,
                                  uuid :self.props.ws.uuid,
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
                              });
                            }});
  },
  
  render: function () {
    return (
      <div id="chat_box">
      </div>
    )
  }
});