import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker, Geocoder,
         GeocoderResult } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';

import { Alarm } from '../../models/alarm';
import { AlarmService } from '../../services/alarm.service';

@Component({
  selector: 'alarm-map',
  templateUrl: 'map.html'
})
export class AlarmMap {
  mapLoaded: boolean = false;
  map: GoogleMap;
  currentAddress: string = "Getting Address ...";
  geocoder: Geocoder;
  alarms: [{alarm: Alarm, marker: Marker}];

  constructor(private navCtrl: NavController,
              private googleMaps: GoogleMaps,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              private alarmService: AlarmService
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

  loadMap() {
    // Create the map
    let element: HTMLElement = document.getElementById('map');
    this.map = this.googleMaps.create(element);

    // When map is ready go to the current locatio and set alarm markers
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapLoaded = true;
      this.goToCurrentLocation();
      this.placeAlarmMarkers();
    });

    // If map is panned update address
    this.map.on(GoogleMapsEvent.CAMERA_CHANGE).subscribe((position) => {
      if(this.mapLoaded) {
        this.updateAddress(position);
      }
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
    this.alarmService.getAlarms().then(alarms => {
      for(var alarm of alarms) {
        let options: MarkerOptions = {
          position: alarm.position,
          title: alarm.title
        }
        this.map.addMarker(options).then((marker: Marker) => {
          marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            // Show marker information
          });
          this.alarms.push({alarm: alarm,marker: marker});
        });
      }
    });
  }

  addNewAlarm() {
    // Add a new alarm
  }

  viewAlarmDetails() {
    // If alarm marker is clicked then show the alarm details
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
