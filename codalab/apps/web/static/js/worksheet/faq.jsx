var FAQ = React.createClass({

  getInitialState: function() {
    return {
      faqBody: null,
    }
  },

  componentDidMount: function () {
    $.ajax({
      url: '/api/faq/',
      dataType: 'json',
      cache: false,
      type: 'GET',
      success: function(data) {
        this.setState({faqBody: data['faq']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function () {
    var faqList = this.state.faqBody === null ? null : Object.keys(this.state.faqBody).map(function(index) {
      var content = this.state.faqBody[index];
      return (
        <div className='faq-item'>
          <li className='faq-question'>
            {content.question}
          </li>
          <li className='faq-response'>
            {content.answer.response}
          </li>
          Example: 
          <li className='faq-command'>
            {content.answer.command}
          </li>
        </div>
      );
    }.bind(this));
    return (
      <ul id="faq-list">
        {faqList}
      </ul>
      )
  }
});