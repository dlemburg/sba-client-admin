import { API, ROUTES } from './api';
import { IClientAdminAppStartupInfoResponse } from '../models/models';
import { AppViewData } from './app-data';
import { SocketIO } from './socket-io';
import { NativeNotifications } from './native-notifications';


export class AppStartup {
    constructor(
        public API: API,
        public socketIO: SocketIO,
        public nativeNotifications: NativeNotifications
    ) { }
    public getAppStartupInfo(companyOid: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.API.stack(ROUTES.getClientAdminAppStartupInfo, "POST", {companyOid})
                .subscribe(
                    (response) => {
                        const data: IClientAdminAppStartupInfoResponse = response.data.appStartupInfo;
                        console.log("response.data: ", response.data);

                        resolve({
                            defaultImg: data.defaultImg,
                            logoImg: data.logoImg,
                            clientAdminVersionNumber: data.currentClientAdminVersionNumber, 
                            minClientAdminVersionNumber: data.minClientAdminVersionNumber,
                            mustUpdateClientAdminApp: data.mustUpdateClientAdminApp,
                            hasProcessOrder: data.hasProcessOrder
                        });

                    }, (err) => {
                        console.log("err: ", err);
                        resolve({
                            defaultImg: null,
                            logoImg: null,
                            clientAdminVersionNumber: null,
                            minClientAdminVersionNumber: null,
                            mustUpdateClientAdminApp: null,
                            hasProcessOrder: null
                        });
                        console.log("Problem downloading images on app startup");
                    });
                });
    }

    public initializeApp(data: IClientAdminAppStartupInfoResponse, companyOid, locationOid) {

        AppViewData.setImgs({
            logoImgSrc: data && data.logoImg ? `${ROUTES.downloadImg}?img=${data.logoImg}` : "img/default.png",
            defaultImgSrc: data && data.defaultImg ? `${ROUTES.downloadImg}?img=${data.defaultImg}` : "img/default.png"
        });
        AppViewData.setFeatures({
            hasProcessOrder: data.hasProcessOrder || false
        });

        if (locationOid) {
            const room = (companyOid + locationOid).toString();


            // app-wide socket listeners
            this.socketIO.connect().subscribe(room).on(this.socketIO.socketEvents.incomingNewOrder, [
                { type: this.nativeNotifications.types.vibrate, opts: undefined},
                { type: this.nativeNotifications.types.localNotifications, opts: {title: "Incoming Order-Ahead!", text: "You have a new order..." }},
                { type: this.nativeNotifications.types.sound, opts: undefined}
            ]);


        }
    }
}
