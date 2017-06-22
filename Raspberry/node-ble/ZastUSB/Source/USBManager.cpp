//
// Created by nuno on 20-06-2017.
//


#include <cstring>
#include "../Headers/USBManager.h"

USBManager::USBManager() {

}

USBManager::~USBManager() {
    delete [] buffer;
    if(devices != nullptr){
        libusb_free_device_list(devices, 1); //free the list, unref the arrays in it
    }
    if(device_handle != nullptr) {
        libusb_release_interface(device_handle, 0); //release the claimed interface
        libusb_close(device_handle); //close the device we opened
    }
    libusb_exit(context); //close the session
}

void USBManager::initialize() {
    result = libusb_init(&context);

    if(result < 0) {
        perror("LibUSB Init Error: ");
        throw "LibUSB Init Error";
    }

    libusb_set_debug(context, 3); //set verbosity level to 3, as suggested in the documentation
}

void USBManager::scanDevices() {

    deviceCount = libusb_get_device_list(context, &devices); //get the list of devices
    if(deviceCount < 0) {
        perror("Get Device Error: ");
        throw "Get Device Error";
    }

    cout<<deviceCount<<" Devices in list."<<endl; //print total number of usb devices

    if(ITERATE) {
        ssize_t i; //for iterating through the list

        for(i = 0; i < deviceCount; i++) {
            printDeviceInfo(devices[i]); //print specs of this device
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
    if(device_handle == nullptr){
        throw "Device handle is already closed!";
    }
    libusb_release_interface(device_handle, 0); //release the claimed interface
    libusb_close(device_handle); //close the device we opened
}

void USBManager::shutdown() {
    if(device_handle != nullptr) {
        throw "closeDevice() must be called before shutdown() when device handle is open!";
    }

    if(devices != nullptr){
        libusb_free_device_list(devices, 1); //free the list, unref the arrays in it
    }
    libusb_exit(context); //close the session
}

void USBManager::connect(int index) {

    libusb_device_descriptor desc;

    result = libusb_get_device_descriptor(devices[index], &desc);
    if(result < 0) {
        perror("libusb_get_device_descriptor error: ");
        throw "Error getting selected device descriptor";
    }

    device_handle = libusb_open_device_with_vid_pid(context, desc.idVendor, desc.idProduct); //these are vendorID and productID I found for my usb device

    if(device_handle == nullptr) {
        perror("Cannot open device: ");
        throw "Cannot open device";
    } else {
        cout << "Device is now open" << endl;
    }

    libusb_free_device_list(devices, 1); //free the list, unref the devices in it
    cout << "Rest of devices are now freed" << endl;

    if(libusb_kernel_driver_active(device_handle, 0) == 1) { //find out if kernel driver is attached
        cout<<"Kernel Driver Active"<<endl;
        if(libusb_detach_kernel_driver(device_handle, 0) == 0) //detach it
            cout<<"Kernel Driver Detached!"<<endl;
    } else {
        cout << "Kernel driver available" << endl;
    }

    result = libusb_claim_interface(device_handle, 0); //claim interface 0 (the first) of device (mine had jsut 1)
    if(result < 0) {
        perror("Cannot Claim Interface: ");
        throw "Cannot Claim Interface";
    }
    cout<<"Claimed Interface"<<endl;
}

void USBManager::writeData(struct ZaBeaconCommand command) {

    memcpy(buffer, &command, sizeof(struct ZaBeaconCommand));

    //buffer = static_cast<unsigned  char *>(command);

    cout<<"Data->"<<buffer<<"<-"<<endl; //just to see the data we want to write : ABC
    cout<<"Writing Data..."<<endl;
    result = libusb_bulk_transfer(device_handle, 0x04, buffer, sizeof(buffer), &bytesRead, 0);
    if(result == 0 && bytesRead == 8) //we wrote the 3 bytes successfully
        cout<<"Writing Successful!"<<endl;
    else {
        cout<<"Wrote " << bytesRead << " bytes." << " Expected " << sizeof(buffer) << " bytes." << endl;
        perror("Write error: ");
    }
}

int USBManager::readData() {
    result = libusb_bulk_transfer(device_handle, (1 | 0x83), buffer, sizeof(buffer), &bytesRead, 0);
    if(result == 0 && bytesRead == 8) { //we read the bytes successfully
        cout << "Read Successful!" << endl;

        return atoi((const char *) buffer);
    }
    else {
        cout<<"Read " << bytesRead << " bytes." << " Expected " << sizeof(buffer) << " bytes." << endl;
        perror("Read error: ");
        return -1;
    }
}



