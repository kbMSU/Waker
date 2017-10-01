import { Component } from '@angular/core';
import { NavController, ToastController, Events, ActionSheetController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng,
         CameraPosition, MarkerOptions, Marker, Geocoder,
         GeocoderResult } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';

import { AlarmDetails } from '../alarm-details/alarm-details';

import { Alarm } from '../../models/alarm';
import { AlarmMarker } from '../../models/alarmMarker';
import { AlarmService } from '../../services/alarm.service';

import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

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
  //alarms: AlarmMarker[];
  markers: Marker[];
  alarms: Alarm[];
  backgroundGeoStarted: boolean = false;

  constructor(public navCtrl: NavController,
              private googleMaps: GoogleMaps,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              private alarmService: AlarmService,
              private actionSheetCtrl: ActionSheetController,
              private backgroundGeo: BackgroundGeolocation,
              public events: Events
              ) {
                this.geocoder = new Geocoder();
                this.alarms = [];
                this.markers = [];
                //this.alarms = this.alarmService.getAlarms();
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

    if(!this.backgroundGeoStarted) {
      this.startBackgroundGeo();
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

  startBackgroundGeo() {
    // Start the background geolocation for the alarms
    const config: BackgroundGeolocationConfig = {
          desiredAccuracy: 10,
          stationaryRadius: 20,
          distanceFilter: 30,
          debug: false, //  enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };

    if(this.alarms == null || this.alarms.length == 0) {
      this.backgroundGeo.stop();
      this.backgroundGeoStarted = false;
      return;
    }

    this.backgroundGeo.configure(config)
      .subscribe((location: BackgroundGeolocationResponse) => {
        console.log(location);
        //this.showMessage("BGL - Number of alarms : "+this.alarms.length);

        let lat1 = location.latitude;
        let lon1 = location.longitude;

        for(var alarm of this.alarms) {
          //this.showMessage("Alarm : "+alarm.title);
          if(alarm.on) {
            //this.showMessage("Alarm is on");
            let lat2 = alarm.position.lat;
            let lon2 = alarm.position.lng;
            let distance = this.calculateDistance(lat1,lon1,lat2,lon2);
            if(distance < alarm.distance * 1000) {
              // We are within distance
              this.showMessage("We are WITHIN range, distance is : "+distance);
            } else {
              this.showMessage("We are OUTSIDE range, distance is : "+distance);
            }
          }
        }

        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
        // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        this.backgroundGeo.finish(); // FOR IOS ONLY

    });

    // start recording location
    this.backgroundGeo.start();
    this.backgroundGeoStarted = true;
  }

  calculateDistance(lat1:number,lon1:number,lat2:number,lon2:number): number {
    var R = 6371e3; // metres
    var φ1 = lat1*Math.PI/180;
    var φ2 = lat2*Math.PI/180;
    var Δφ = (lat2-lat1)*Math.PI/180;
    var Δλ = (lon2-lon1)*Math.PI/180;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;

    return d;
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
