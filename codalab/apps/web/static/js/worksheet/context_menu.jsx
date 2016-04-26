var menuEvents = new EventEmitter();
var ContextMenuMixin = {
  // ContextMenuMixin.openContextMenu('bundle', this.handleContextMenuSelection.bind(undefined, uuid))
  openContextMenu: function(type, callback){
    menuEvents.emit('open', {
      type: type,
      callback: callback,
    });
  },
  closeContextMenu: function(){
    menuEvents.emit('close');
  }
};

var mouse = {x: 0, y: 0};
var updateMouse = function(e){
  mouse.x = e.pageX;
  mouse.y = e.pageY;
};

var ContextMenu = React.createClass({
  getInitialState: function(){
    var bundleMap = {
      'rm': 'Remove bundle permanently',
      'detach': 'Detach from this worksheet',
      'add bundle': 'Add to my home worksheet'
    };
    var runBundleMap = _.extend({}, bundleMap, {'kill': 'Kill this run bundle'});
    return {
      type: null,
      callback: null,
      labelMap: {
        'run': runBundleMap,
        'bundle': bundleMap
      }
    };
  },

  componentDidMount: function(){
    menuEvents.on('open', this.handleOpenEvent);
    menuEvents.on('close', this.closeMenu);
    addEventListener('mousemove', updateMouse);
    document.onclick = ContextMenuMixin.closeContextMenu;
  },

  handleOpenEvent: function(payload){
    this.setState(_.extend(payload, mouse));
    $('.ws-container').css({'overflow': 'hidden'});
  },

  closeMenu: function(){
    this.replaceState(this.getInitialState());
    $('.ws-container').css({'overflow': 'auto'});
  },

  render: function(){
    if (!this.state.type) {
      return null;
    }
    // estimate of the height and weight of the context menu
    var height = 32 * Object.keys(this.state.labelMap[this.state.type]).length;
    var width = 250;
    var style = {
      left: Math.min(this.state.x, window.innerWidth - width),
      // avoid overflow below the window limit (30 is the height of the bottom bar)
      top: Math.min(this.state.y, window.innerHeight - height - 30),
      position: 'fixed'
    };

    return (
      <div className="context-menu" style={style}>
        {Object.keys(this.state.labelMap[this.state.type]).map(function(x, i){
            return <div className="context-menu-item" key={i} onClick={this.makeClickHandler(x)}>
                    {this.state.labelMap[this.state.type][x]}
                   </div>
          }, this)}
      </div>
    );
  },

  makeClickHandler: function(option) {
    return function(){
      if (this.state.callback) {
        this.state.callback(option);
        this.replaceState(this.getInitialState());
      }
    }.bind(this);
  }
});
