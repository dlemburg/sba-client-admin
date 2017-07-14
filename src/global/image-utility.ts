import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
import { AppViewData } from './app-data';

export class ImageUtility {
    constructor(    
    private camera: Camera, 
    private transfer: Transfer, 
    private file: File,
    private platform: Platform) {}

    getImgCordova(cameraOptions: CameraOptions = {}): Promise<{imageData: string}> {
        return new Promise((resolve, reject) => {
            const options: CameraOptions = {
                quality: cameraOptions.quality || 100,
                targetHeight: cameraOptions.targetHeight || 238,
                targetWidth: cameraOptions.targetWidth || 423,
                destinationType: cameraOptions.destinationType || this.camera.DestinationType.FILE_URI,
                encodingType: cameraOptions.encodingType || this.camera.EncodingType.JPEG,
                mediaType: cameraOptions.mediaType || this.camera.MediaType.PICTURE,
                sourceType: cameraOptions.sourceType || 2
            }

            this.platform.ready().then(() => {
                this.camera.getPicture(options).then((imageData) => {
                    console.log("imageData, ", imageData);
                    resolve({imageData});
                })
            })
            .catch((err) => {
                reject(err);
            });

        });
  }

  uploadImg(fileKey: string, img: string, imgSrc: string, route: string): Promise<{message: string}> {

    return new Promise((resolve, reject) => {
        let failedUploadImgAttempts = 0;
        let message = "Uploaded Successfully!";
        let options: FileUploadOptions = {
          fileKey: fileKey, 
          fileName: img,        
          headers: {}
        };
        const fileTransfer: TransferObject = this.transfer.create();

        this.platform.ready().then(() => {
            fileTransfer.upload(imgSrc, route, options).then((data) => {
                console.log("uploaded successfully... ");
                resolve({message});
            }).catch((err) => {
                console.log("rejecting from uploadImg");
                reject(err);
            });
        })
    });
  }

}