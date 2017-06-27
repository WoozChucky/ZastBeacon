//
// Created by nuno on 20-06-2017.
//


#include <cstring>
#include "../Headers/USBManager.h"


USBManager::USBManager() {

}

USBManager::~USBManager() {
    if(_devices != nullptr){
        libusb_free_device_list(_devices, 1); //free the list, unref the arrays in it
    }
    if(_device_handle != nullptr) {
        libusb_release_interface(_device_handle, 0); //release the claimed interface
        libusb_close(_device_handle); //close the device we opened
    }
    libusb_exit(_context); //close the session
}

void USBManager::initialize() {
    _result = libusb_init(&_context);

    if(_result < 0) {
        perror("LibUSB Init Error: ");
        throw "LibUSB Init Error";
    }

    libusb_set_debug(_context, 4); //set verbosity level to 3, as suggested in the documentation
}

void USBManager::scanDevices() {

    _deviceCount = libusb_get_device_list(_context, &_devices); //get the list of devices
    if(_deviceCount < 0) {
        perror("Get Device Error: ");
        throw "Get Device Error";
    }

    cout<<_deviceCount<<" Devices in list."<<endl; //print total number of usb devices

    if(ITERATE) {
        ssize_t i; //for iterating through the list

        for(i = 0; i < _deviceCount; i++) {
            printDeviceInfo(_devices[i]); //print specs of this device
        }
    }
}

void USBManager::printDeviceInfo(libusb_device *dev) {
    libusb_device_descriptor desc;
    int r = libusb_get_device_descriptor(dev, &desc);
    if (r < 0) {
        cout<<"failed to get device descriptor"<<endl;
        return;
    }
    cout<<"Number of possible configurations: "<<(int)desc.bNumConfigurations<<"  ";
    cout<<"Device Class: "<<(int)desc.bDeviceClass<<"  ";
    cout<<"VendorID: "<<desc.idVendor<<"  ";
    cout<<"ProductID: "<<desc.idProduct<<endl;
    libusb_config_descriptor *config;
    libusb_get_config_descriptor(dev, 0, &config);
    cout<<"Interfaces: "<<(int)config->bNumInterfaces<<" ||| ";
    const libusb_interface *inter;
    const libusb_interface_descriptor *interdesc;
    const libusb_endpoint_descriptor *epdesc;
    for(int i=0; i<(int)config->bNumInterfaces; i++) {
        inter = &config->interface[i];
        cout<<"Number of alternate settings: "<<inter->num_altsetting<<" | ";
        for(int j=0; j<inter->num_altsetting; j++) {
            interdesc = &inter->altsetting[j];
            cout<<"Interface Number: "<<(int)interdesc->bInterfaceNumber<<" | ";
            cout<<"Number of endpoints: "<<(int)interdesc->bNumEndpoints<<" | ";
            for(int k=0; k<(int)interdesc->bNumEndpoints; k++) {
                epdesc = &interdesc->endpoint[k];
                cout<<"Descriptor Type: "<<(int)epdesc->bDescriptorType<<" | ";
                cout<<"EP Address: "<<(int)epdesc->bEndpointAddress<<" | ";
            }
        }
    }
    cout<<endl<<endl<<endl;
    libusb_free_config_descriptor(config);
}

void USBManager::closeDevice() {
    if(_device_handle == nullptr){
        throw "Device handle is already closed!";
    }
    libusb_release_interface(_device_handle, 0); //release the claimed interface
    libusb_close(_device_handle); //close the device we opened
}

void USBManager::shutdown() {
    if(_device_handle != nullptr) {
        throw "closeDevice() must be called before shutdown() when device handle is open!";
    }

    if(_devices != nullptr){
        libusb_free_device_list(_devices, 1); //free the list, unref the arrays in it
    }
    libusb_exit(_context); //close the session
}

void USBManager::connect(int index) {

    libusb_device_descriptor desc;

    _result = libusb_get_device_descriptor(_devices[index], &desc);
    if(_result < 0) {
        perror("libusb_get_device_descriptor error: ");
        throw "Error getting selected device descriptor";
    }

    _device_handle = libusb_open_device_with_vid_pid(_context, desc.idVendor, desc.idProduct); //these are vendorID and productID I found for my usb device

    if(_device_handle == nullptr) {
        perror("Cannot open device: ");
        throw "Cannot open device";
    } else {
        cout << "Device is now open" << endl;
    }

    libusb_free_device_list(_devices, 1); //free the list, unref the devices in it
    cout << "Rest of devices are now freed" << endl;

    if(libusb_kernel_driver_active(_device_handle, 0) == 1) { //find out if kernel driver is attached
        cout<<"Kernel Driver Active"<<endl;
        if(libusb_detach_kernel_driver(_device_handle, 0) == 0) //detach it
            cout<<"Kernel Driver Detached!"<<endl;
    } else {
        cout << "Kernel driver available" << endl;
    }

    _result = libusb_claim_interface(_device_handle, 0); //claim interface 0 (the first) of device (mine had jsut 1)
    if(_result < 0) {
        perror("Cannot Claim Interface: ");
        throw "Cannot Claim Interface";
    }
    cout<<"Claimed Interface"<<endl;
}

int USBManager::openGate(struct ZaBeaconCommand command) {

    memset(_buffer, 0, sizeof(_buffer)); // clear buffer

    memcpy(_buffer, &command, sizeof(struct ZaBeaconCommand)); // copy command to buffer

    int structSize = sizeof(struct ZaBeaconCommand);

    _result = libusb_bulk_transfer(_device_handle, USB_ENDPOINT_OUT, _buffer, structSize, &_bytesWritten, 0);

    if(_result == 0 && _bytesWritten == structSize) {
        cout<<"Request sent via USB Successfully!"<<endl;

        memset(_buffer, 0, sizeof(_buffer)); // clear buffer

        _result = libusb_bulk_transfer(_device_handle, USB_ENDPOINT_IN, _buffer, sizeof(_buffer), &_bytesRead, 0);

        if(_result == 0) { //we read the bytes successfully
            cout << "Read via USB Successfully!" << endl;

            return atoi((const char *) _buffer);
        }
        else {
            cout<<"Read " << _bytesRead << " bytes." << " Expected " << sizeof(_buffer) << " bytes." << endl;
            fprintf(stderr, "Error during control transfer: %s\n",
                    libusb_error_name(_result));
            return -1;
        }
    }
    else {
        cout<<"Wrote " << _bytesWritten << " bytes." << " Expected " << structSize << " bytes." << endl;
        fprintf(stderr, "Error during control transfer: %s\n",
                libusb_error_name(_result));
        return -1;
    }

}


