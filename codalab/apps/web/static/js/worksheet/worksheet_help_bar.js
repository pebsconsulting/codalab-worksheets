/** @jsx React.DOM */

var HELPBAR_MINIMIZE_HEIGHT = 50;
var HELPBAR_DRAGHEIGHT = 350;

var WorksheetHelpBar = React.createClass({
  // focustype: 'worksheet', // keep track of what the user has focused on worksheet item
  componentDidMount: function () {
    var self = this;
    // $('#dragbar_horizontal').mousedown(function (e) {
    //   self.resizePanel(e);
    // });
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
  
  componentWillUnmount: function () {
  },
  componentDidUpdate: function () {
  },
  render: function () {
    return (
      <div id="help_bar">
      </div>
    )
  }
});