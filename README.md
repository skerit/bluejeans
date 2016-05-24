# bluejeans

Bluetooth manager for Node.js

# Permissions

Make sure hcitool has the needed permissions:

```
sudo setcap 'cap_net_raw,cap_net_admin+eip' `which hcitool`
```