#include "GPIOBoard.h"

int main(void) {

    GPIOBoard *board = new GPIOBoard("18");

    board->export_gpio();
    board->setdir_gpio("out");

    board->setval_gpio("1");
    sleep(2);
    board->setval_gpio("0");

    board->unexport_gpio();
    delete board;
    board = 0;
}