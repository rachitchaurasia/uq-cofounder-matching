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
Decide on a name (alias) for your zone. The DNS name will look like: `<account>-<alias>.zones.eait.uq.edu.au`, <account\> will be the student number
<alias\> will be the name.
Now to create your zone run the command: `triton inst create --wait --name <alias> --network zones webproject z1-standard`
Wait about 1-2 mins while it creates your zone and you will get confirmation when it's done. You can now log off or directly ssh into your Zone through moss/mango!

## 2. Set up development environment on your zone
### 1. SSH into your zone
As you did before, you can ssh directly into your zone with the UQ VPN active. OR ssh into moss/mango first and then ssh from there into your zone. Use the ssh address `<account>-<alias>.zones.eait.uq.edu.au`.

I like to ssh with vscode as i can browse files, access the terminal, and use source control all in one place. After you ssh into your zone through VScode you can also access the terminal. So therers no need to keep PuTTY or the mac terminal open in the background. VScode also comes with built in version control (it recognises when you're in a git repo).

If you would like all of this then install the "Remote - SSH" extension from microsft by searching for it in the extension browser in VScode. After installing it enter the ssh address (\<account\>-<alias\>.zones.eait.uq.edu.au) follow the prompts. When you get to open .ssh/config then enter the following:
```
Host <account>-<alias>.zones.eait.uq.edu.au
  HostName <account>-<alias>.zones.eait.uq.edu.au
  User <account>
```
Replacing \<account\> and \<alias\> with your values. Then you can connect! 

You can open a folder in your zone through vscode the usual way. For now select your zones' home directory (which will just be your student number).

### 2. Setting up git
Git comes pre-installed on your cloud zone. I also recomend you do the following to make it easier to authenticate changes. 
Run the following in a terminal.

  1. Generate key pair: `ssh-keygen -t rsa -b 4096 -C "deco3801_github_key"` 

  2. Run the ssh-agent: `eval "$(ssh-agent -s)"`

  3. Then add the key to the ssh-agent `ssh-add ~/.ssh/id_rsa`

  4. Display public key generated above: `cat ~/.ssh/id_rsa.pub`

NOTE: press <enter\> when asked for file location and pass-phrase. If you get asked if you want to overwrite the previous key, say 'yes'.

You now need to link the public ssh key to your github account. go to account settings and click on ssh keys. Click add key. copy and paste the output from cat (step 4.) and give it a name. Click save.

Finally you just need to set your git username and email in the git configuration. Do this by running these two lines:
```
git config --global user.name "<git username>"

git config --global user.email "<git email address>"
```
Now clone the repo: `git clone git@github.com:rachitchaurasia/uq-cofounder-matching.git`

Now if you open this repo folder in VScode and click the source control button on the left hand side. You should be able to: see the repo history, select branch, write commits, and do pushes all through VScode!

### 3. Installing Django
Create virtual python environment (We are using python 3.12).

`python3.12 -m venv venv`

Activate the environment with

`source venv/bin/activate`

You can deactivate it at anytime by typing `deactivate`

Install Django

`pip install django`

Confirm django installed properly by running:

`django-admin --version`

If you see a version number `(e.g 5.1.7)`. Then it's installed.

### 4. Editing the files so that it works on your system
To get the code running you just have to edit two files. The first one is in your repo.

Navigate to matchingapp/matchingapp/settings.py (in vscode filebrowser is fine)

find the line `ALLOWED_HOSTS = ["<yourUQClouddomain>"]` and replace <yourUQclouddomain\> with your actual domain name which would be <account\>-<alias\>.uqcloud.net. Again, replacing <account\> and <alias\> with your values. Make sure to save.

Now there is only one more file to edit.

In your terminal type `sudo nano /etc/nginx/sites-enabled/https-site`.
Add the following before the last closing brace `}`:
```
  location /matchingapp {
    include proxy_params;
    proxy_pass http://localhost:8000;
  }
```
Make sure to save.
Run this is check that you copied that code in correctly: `sudo nginx -t` if it says its okay you're good.
Now restart nginx to apply the new configuration: `sudo systemctl restart nginx`.
### 5. Run your server and see the code working
Now run `tmux` to open a new terminal window. You can detach from this instance by using Ctrl-b-d. You can reactch by typing `tmux attach`. to see your tmux instances run `tmux ls`

In the new tmux window navigate your current working directory to where your virtual python environment is installed (probably your home directory: `cd ~`). Like before activate it by typing: `source venv/bin/activate`

In the tmux window navigate your current working directory to matchingapp-backend/matchingapp/

run `python3.12 manage.py runserver 0.0.0.0:8000`

Now go to your browser and type into the url section: `<account>-<alias>.uqcloud.net`. replacing <account\> and <alias\> with your values. Agree to the consent sign on.

Finally add /matchingapp to the end of the url like so `<account>-<alias>.uqcloud.net/matchingapp`. Refresh a few times and you should see hello world text appear.

Well done! you have successfully got the code running on your own personal uq cloud zone!

To stop the server press Ctrl-c, if you want to close the tmux session just type `exit`.If you want to close the ssh connection to your zone on vscode just click the blue button in the bottom left corner. If you want to exit from the terminal just type `exit` again.





