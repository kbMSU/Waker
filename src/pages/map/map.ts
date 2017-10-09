import { Component } from '@angular/core';
import { NavController, ToastController, Events, ActionSheetController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker, Geocoder,
         GeocoderResult } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NativeAudio } from '@ionic-native/native-audio';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import { Observable } from 'rxjs/Observable';

import { AlarmDetails } from '../alarm-details/alarm-details';

import { Alarm } from '../../models/alarm';
import { AlarmService } from '../../services/alarm.service';
import { MathService } from '../../services/math.service';
import { BackgroundGeoService } from '../../services/background-geo.service';

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
  markers: Marker[];
  alarms: Alarm[];

  constructor(public navCtrl: NavController,
              private googleMaps: GoogleMaps,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              private alarmService: AlarmService,
              private actionSheetCtrl: ActionSheetController,
              public events: Events,
              private backgroundGeoService: BackgroundGeoService
              ) {
                this.geocoder = new Geocoder();
                this.alarms = [];
                this.markers = [];
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

    // When an alarm is deleted
    this.events.subscribe("alarm:deleted", () => {
      if(this.mapLoaded) {
        this.placeAlarmMarkers();
      }
    });
  }

  ionViewDidEnter() {
    if(this.alarmService.isUpdateAvailable() && this.mapLoaded) {
      this.placeAlarmMarkers();
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe("alarm:loaded");
    this.events.unsubscribe("alarm:deleted");
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
      for(var m of this.markers) {
        m.remove();
      }
      this.markers = [];
      this.alarms = [];
    }

    // Get alarms and poplate markers
    let alarms = this.alarmService.getAlarms();

    for(var a of alarms) {
      this.alarms.push(a);
      var iconUrl: string
      if(a.on) {
        iconUrl = 'www/assets/markers/marker-on.png'
      } else {
        iconUrl = 'www/assets/markers/marker-off.png'
      }
      let options: MarkerOptions = {
        position: a.position,
        title: a.title,
        draggable: false,
        snippet: 'Click here to view actions',
        icon: { url: iconUrl }
      }
      this.map.addMarker(options).then((marker: Marker) => {
        // Add marker and alarm to list
        this.markers.push(marker);
        // Click on marker and view details
        marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
          this.viewAlarmActions(marker);
        });
      });
    }

    if(this.shouldBackgroundGeoBeOn()) {
      this.backgroundGeoService.StartBackgroundGeo();
    } else {
      this.backgroundGeoService.StopBackgroundGeo();
    }
  }

  viewAlarmActions(marker: Marker) {
    var alarm: Alarm = null;
    for(var a of this.alarms) {
      if(a.title === marker.getTitle()) {
        alarm = a;
        break;
      }
    }

    if(!alarm) {
      this.showMessage("Could not find the matching alarm :(");
      return;
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose action for "'+alarm.title+'"',
      buttons: [
        {
          text: 'Update',
          icon: 'hammer',
          handler: () => {
            this.updateAlarm(alarm);
          }
        },{
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteAlarm(alarm);
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            // Do nothing
          }
        }
      ]
    });
    actionSheet.present();
  }

  addNewAlarm() {
    this.navCtrl.push(AlarmDetails,{
      address: this.currentAddress,
      position: this.currentPosition,
      isNew: true
    });
  }

  updateAlarm(alarm: Alarm) {
    this.navCtrl.push(AlarmDetails,{
      isNew: false,
      alarm: alarm
    });
  }

  deleteAlarm(alarm: Alarm) {
    this.alarmService.deleteAlarm(alarm);
  }

  shouldBackgroundGeoBeOn(): boolean {
    if(this.alarms == null || this.alarms.length == 0) {
      return false;
    } else {
      var anyActiveAlarm: boolean = false;
      for(var alarm of this.alarms) {
        if(alarm.on) {
          anyActiveAlarm = true;
          break;
        }
      }
      if(!anyActiveAlarm) {
        return false;
      }
    }

    return true;
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
