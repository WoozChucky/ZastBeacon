//
// Created by root on 21-06-2017.
//

#ifndef ZASTUSB_ZABEACONCOMMAND_HPP
#define ZASTUSB_ZABEACONCOMMAND_HPP

struct ZaBeaconCommand {
    int32_t operationType; //0 - Open/ 1 - Validate / 2 - Configure
    int32_t checkinType; //0 - In / 1 - Out
    int32_t operatorId;
    char deviceId[20];
    char transactionDateTime[30];
    char lineDirection[30];
    char seatNumber[8]; //It is a char array because it can have letters associated
};

enum { OPERATION_TYPE_OPEN = 0, OPERATION_TYPE_VALIDATE = 1, OPERATION_TYPE_CONFIGURE = 2};

#endif //ZASTUSB_ZABEACONCOMMAND_HPP

