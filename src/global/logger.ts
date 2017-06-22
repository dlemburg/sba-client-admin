export const logger = (name:string, data:any = false) => {

    // send http request with error??? look up client side error logging
    
    if (data) console.log(`Here is the data for ${name}: `, data);
    else console.log(name);
}