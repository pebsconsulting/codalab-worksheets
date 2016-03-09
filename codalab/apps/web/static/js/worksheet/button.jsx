var Button = React.createClass({
  render: function () {
    var classname = 'button button-' + this.props.type;
    return (<a className={classname} onClick={this.props.handleClick}>{this.props.text}</a>)
  }
});
