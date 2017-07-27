import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker, Geocoder,
         GeocoderResult } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'alarm-map',
  templateUrl: 'map.html'
})
export class AlarmMap {
  mapLoaded: boolean = false;
  map: GoogleMap;
  currentAddress: string = "Getting Address ...";
  geocoder: Geocoder;

  constructor(private navCtrl: NavController,
              private googleMaps: GoogleMaps,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              ) {
                this.geocoder = new Geocoder();
              }

  ionViewDidLoad() {
    this.loadMap();
  }

  ionViewWillEnter() {
    if(this.mapLoaded) {
      this.goToCurrentLocation();
    }
  }

  loadAlarms() {

  }

  loadMap() {
    let element: HTMLElement = document.getElementById('map');
    this.map = this.googleMaps.create(element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapLoaded = true;
      this.goToCurrentLocation();
    });

  }

  goToCurrentLocation() {
    this.geolocation.getCurrentPosition().then((resp: Geoposition) => {
      let lat = resp.coords.latitude;
      let long = resp.coords.longitude;
      let location = new LatLng(+lat,+long);
      let mapPosition: CameraPosition = {
        target: location,
        zoom: 15
      }
      this.map.moveCamera(mapPosition);
      this.updateAddress(location);
    }).catch((error) => {
      this.showMessage(error);
    });
  }

  updateAddress(latln: LatLng) {
    this.geocoder.geocode({'position':latln}).then((results: [GeocoderResult]) => {
      if(results.length > 0) {
        let result = results[0];
        this.currentAddress = result.subThoroughfare + " " +
                              result.thoroughfare;
      } else {
        this.currentAddress = "Address not found ...";
      }
    }).catch((error) => {
      this.showMessage(error);
    });
  }

  placeAlarmMarkers() {

  }

  addNewAlarm() {

  }

  viewAlarmDetails() {

  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
