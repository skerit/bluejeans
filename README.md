# bluejeans

A Bluetooth module for Node.js.
It is much like `noble`, and even shares some code, but in the future it is also meant to manage non-LE devices.

# Permissions

Make sure hcitool has the needed permissions:

```
sudo setcap 'cap_net_raw,cap_net_admin+eip' `which hcitool`
```