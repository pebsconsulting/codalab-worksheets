// Box that displays a few sample worksheets on the home page.

var SampleWorksheetsBox = React.createClass({
  getInitialState: function() {
    return {'data': []};
  },
   componentDidMount: function() {
     $.ajax({
       url: '/rest/worksheets/sample/',
       dataType: 'json',
       cache: false,
       success: function(data) {
         this.setState({'data': data});
       }.bind(this),
       error: function(xhr, status, err) {
         console.log(xhr, status, err);
       }.bind(this)
     });
   },
  render: function() {
    var worksheetNodes = this.state.data.map(function(worksheet) {
      var url = "/worksheets/" + worksheet.uuid + "/";
      return (
        <tr><td>
          <div className="frontpage-worksheets-list-item">
            <a target="_blank" href={url}>{worksheet.display_name}</a> by {worksheet.owner_name}
          </div>
        </td></tr>
      );
    });
    return (
      <table className="frontpage-worksheets-list">
        <tr><td>
          <div className="frontpage-worksheets-list-header">
            Example Worksheets
          </div> 
        </td></tr>
        {worksheetNodes}
      </table>
    );
  }
});

// Create and render it.
React.render(<SampleWorksheetsBox />, document.getElementById('sample_worksheets'));
