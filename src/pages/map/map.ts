import { Component } from '@angular/core';
import { NavController, ToastController, Events } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker, Geocoder,
         GeocoderResult } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';

import { AlarmDetails } from '../alarm-details/alarm-details';

import { Alarm } from '../../models/alarm';
import { AlarmMarker } from '../../models/alarmMarker';
import { AlarmService } from '../../services/alarm.service';

@Component({
  selector: 'alarm-map',
  templateUrl: 'map.html'
})
export class AlarmMap {
  mapLoaded = false;
  map: GoogleMap;
  currentAddress = "Getting Address ...";
  geocoder: Geocoder;
  currentPosition: LatLng;
  newAlarmMarker: Marker = null;
  alarms: AlarmMarker[];

  constructor(public navCtrl: NavController,
              private googleMaps: GoogleMaps,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              private alarmService: AlarmService,
              public events: Events
              ) {
                this.geocoder = new Geocoder();
                this.alarms = [];
              }

  ionViewDidLoad() {
    this.loadMap();
  }

  ionViewWillEnter() {
    // Set up a subscription to get future alarms
    this.events.subscribe("alarm:loaded", () => {
      if(this.mapLoaded) {
        this.placeAlarmMarkers();
      }
    });

    if(this.mapLoaded) {
      this.placeAlarmMarkers();
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe("alarm:loaded");
  }

  loadMap() {
    // Create the map
    let element: HTMLElement = document.getElementById('map');
    this.map = this.googleMaps.create(element);

    // When map is ready go to the current location and set alarm markers
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapLoaded = true;

      // Create the new alarm markers
      let options: MarkerOptions = {
        draggable: true,
        icon: { url: 'www/assets/markers/newAlarmMarker.png' }
      }
      this.map.addMarker(options).then((marker: Marker) => {
        marker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe((position: LatLng) => {
          this.goToLocation(position.lat,position.lng,true);
        });
        this.newAlarmMarker = marker;
      });

      this.goToCurrentLocation();
      this.placeAlarmMarkers();
    });

    // Change map center
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((latlng: LatLng) => {
      if(this.mapLoaded) {
        this.goToLocation(latlng.lat,latlng.lng,true);
      }
    });
  }

  goToCurrentLocation() {
    this.geolocation.getCurrentPosition().then((resp: Geoposition) => {
      let lat = resp.coords.latitude;
      let long = resp.coords.longitude;
      this.goToLocation(lat,long,false);
    }).catch((error) => {
      this.showMessage(error);
    });
  }

  goToLocation(lat: number, lng: number, animate: boolean) {
    let location = new LatLng(+lat,+lng);
    this.updateAddress(location);
    this.currentPosition = location;
    this.newAlarmMarker.setPosition(location);

    let mapPosition: CameraPosition = {
      target: location,
      zoom: 15
    }
    if(animate) {
      this.map.animateCamera({
        target: location,
        zoom: 15,
        duration: 1000
      });
    } else {
      this.map.moveCamera(mapPosition);
    }
  }

  updateAddress(latln: LatLng) {
    this.currentAddress = "Getting address ...";
    this.geocoder.geocode({'position':latln}).then((results: [GeocoderResult]) => {
      if(results.length > 0) {
        let result = results[0];
        this.currentAddress = result.subThoroughfare + " " + result.thoroughfare;
      } else {
        this.currentAddress = "Address not found ...";
      }
    }).catch((error) => {
      this.showMessage(error);
    });
  }

  placeAlarmMarkers() {
    // Clear existing markers
    if(this.alarms) {
      for(var alarm of this.alarms) {
        alarm.marker.remove();
      }
      this.alarms = [];
    }

    //this.showMessage("called placeAlarmMarkers");

    // Get alarms and poplate markers
    let alarms = this.alarmService.getAlarms();

    //this.showMessage("called placeAlarmMarkers");

    for(var a of alarms) {
      let options: MarkerOptions = {
        position: a.position,
        title: a.title,
        draggable: false
      }
      this.map.addMarker(options).then((marker: Marker) => {
        // Add marker and alarm to list
        this.alarms.push(new AlarmMarker(a,marker));
        // Click on marker and view details
        // ## TODO ##
      });
    }
  }

  viewAlarmDetails() {
    // If alarm marker is clicked then show the alarm details
  }

  addNewAlarm() {
    this.navCtrl.push(AlarmDetails,{
      address: this.currentAddress,
      position: this.currentPosition,
      isNew: true
    });
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
