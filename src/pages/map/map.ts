import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker } from '@ionic-native/google-maps';

@Component({
  selector: 'alarm-map',
  templateUrl: 'map.html',
})
export class AlarmMap {
  constructor(private navCtrl: NavController,
              private googleMaps: GoogleMaps) {}

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap() {
    let element: HTMLElement = document.getElementById('map');
    let map: GoogleMap = this.googleMaps.create(element);

    map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.placeAlarmMarkers();
    });
  }

  placeAlarmMarkers() {

  }
}
