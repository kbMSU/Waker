import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker, Geocoder,
         GeocoderResult } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';

import { AlarmDetails } from '../alarm-details/alarm-details';

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
  currentPosition: LatLng;
  alarms: [{marker: Marker, alarm: Alarm}];

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
      this.refreshAlarms();
    }
  }

  loadMap() {
    // Create the map
    let element: HTMLElement = document.getElementById('map');
    this.map = this.googleMaps.create(element);

    // When map is ready go to the current location and set alarm markers
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapLoaded = true;
      this.goToCurrentLocation();
      this.placeAlarmMarkers();
    });

    // Change map center
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((latlng: LatLng) => {
      this.goToLocation(latlng.lat,latlng.lng);
    });
  }

  goToCurrentLocation() {
    this.geolocation.getCurrentPosition().then((resp: Geoposition) => {
      let lat = resp.coords.latitude;
      let long = resp.coords.longitude;
      this.goToLocation(lat,long);
    }).catch((error) => {
      this.showMessage(error);
    });
  }

  goToLocation(lat: number, lng: number) {
    let location = new LatLng(+lat,+lng);
    let mapPosition: CameraPosition = {
      target: location,
      zoom: 15
    }
    this.currentPosition = location;
    this.map.moveCamera(mapPosition);
    this.updateAddress(location);
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
          // Click on marker and view details
        });
      }
    });
  }

  refreshAlarms() {
    // Refresh alarms if needed
  }

  viewAlarmDetails() {
    // If alarm marker is clicked then show the alarm details
  }

  addNewAlarm() {
    this.navCtrl.push(AlarmDetails,{name:this.currentAddress,location:this.currentPosition,isNew:true});
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
