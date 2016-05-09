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
      online: true
    };
  },

  componentDidMount: function() {
    if (!navigator.onLine) return this.setState({online: false});

    /*
    util.getCookie('settings', (settings) => {
      if (settings && settings.mapSettings[0].checked) {
        this.setState({ mapid: 'bobbysud.79c006a5' });
      } else if (settings && settings.mapSettings[1].checked) {
        this.setState({ mapid:'bobbysud.j1o8j5bd' });
      } else if (settings && settings.mapSettings[3].checked) {
        this.setState({ mapid: settings.customMapId});
      }
      L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig';
      this.geocoder = L.mapbox.geocoder('mapbox.places');

      this.map = L.mapbox.map(this.refs.map.getDOMNode(), this.state.mapid, {
        zoomControl: false,
      });

      this.map.setMaxBounds([ [90, -180], [-90, 180] ]);

      this.map.on('moveend', (e) => {
          this.onGeocode();
          util.setCookie('location', null, [this.map.getCenter().lat, this.map.getCenter().lng, this.map.getZoom()]);
      });
      
    });
    */

    /*
    util.getCookie('settings', (settings) => {
      if (settings && settings.locationSettings[1].checked) {
        util.getCookie('location', (location) => {
          if (location) this.map.setView([location[0], location[1]], location[2]);
        });
      } else if (settings && settings.locationSettings[0].checked) {
        util.getCookie('location', (location) => {
          if (location) this.map.setView([location[0], location[1]], 16);
          this.map.on('locationerror', this.onLocationError);
          this.map.on('locationfound', this.onLocationFound);
          this.map.locate({
            setView: true,
            maxZoom: 16
          });
        });
      } else {
        var index = Math.floor(Math.random() * places.length - 1) + 1;
        var zoom = (this.state.mapid === 'bobbysud.79c006a5' && places[index].zoom > 14) ? 14 : places[index].zoom;
        this.map.setView([places[index].center[0], places[index].center[1]], zoom);
      }
    });

    */

    var place = this.getRandomPlace();
    var coordinates = [place.geometry.coordinates[1], place.geometry.coordinates[0]];

    var layer, zoom;

    if ((Math.floor(Math.random() * (3 - 1 + 1)) + 1) === 2) {
      zoom = 13;
      layer = 'ortokuva_3067';
    } else {
      zoom = 11;
      layer = 'peruskartta_3067';
    }

    this.map = L.map(this.refs.map.getDOMNode(), {
      crs: L.TileLayer.MML.get3067Proj(),
      continuousWorld: true,
      worldCopyJump: false,
      zoomControl: false
    }).setView(coordinates, zoom);

    L.tileLayer.mml(layer).addTo(this.map);
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

    util.setCookie('location', null, [self.map.getCenter().lat, self.map.getCenter().lng, 16]);
  },

  onGeocode: function() {
    this.geocoder.reverseQuery(this.map.getCenter(), (err, data) => {
      if (err || !data.features) return false;
      if (data.features[0] && data.features[0].place_name.split(',').length === 4) {
          var name = data.features[0].place_name.split(',')[0] + ', ' + data.features[0].place_name.split(',')[2] + ', ' + data.features[0].place_name.split(',')[3];
      } else if (data.features[0] && data.features[0].place_name.split(',').length === 5) {
          var name = data.features[0].place_name.split(',')[1] + ', ' + data.features[0].place_name.split(',')[3] + ', ' + data.features[0].place_name.split(',')[4];
      } else if (data.features[0]) {
          var name = data.features[0].place_name;
      }
      this.props.onGeocode(name);
    });
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
