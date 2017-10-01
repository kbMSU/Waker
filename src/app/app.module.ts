import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AlarmMap } from '../pages/map/map';
import { AlarmList } from '../pages/alarm-list/alarm-list';
import { Settings } from '../pages/settings/settings';
import { AlarmDetails } from '../pages/alarm-details/alarm-details';
import { AlarmService } from '../services/alarm.service';

import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '8cfef068'
  }
};

@NgModule({
  declarations: [
    MyApp, HomePage, AlarmMap, AlarmList, Settings, AlarmDetails
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    CloudModule.forRoot(cloudSettings)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, HomePage, AlarmMap, AlarmList, Settings, AlarmDetails
  ],
  providers: [
    StatusBar, GoogleMaps, SplashScreen, BackgroundGeolocation, Geolocation, AlarmService, NativeAudio,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
