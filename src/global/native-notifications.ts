import { Injectable } from '@angular/core';

import { Vibration } from '@ionic-native/vibration';
import { NativeAudio } from '@ionic-native/native-audio';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { Utils } from '../utils/utils';


@Injectable()
export class NativeNotifications {

types: any;
events: any;
constructor(public vibration: Vibration, public nativeAudio: NativeAudio, public utils: Utils, public localNotifications: LocalNotifications) { 

     this.types = {
        vibrate: "vibrate",
        localNotification: "localNotification",
        sound: "sound"
    }
    this.events = {
        vibrate: () => {
            return (duration = 2000, times = 4) => {
                let sequence = [];
                for (let x = 0; x < times; x++) {
                    sequence = [...sequence, duration];
                }
                this.vibration.vibrate(sequence);
            }
        },

        // simple sound only
        sound: () => {
            return (timeIncrement = 2000, times = 3, file = 'assets/audio/alert.mp3') => {
            
                let count = 0;
                let id = this.utils.generateRandomString();

                this.nativeAudio.preloadSimple(id, file).then(() => {
                   // this.nativeAudio.play(id); first tick?

                    let nativeAudioHandler = setInterval(() => {
                        if (count === times) {
                            clearInterval(nativeAudioHandler);
                            this.nativeAudio.unload(id).then(this.soundUnloadSuccessHandler, this.soundUnloadErrorHandler);
                        } else {
                            count++;
                            this.nativeAudio.play(id);
                        }
                    }, timeIncrement + 1);

                }, this.soundLoadErrorHandler);
            }
        },
        localNotification: () => {
            return (title = "Incoming Order-Ahead", text: "") => {
                let id: number = this.utils.generateRandomNumber();

                this.localNotifications.schedule([{
                    id: id,
                    title: title,
                    text: text,
                    data: { data: "some-data" }
                }]);
            }
        }
    }
}
    public create(notificationType: string): Function {
        console.log("notificationType: ", notificationType);
        return this.events[notificationType]();
    }

    private soundLoadErrorHandler(err) {
        console.log("load sound file error: ", err);
    }

    private soundUnloadErrorHandler(err) {
        console.log("unload sound file error: ", err);
    }

    private soundUnloadSuccessHandler() {
        console.log("unloaded sound file successfully");
    }

}