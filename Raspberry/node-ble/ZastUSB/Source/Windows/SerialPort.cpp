//
// Created by nuno on 19-06-2017.
//

#include "../../Headers/Windows/SerialPort.h"

SerialPort::SerialPort() {
    serialPortHandle = INVALID_HANDLE_VALUE;
}

SerialPort::~SerialPort() {
    if (serialPortHandle != INVALID_HANDLE_VALUE)
        CloseHandle(serialPortHandle);

    serialPortHandle = INVALID_HANDLE_VALUE;
}

int SerialPort::connect() {
    return connect("COM7");
}

int SerialPort::connect(LPCSTR device) {
    int error = 0;
    DCB dcb;

    memset(&dcb, 0, sizeof(dcb));

    dcb.DCBlength = sizeof(dcb);

    dcb.BaudRate = 57600;
    dcb.Parity = NOPARITY;
    dcb.fParity = 0;
    dcb.StopBits = ONESTOPBIT;
    dcb.ByteSize = 8;

    serialPortHandle = CreateFile(device, GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);

    if (serialPortHandle != INVALID_HANDLE_VALUE) {
        if (!SetCommState(serialPortHandle, &dcb))
            error = 2;
    }
    else {
        error = 1;
    }

    if (error != 0) {
        disconnect();
    }
    else {
        clear();
    }

    return error;
}

void SerialPort::disconnect(void) {
    CloseHandle(serialPortHandle);
    serialPortHandle = INVALID_HANDLE_VALUE;
}

int SerialPort::sendData(unsigned char *buffer, int len) {
    unsigned long result;

    if (serialPortHandle != INVALID_HANDLE_VALUE)
        WriteFile(serialPortHandle, buffer, len, &result, NULL);

    return result;
}

int SerialPort::receiveData(unsigned char *buffer, int len) {
    unsigned long read_nbr;

    read_nbr = 0;
    if (serialPortHandle != INVALID_HANDLE_VALUE)
    {
        ReadFile(serialPortHandle, buffer, len, &read_nbr, NULL);
    }

    return((int)read_nbr);
}

void SerialPort::clear() {
    PurgeComm(serialPortHandle, PURGE_RXCLEAR | PURGE_TXCLEAR);
}
