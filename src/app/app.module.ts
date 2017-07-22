import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AlarmMap } from '../pages/map/map';
import { AlarmList } from '../pages/alarm-list/alarm-list';
import { Settings } from '../pages/settings/settings';

import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { GoogleMaps } from '@ionic-native/google-maps';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '8cfef068'
  }
};

@NgModule({
  declarations: [
    MyApp, HomePage, AlarmMap, AlarmList, Settings
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, HomePage, AlarmMap, AlarmList, Settings
  ],
  providers: [
    StatusBar, GoogleMaps,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
