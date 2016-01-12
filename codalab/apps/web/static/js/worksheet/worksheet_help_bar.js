/** @jsx React.DOM */

var WorksheetHelpBar = React.createClass({

  componentDidMount: function () {
    $("#help_bar").chatbox({
                            helpBarId: 'help_bar',
                            title : "Have questions for CodaLab?",
                            hidden: true,
                            user : "You",
                            offset: 50,
                            messageSent: function(id, user, msg){
                              // do some NLP here
                              this.boxManager.addMsg(user, msg);
                              this.boxManager.addMsg('Codalab', msg);
                            }});
  },
  
  render: function () {
    return (
      <div id="help_bar">
      </div>
    )
  }
});