//
// Created by root on 21-06-2017.
//

#ifndef ZASTGATE_USBMANAGER_H
#define ZASTGATE_USBMANAGER_H

#include <iostream>
#include <vector>
#include <libusb-1.0/libusb.h>
#include "UDPClient.h"
#include <string>

#define ITERATE false

using namespace std;

class USBManager {
private:
    libusb_context *context = nullptr;
    libusb_device_handle *device_handle;
    libusb_device** devices;
    unsigned char *buffer;
    int result;
    int bytesRead;
    ssize_t deviceCount;

    void printDeviceInfo(libusb_device *dev);

public:
    USBManager();
    ~USBManager();
    void initialize();
    void scanDevices();
    void closeDevice();
    void shutdown();
    void writeData(const char * message);
    void connect(int index); // public for now
    int readData(unsigned char **response);
};

#endif //ZASTGATE_USBMANAGER_H
