cd ~
wget --no-check-certificate http://www.kernel.org/pub/linux/bluetooth/bluez-5.43.tar.xz
tar xvf bluez-5.43.tar.xz
cd bluez-5.43
sudo apt-get update
sudo apt-get -y install libusb-dev libdbus-1-dev libglib2.0-dev libudev-dev libical-dev libreadline-dev libbluetooth-dev
sudo date --set="14 Feb 2017 17:00:00"
./configure
sudo make
sudo make install
sudo apt-get remove -y nodejs
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
sudo npm install -g nodemon
sudo chmod 777 startup.sh
cd node-ble
cd GPIOBoard
sudo chmod 777 board