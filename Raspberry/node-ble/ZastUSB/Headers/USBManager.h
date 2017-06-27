//
// Created by nuno on 20-06-2017.
//

#ifndef ZASTUSB_USBMANAGER_H
#define ZASTUSB_USBMANAGER_H

#include <iostream>
#include <vector>
#include <string>
#include <libusb-1.0/libusb.h>

#include "ZaBeaconCommand.hpp"

#define USB_ENDPOINT_IN (0x80 | 3)
#define USB_ENDPOINT_OUT (0x00 | 4)

#define ITERATE true

using namespace std;

class USBManager {
private:


    libusb_context *_context = nullptr;
    libusb_device_handle *_device_handle;
    libusb_device** _devices;

    void printDeviceInfo(libusb_device *dev);

    unsigned char _buffer[250];

    int _result;
    int _bytesWritten;
    int _bytesRead;
    ssize_t _deviceCount;


public:
    USBManager();
    ~USBManager();
    void initialize();
    void scanDevices();
    void closeDevice();
    void shutdown();
    int openGate(struct ZaBeaconCommand command);
    void connect(int index); // public for now
};

#endif //ZASTUSB_USBMANAGER_H
