
// Display a worksheet item which corresponds to a record.
var RecordItem = React.createClass({
    mixins: [CheckboxMixin, GoToBundleMixin],
    getInitialState: function() {
        return {};
    },

    handleClick: function(event) {
        this.props.setFocus(this.props.focusIndex, 0);
    },

    handleContextMenu: function(event) {
      this.props.setFocus(this.props.focusIndex, 0);
      this.props.handleContextMenu(this.props.item.bundle_info.uuid, event);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      return worksheetItemPropsChanged(this.props, nextProps);
    },

    render: function() {
        var item = this.props.item;
        var className = 'table table-record' + (this.props.focused ? ' focused' : '');
        var header = item.interpreted[0];
        var k = header[0];
        var v = header[1];
        var items = item.interpreted[1].map(function(item, index) {
            var ref = 'row' + index;
            return(
                <tr ref={ref} key={index}>
                    <th>
                        {item[k]}
                    </th>
                    <td>
                        {item[v]}
                    </td>
                </tr>
            )
        });
        return (
            <div className="ws-item" onClick={this.handleClick} onContextMenu={this.handleContextMenu}>
                <div className="type-record">
                    <table className={className}>
                        <tbody>
                            {items}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});
