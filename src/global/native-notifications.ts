import { Injectable } from '@angular/core';

import { Vibration } from '@ionic-native/vibration';
import { NativeAudio } from '@ionic-native/native-audio';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { Utils } from '../utils/utils';


@Injectable()
export class NativeNotifications {

types: any;
events: any;

constructor(public vibration: Vibration, public nativeAudio: NativeAudio, public localNotifications: LocalNotifications) { 

    this.types = {
        vibrate: "vibrate",
        localNotifications: "localNotifications",
        sound: "sound"
    }
    this.events = {
        vibrate: () => {
            return (opts: any = {duration: 2000, times: 4}) => {
                let sequence = [];
                for (let x = 0; x < opts.times; x++) {
                    sequence = [...sequence, opts.duration];
                }
                this.vibration.vibrate(sequence);
            }
        },

        // simple sound only
        sound: () => {
            return (opts: any = {file: 'assets/audio/alert.mp3', timeIncrement: 2000, times: 3}) => {
            
                let count = 0;
                let id = Utils.generateRandomString();

                this.nativeAudio.preloadSimple(id, opts.file).then(() => {
                   // this.nativeAudio.play(id); first tick?

                    let nativeAudioHandler = setInterval(() => {
                        if (count === opts.times) {
                            clearInterval(nativeAudioHandler);
                            this.nativeAudio.unload(id).then(this.soundUnloadSuccessHandler, this.soundUnloadErrorHandler);
                        } else {
                            count++;
                            this.nativeAudio.play(id);
                        }
                    }, opts.timeIncrement + 1);

                }, this.soundLoadErrorHandler);
            }
        },
        localNotifications: () => {
            return (opts: any = {title: "Incoming Order-Ahead", text: ""}) => {
                const id: number = Utils.generateRandomNumber();

                this.localNotifications.schedule([{
                    id: id,
                    title: opts.title,
                    text: opts.text,
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


    // handlers
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