import { API, ROUTES } from './api';
import { IClientAdminAppStartupInfoResponse } from '../models/models';
import { AppViewData } from './app-data';
import { SocketIO } from './socket-io';


export class AppStartup {
    constructor(
        public API: API,
        public socketIO: SocketIO
    ) { }
    public getAppStartupInfo(companyOid: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.API.stack(ROUTES.getClientAdminAppStartupInfo, "POST", {companyOid})
                .subscribe(
                    (response) => {
                        const res: IClientAdminAppStartupInfoResponse = response.data.appStartupInfo;
                        console.log("response.data: ", response.data);

                        resolve({
                            defaultImg: res.defaultImg,
                            logoImg: res.logoImg,
                            clientAdminVersionNumber: res.currentClientAdminVersionNumber, 
                            minClientAdminVersionNumber: res.minClientAdminVersionNumber,
                            mustUpdateClientAdminApp: res.mustUpdateClientAdminApp,
                            hasProcessOrder: res.hasProcessOrder
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
            const room = companyOid + locationOid;
            this.socketIO.connect(room);
        }
    }
}
