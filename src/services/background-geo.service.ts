import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { BackgroundGeolocation, BackgroundGeolocationConfig,
         BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { Alarm } from '../models/alarm';
import { AlarmService } from './alarm.service';
import { MathService } from './math.service';
import { NativeAudio } from '@ionic-native/native-audio';

@Injectable()
export class BackgroundGeoService {
  private backgroundGeoStarted: boolean = false;
  private alarms: Alarm[];

  constructor(private backgroundGeo: BackgroundGeolocation,
              private alarmService: AlarmService,
              private mathService: MathService,
              private nativeAudio: NativeAudio,
              private toastCtrl: ToastController) {
                this.alarms = this.alarmService.getAlarms();
                this.nativeAudio.preloadSimple('alarmSound', 'assets/sounds/alarm.wav').catch((error) => {
                  this.showMessage("There was an error loading the alarm sound");
                });
              }

  public StopBackgroundGeo() {
    this.backgroundGeo.stop();
    this.backgroundGeoStarted = false;
  }

  public StartBackgroundGeo() {
    if(this.backgroundGeoStarted) {
      return;
    }

    // Start the background geolocation for the alarms
    const config: BackgroundGeolocationConfig = {
          desiredAccuracy: 10,
          stationaryRadius: 10,
          distanceFilter: 10,
          debug: false, //  enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };

    this.backgroundGeo.configure(config)
      .subscribe((location: BackgroundGeolocationResponse) => {
        console.log(location);

        let lat1 = location.latitude;
        let lon1 = location.longitude;

        for(var alarm of this.alarms) {
          if(alarm.on) {
            let lat2 = alarm.position.lat;
            let lon2 = alarm.position.lng;
            let distance = this.mathService.CalculateDistance(lat1,lon1,lat2,lon2);
            if(distance < alarm.distance * 1000) {
              // We are within distance
              // Play the sound
              this.nativeAudio.play('alarmSound');
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

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
