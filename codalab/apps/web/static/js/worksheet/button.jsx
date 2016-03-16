var Button = React.createClass({
  render: function () {
    var buttonStyle = this.props.flexibleSize ? {
      padding: '5px',
    } : {
      height: this.props.height ? this.props.height + 'px' : '30px',
      width: this.props.width ? this.props.width + 'px' : '60px',
    };

    var classname = 'button button-' + this.props.type;
    if (this.props.className) {
      classname = classname + ' ' + this.props.className
    }
    return (<a style={buttonStyle} className={classname} id={this.props.id} ref={this.props.ref} onClick={this.props.handleClick}>{this.props.text}</a>)
  }
});
