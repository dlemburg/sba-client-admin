import { API, ROUTES } from './api';
import { IClientAdminAppStartupInfoResponse } from '../models/models';
import { AppFeatures } from './app-features';
import { AppViewData } from './app-data';
import { SocketIO } from './socket-io';


export class AppStartup {
    constructor(
        public API: API,
        public socketIO: SocketIO
    ) {

    }
    public getAppStartupInfo(companyOid: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.API.stack(ROUTES.getClientAdminAppStartupInfo, "POST", {companyOid})
                .subscribe(
                    (response) => {
                        const res: IClientAdminAppStartupInfoResponse = response.data.appStartupInfo;
                        const defaultImg = res.defaultImg;
                        const logoImg = res.logoImg;
                        const hasProcessOrder = res.hasProcessOrder;
                        const clientAdminVersionNumber = res.currentClientAdminVersionNumber;
                        const minClientAdminVersionNumber = res.minClientAdminVersionNumber;
                        const mustUpdateClientAdminApp = res.mustUpdateClientAdminApp;

                        console.log("response.data: ", response.data);

                        resolve({
                            defaultImg, 
                            logoImg, 
                            clientAdminVersionNumber, 
                            minClientAdminVersionNumber,
                            mustUpdateClientAdminApp,
                            hasProcessOrder
                        });

                    }, (err) => {
                        console.log("err: ", err);
                        resolve();
                        console.log("Problem downloading images on app startup");
                    });
                });
    }

    public initializeApp(data: IClientAdminAppStartupInfoResponse, companyOid, locationOid,) {
        AppViewData.setImgs({
            logoImgSrc: data.logoImg ? `${ROUTES.downloadImg}?img=${data.logoImg}` : "img/default.png",
            defaultImgSrc: data.defaultImg ? `${ROUTES.downloadImg}?img=${data.defaultImg}` : "img/default.png"
        });
        AppFeatures.setFeatures({
            hasProcessOrder: data.hasProcessOrder
        });

        const room = companyOid + locationOid;
        this.socketIO.connect(room);
    }
}
