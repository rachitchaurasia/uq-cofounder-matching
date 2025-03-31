# Read me for developing backend
## 1. Set up uq cloud zone
For devlepment its nice to set up your own personal uq cloud zone. This is because when creating one you use an image that comes with many of the dependencies for the web server pre-installed.
###  1. SSH into Moss or Mango
Use PuTTY if on windows. Direclty ssh in. If you are on mac type the following into your terminal:
`ssh moss.labs.eait.uq.edu.au` or `ssh mango.eait.uq.edu.au`.
### 2. Generate SSH keys
Run `sdc-setup`. You should see something that looks like the following.
```
uqfoobar@mango:~$ sdc-setup
error: no SSH private key found in /home/users/uqfoobar/.ssh/id_rsa

please check that /home/users/uqfoobar/.ssh/id_rsa exists and add the contents
of /home/users/uqfoobar/.ssh/id_rsa.pub to your account at
https://internal.eait.uq.edu.au/accounts/sshkeys.ephp

if this is your first time using SDC, you should generate a key
would you like to generate a new key now? [yN] y (1)

Enter passphrase (empty for no passphrase): (2)
Enter same passphrase again: (3)

Your identification has been saved in /home/users/uqfoobar/.ssh/id_rsa.
Your public key has been saved in /home/users/uqfoobar/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:hynWoXs2zUG+ZCaAcncV7gM2Ejnf/EddKv7kG/cvEJY uqfoobar@mango.eait.uq.edu.au
The key's randomart image is:
+---[RSA 2048]----+
|      ..  o.     |
|     .o. o      .|
|  . o +o*oo  . o.|
|   o . B.Xo E o .|
|      + S X+ +   |
|     . o O ++ o  |
|      . + +  *. .|
|       o .    +o.|
|              .o+|
+----[SHA256]-----+

now visit this website:
https://internal.eait.uq.edu.au/accounts/sshkeys.ephp (4)
and add the following text as a new key:

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... (5)

then run sdc-setup again (6)
```
  1. Press `y`.
  2. Make sure to enter a passphrase that is strong and as long as you think
    you can comfortably remember.
  3. Enter the passphrase again.
  4. visit https://student.eait.uq.edu.au/accounts/sshkeys.ephp. Add new key
  5. Then paste the line beginning with `ssh-rsa` into the "Add new key" dialog.
  6. Make sure you run sdc-setup again
### 3. Create cloud zone
Once you have run `sdc-setup` and created your account you shouldn't need
to re-run it each time you log in -- the key will be automatically found and
set up for you at login.

You can check that your account is working correctly with Triton by running
the command `triton account get`:

```
uqfoobar@mango:~$ triton account get
id: 783fcb12-cfb4-489e-ab1c-fb999661f7c5
login: uqfoobar
email: foo.bar@uq.edu.au
companyName: EAIT
firstName: Foo
lastName: Bar
triton_cns_enabled: true
phone: 12345
updated: 2019-09-25T03:11:34.682Z (18w)
created: 2015-02-02T06:48:25.648Z (4y)
```
Decide on a name (alias) for your zone. The DNS name will look like: `<account>-<alias>.zones.eait.uq.edu.au`, <account> will be the student number
<alias> will be the name.
Now to create your zone run the command: `triton inst create --wait --name <alias> --network zones webproject z1-standard`
