(function () {

    var team1OptionsBoxChildren = document.getElementById("team1OptionsBox").children;
    var team2OptionsBoxChildren = document.getElementById("team2OptionsBox").children;

    for (var i = 0; i < team1OptionsBoxChildren.length; i++) {
        team1OptionsBoxChildren[i].addEventListener("click", function () {
            toggleOptionsBox(1)
        });
    }

    for (var i = 0; i < team2OptionsBoxChildren.length; i++) {
        team2OptionsBoxChildren[i].addEventListener("click", function () {
            toggleOptionsBox(2)
        });
    }

})()






var device;
let usbDeviceProperties = [{
    vendorId: 1240
    }];

let thebutton = document.getElementById('request-device');
thebutton.addEventListener('click', async () => {

    //var device;
    //let usbDeviceProperties = [{
    //    vendorId: 1240
    //}];
    try {

        navigator.usb.requestDevice({
                filters: usbDeviceProperties
            }).then(selectedDevice => {
                device = selectedDevice;
                console.log(device);
                console.log(device.productName);
                console.log(device.manufacturerName);
                return device.open()
            })

    } catch (error) {
        console.error('Error: ' + error.message);
    }


});

function TRYCONNECT(num) {

    try {
            device.selectConfiguration(1)
            .then(() => device.claimInterface(num))
            .then(() => device.controlTransferOut({
                requestType: 'class',
                recipient: 'interface',
                request: 0x22,
                value: 0x01,
                index: 0x02
            })) // Ready to receive data
            .then(() => device.transferIn(1, 64)) // Waiting for 64 bytes of data from endpoint #5.
            .then(result => {
                let decoder = new TextDecoder();
                console.log('Received: ' + decoder.decode(result.data));
            })
        //await device.transferOut(1, data);
        //let receivedData = await data.transferIn(1, 10);

    } catch (error) {
        console.error('Error: ' + error.message);
    }

}
