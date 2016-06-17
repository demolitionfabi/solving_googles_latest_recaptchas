#Solving Google's latest ReCAPTCHAs with the clarifai API

This program solves in average around every 4th Google ReCAPTCHA.

The program is not intended to break the system, but to show the strength of image classification with deep neural networks.

If you wanted to solve CAPTCHAs in a live system, you would definitley need to improve this program and you would probably want to solve the noscript version of Google's CAPTCHAs.

> You can see a life example of how this works here:
> [https://youtu.be/nTM3qhOkQY8](https://youtu.be/nTM3qhOkQY8)

## How To Run
### Required Hardware/Software

To be able to run the code you need:

* A clarifai access token (an account can be created for free at [https://www.clarifai.com](https://www.clarifai.com))
* A server with a running webserver
* Google Chrome on your local machine
* (A Domain with a valid certificate)

Because of the policies of Chrome, you need an https Domain in order to be able to connect to it from Javascript of an https page. If you want to solve CAPTCHAs on a page without https, this is not necessary.

### Installation

* You need to upload the folder captcha to your webserver and configure a domain for it
* You need to set the permissions of the solve folder to 777

### Configure
* Enter your clarifai Access Token in the token.txt
* In the captchas.php you need to adjust the path in line 62
* In the captchas.js you need to replace the url https://captchas.htfs.de/solve/captchas.php with your url (line 67)

### Run

When your webserver is running, open the [ReCAPTCHA demo page](https://www.google.com/recaptcha/api2/demo) in Chrome. Open the developer console and copy all the content of the captchas.js