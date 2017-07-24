import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'
import { SERVER_URL_CSHARP, SERVER_URL_NODE } from './global';
import * as io from "socket.io-client";
import { Authentication } from './authentication';
import { AuthUserInfo, SocketEvents}  from '../models/models';
import { NativeNotifications } from './native-notifications';

@Injectable()
export class SocketIO {
  private socket: SocketIOClient.Socket = null;
  private auth: AuthUserInfo;
  public socketEvents: SocketEvents;
  public socketOpts: any;

  constructor(public authentication: Authentication, public events: Events, public nativeNotifications: NativeNotifications ) {
    this.auth = this.authentication.getCurrentUser();
    this.socketEvents = {
        subscribe: "subscribe",
        unsubscribe: "unsubscribe",
        userPlacedNewOrder: "user-placed-new-order",
        incomingNewOrder: "incoming-new-order",
        alertUserProcessingOrder: "alert-user-processing-order",
        locationIsProcessingOrder: "location-is-processing-order"
    }
    this.socketOpts =  { reconnection: true, reconnectionAttempts: 10 };
   
  }

/*
 NOTE:  connects on app-start-up

*/
    /*
    @room: room to connect to on server
    */
    public connect(room: number = null) {
        if (!this.socket) {
            this.socket = io.connect(SERVER_URL_NODE, this.socketOpts);
            if (room) this.emit(this.socketEvents.subscribe, { room });

            // set listeners w/ the notification types
            this.on(this.socketEvents.incomingNewOrder, [
                this.nativeNotifications.types.vibrate, 
                this.nativeNotifications.types.localNotifications, 
                this.nativeNotifications.types.sound
            ]);

            /* subscriber pattern
            this.subscriber$ = this.on(this.events.incomingNewOrder).subscribe((data) => {
                // cordova sound, vibrate
            });
            */
        }
    }

    public disconnect() {
        const room = this.auth.companyOid + this.auth.locationOid;

        if (this.socket) {
            this.emit(this.socketEvents.unsubscribe, {room});
            this.socket.removeAllListeners();
            this.socket.disconnect();
        }
    }

    /*
    @socketEvent:  the type of socket event emitted to the server
    @notifications: the types of native notifications that will be triggered
    */
    public on(socketEvent: string, notifications: Array<string> = []) {
        this.socket.on(socketEvent, (data) => {
            notifications.forEach((x) => {
               // 2nd fn invokation (closure) allows params specific to that notification
               let notify = this.nativeNotifications.create(x)();

            });
            this.publishEventToClientListeners(socketEvent, data);
        });
    }

    public emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }

    public publishEventToClientListeners(event: string, data) {
        this.events.publish(event, data);
    }
}