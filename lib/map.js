var React = require('react');
require('mapbox.js');
var L = require('leaflet');
var util = require('./util');
var places = require('./places.geojson').features;
var mapids = require('./mapids');

require('proj4leaflet');
require('./mmlLayers');

var Map = React.createClass({

  getInitialState: function() {
    return {
      mapid: this.props.randomMapId,
      geocodeResult: null,
      online: true,
      mapType: 'peruskartta_3067'
    };
  },

  componentDidMount: function() {
    if (!navigator.onLine) return this.setState({online: false});
    
    util.getCookie('settings', (settings) => {
      var mapType = this.state.mapType;

      if (settings && settings.mapSettings[0].checked) {
        this.setState({ mapType: 'ortokuva_3067' });
        mapType = 'ortokuva_3067';
      } else if (settings && settings.mapSettings[1].checked) {
        this.setState({ mapType: 'peruskartta_3067' });
        mapType = 'peruskartta_3067';
      } else {
        mapType = ((Math.floor(Math.random() * (3 - 1 + 1)) + 1) === 2) ? 'ortokuva_3067' : 'peruskartta_3067';
        this.setState({ mapType: mapType });
      }

      var place = this.getRandomPlace();
      var coordinates = [place.geometry.coordinates[1], place.geometry.coordinates[0]];
      var zoom = (this.state.mapType === 'ortokuva_3067') ? 13 : 11;

      this.map = L.map(this.refs.map.getDOMNode(), {
        crs: L.TileLayer.MML.get3067Proj(),
        continuousWorld: true,
        worldCopyJump: false,
        zoomControl: false
      }).setView(coordinates, zoom);

      L.tileLayer.mml(mapType).addTo(this.map);
    });
    
    util.getCookie('settings', (settings) => {
     if (settings && settings.locationSettings[1].checked) {
        util.getCookie('location', (location) => {
          if (location) this.map.setView([location[0], location[1]], location[2]);
        });
      } else if (settings && settings.locationSettings[0].checked) {
        util.getCookie('location', (location) => {
          if (location) this.map.setView([location[0], location[1]], 14);
          this.map.on('locationerror', this.onLocationError);
          this.map.on('locationfound', this.onLocationFound);
          this.map.locate({
            setView: true,
            maxZoom: 14
          });
        });
      }
    });
  },

  getRandomPlace: function() {
    var index = Math.floor(Math.random() * places.length - 1) + 1;
    return places[index];
  },

  onLocationFound: function(e) {
    var self = this;
    var icon = L.divIcon({
      className: 'location-icon',
      iconSize: [20, 20]
    });
    L.marker(e.latlng, {
        icon: icon,
        clickable: false
    }).addTo(self.map);

    util.setCookie('location', null, [self.map.getCenter().lat, self.map.getCenter().lng, 14]);
  },

  render: function() {
    return (
      <div>
        {this.state.online &&
          <div id='map' ref='map'></div>
        }
        {!this.state.online &&
          <img src='/assets/images/offline1.jpg' height='100%' width='100%'/>
        }
      </div>
    )
  }

});

module.exports = Map;
