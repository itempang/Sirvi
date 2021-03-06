//FirstView Component Constructor
function MainMenu() {
	//create object instance, a parasitic subclass of Observable
	var apiURL = Ti.App.Properties.getString('apiURL', 'http://104.131.124.227:3000');
	var imagepath = '/images/mainmenu/';
	var self = Ti.UI.createView({
		backgroundImage : imagepath + 'background.png',
	});
	var Notifications = require('/libs/notifications').Notifications;
	new Notifications();

	loaded = false;
	textloaded = false;
	var qbutton = require('ui/common/buttonCreator');

	var userCred = Ti.App.Properties.getObject('userCred');
	var longitude;
	var latitude;

	Ti.App.Properties.setBool('questions', true);

	loginReq();

	var h1 = {
		fontFamily : 'HelveticaNeue-Thin',
		fontSize : '28dp',
		color : '#fff'
	};
	var h2 = {
		fontFamily : 'HelveticaNeue-Thin',
		fontSize : '18dp',
		color : '#fff'
	};
	var h3 = {
		fontFamily : 'HelveticaNeue-Thin',
		fontSize : '14dp',
		color : '#fff'
	};
	var h4 = {
		fontFamily : 'HelveticaNeue-Thin',
		fontSize : '16dp',
		color : '#fff'
	};

	var textBtn = Ti.UI.createImageView({
		image : imagepath + 'text.png',
		right : '12.5dp',
		bottom : '15dp'

	});
	var textChat = require('ui/common/FirstView');
	textBtn.addEventListener('click', function() {
		if (!textloaded) {
			chatView = new textChat();
			self.add(chatView);
			textloaded = true;
		} else {
			chatView.show();
		}
	});

	Ti.Geolocation.preferredProvider = "gps";
	Ti.Geolocation.purpose = "Find local deals";
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 10;

	//
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (!e.success || e.error) {
			Ti.API.info('error: get current position: ' + JSON.stringify(e.error));
			return;
		}

		longitude = e.coords.longitude;
		latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		Ti.API.info('speed ' + speed);
		locationCallback(e);
	});

	function loginReq() {
		var apiCall = '/api/appUsers/login';
		var url = apiURL + apiCall;
		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				Ti.API.info(this.responseText);
				saveInfo(JSON.parse(this.responseText));
			},
			onerror : function(e) {
				Ti.API.info(e.error + ' ' + JSON.stringify(e));
				alert('Unable to establish connection');
			},
			timeout : 5000 // in milliseconds
		});

		params = {
			email : Titanium.App.Properties.getString('email', userCred['email']),
			password : Titanium.App.Properties.getString('pass', userCred['pass'])
		};

		client.open("POST", url);
		client.setRequestHeader("Content-Type", "application/json");
		client.setRequestHeader('charset', 'utf-8');
		client.send(JSON.stringify(params));
		Ti.API.info(JSON.stringify(params));
	}

	function saveInfo(data) {
		userData = data;
		Ti.App.Properties.setObject('userCred', userData);
	}

	function openProfile(userData) {
		var Profile = require('ui/common/SlideOutMenu');
		profileView = new Profile(userData);
		self.add(overlay1);
		overlay1.animate({
			opacity : 0.7,
			duration : 750
		});
		self.add(profileView);

		Ti.addEventListener('closeSlideOut', function(e) {
			overlay1.animate({
				opacity : 0,
				duration : 750
			}, function() {
				self.remove(overlay1);
				self.remove(profileView);
			});
		});
	}


	Ti.addEventListener('openProfile', function(e) {
		var ProfileView = require('ui/common/ProfileView');
		profile = new ProfileView(self);
		self.add(profile);
	});
	Ti.addEventListener('openInbox', function(e) {
		var ProfileView = require('ui/common/InboxView');
		profile = new ProfileView(self);
		self.add(profile);
	});
	Ti.addEventListener('openInterests', function(e) {
		var ProfileView = require('ui/common/InterestsView');
		profile = new ProfileView(self);
		self.add(profile);
	});
	Ti.addEventListener('openSettings', function(e) {
		var ProfileView = require('ui/common/SettingsView');
		profile = new ProfileView(self);
		self.add(profile);
	});

	function locationCallback(e) {
		if (!e.success || e.error) {
			Ti.API.info('error: location callback: ' + JSON.stringify(e.error));
			return;
		}
		var urlCall = apiURL + '/api/appUsers/' + userCred['userId'] + '?access_token=' + userCred['id'];

		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;

		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				//Ti.API.info(e.success);
				Ti.API.info(this.responseText);
				//saveInfo(JSON.parse(this.responseText));
			},
			onerror : function(e) {
				Ti.API.info(e.error + ' Location Callback Function ' + JSON.stringify(e));
			},
			timeout : 5000 // in milliseconds
		});

		params = {
			last_location : {
				"lat" : latitude,
				"lng" : longitude
			}
		};

		client.open("PUT", urlCall);
		client.setRequestHeader("Content-Type", "application/json");
		client.setRequestHeader('charset', 'utf-8');
		client.send(JSON.stringify(params));
		Ti.API.info(JSON.stringify(params));
	};

	Titanium.Geolocation.addEventListener('location', locationCallback);

	var spacer = Ti.UI.createView({
		height : '10dp',
	});

	var menuButton = Ti.UI.createImageView({
		image : imagepath + 'menu.png',
		right : '12.5dp',
		center : {
			y : '50dp'
		}
	});

	var helpButton = Ti.UI.createImageView({
		image : imagepath + 'help.png',
		left : '12.5dp',
		bottom : '15dp'
	});

	var helpScreen = Ti.UI.createImageView({
		image : imagepath + 'helpScreen.png',
		bottom : '0dp'
	});

	var profileButton = Ti.UI.createImageView({
		image : imagepath + 'profile.png',
		left : '12.5dp',
		center : {
			y : '50dp'
		}
	});

	var callBtn = Ti.UI.createImageView({
		image : imagepath + 'sirviR.png',
		left : '-320dp'
	});
	callBtn.addEventListener('click', function() {
		callSirvi();
	});

	var overlay = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		backgroundColor : '#333',
		opacity : 0.7
	});

	var overlay1 = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		backgroundColor : '#333',
		opacity : 0
	});

	function callSirvi() {
		var Twilio = require('com.twilio.client');

		var callDialog = Ti.UI.createView({
			height : Ti.UI.SIZE,
			width : '90%',
			backgroundColor : '#white',
			borderRadius : 8,
			layout : 'vertical',
			opacity : 0.8
		});

		var miniSirvi = Titanium.UI.createImageView({
			height : '50dp',
			width : '50dp',
			image : '/images/mainmenu/callBtn.png'
		});

		var statuslabel = Ti.UI.createLabel({
			text : 'Connecting to Sirvi... \nPlease wait while we connect your concierge specialist',
			font : h4,
			color : 'black',
			textAlign : 'left'
		});

		var titleView = Titanium.UI.createView({
			width : '100%',
			layout : 'horizontal',
			height : Titanium.UI.SIZE
		});

		titleView.add(miniSirvi);
		titleView.add(statuslabel);

		newButton = Titanium.UI.createButton({
			title : 'End Call',
			color : 'red'
		});
		callDialog.add(titleView);
		callDialog.add(newButton);
		newButton.addEventListener('click', function() {
			Twilio.Device.disconnectAll();
			self.remove(callDialog);
			self.remove(overlay);
		});

		//var url = 'http://healthypeps.com/auth.php';
		//makeCall(this.responseText);
		var url = 'http://104.131.188.13/auth.php';
		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				Ti.API.info('Received capability token: ' + this.responseText);
				Twilio.Device.setup(this.responseText);
				makeCall(this.responseText);
			},
			onerror : function(e) {
				Ti.Platform.openURL('tel:18666971684');
			},
			timeout : 5000
		});
		client.open('POST', url);

		authParams = {
			caller : userCred['userId'],
			access_token : userCred['id'],
			lat : latitude,
			lng : longitude
		};

		client.send(authParams);

		function getDate() {
			var currentTime = new Date();
			var hours = currentTime.getHours();
			var minutes = currentTime.getMinutes();
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();

			return month + "/" + day + "/" + year + " - " + hours + ":" + minutes;
		};
		var nowTime = getDate();
		var _url = apiURL + '/api/calls/';
		var _client = Ti.Network.createHTTPClient({
			onload : function(e) {

				//Ti.API.info(' ' + this.responseText);
				//Twilio.Device.setup(this.responseText);
				//makeCall(this.responseText);
			},
			onerror : function(e) {
				Ti.Platform.openURL('tel:18666971684');
			},
			timeout : 5000
		});
		_client.open('POST', _url);

		authParams1 = {
			"phone_number" : 0,
			"wait_time" : "00",
			"start_time" : new Date().getTime(),//nowTime,
			"intent" : "sirvipays",
			"resolution" : "00",
			"recording_url" : "00",
			"end_time" : "00",
			"agentId" : "objectid",
			"appUserId" : userCred['userId'],
			"access_token":userCred['id']
		};

		_client.send(authParams1);

		// Make an outbound call
		function makeCall(token) {
			Ti.API.info(Twilio.Device.status(token) + 'making call...');
			Twilio.Device.connect({
				PhoneNumber : '+18666971684',
				CallerId : '+15612038918',
			});
			Ti.API.info(Twilio.Device.status(token) + 'call enroute...');
			self.add(overlay);
			self.add(callDialog); locationCallback;
		}

	}

	var childView = Ti.UI.createView({
		height : '386.5dp',
		width : '200dp',
		right : '50dp',
		transform : Ti.UI.create2DMatrix().rotate(179),
		anchorPoint : {
			x : 0,
			y : 0.5
		},
		opacity : 0
	});
	var healthBig = Ti.UI.createImageView({
		image : imagepath + 'healthR.png',
		width : '72.5dp',
		height : '73dp'
	});
	var lawBig = Ti.UI.createImageView({
		image : imagepath + 'lawR.png',
		width : '73.5dp',
		height : '74dp'
	});
	var datingBig = Ti.UI.createImageView({
		image : imagepath + 'dateR.png',
		width : '72.5dp',
		height : '73dp'
	});
	var lawBtn = Ti.UI.createImageView({
		image : imagepath + 'law.png',
		top : '0dp',
		left : '20dp'
	});
	var healthBtn = Ti.UI.createImageView({
		image : imagepath + 'health.png',
		right : '0dp',
	});
	var datingBtn = Ti.UI.createImageView({
		image : imagepath + 'dating.png',
		right : '45.5dp',
		bottom : '0dp'
	});
	var financeBtn = Ti.UI.createImageView({
		image : imagepath + 'finance.png',
		right : '65dp',
		bottom : '-40dp',

	});
	var raffleBtn = Ti.UI.createImageView({
		image : imagepath + 'raffle.png',
		bottom : '-70dp',
		left : '-90dp',
		opacity : 0
	});

	sunAnimation = Ti.UI.createAnimation({
		left : '5dp',
		duration : 650,
		curve : Ti.UI.ANIMATION_CURVE_EASE_OUT
	});
	planetAnimation = Ti.UI.createAnimation({
		right : '20dp',
		transform : Ti.UI.create2DMatrix().rotate(0),
		opacity : 1,
		duration : 1000,
		curve : Ti.UI.ANIMATION_CURVE_EASE_OUT
	});

	planetZoom = Ti.UI.createAnimation({
		width : '200dp',
		height : '200dp',
		left : '0dp',
		center : {
			y : Ti.Platform.displayCaps.platformHeight / 2
		},
		duration : 500,
		curve : Ti.UI.ANIMATION_CURVE_EASE_OUT
	});

	planetRotateOut = Ti.UI.createAnimation({
		transform : Ti.UI.create2DMatrix().rotate(-179),
		opacity : 0,
		duration : 1000,
		curve : Ti.UI.ANIMATION_CURVE_LINEAR,
		right : '50dp'
	});
	shrinkBtn = Ti.UI.createAnimation({
		transform : Ti.UI.create2DMatrix().scale(0.9, 0.9),
		opacity : 1,
		duration : 500,
		center : {
			x : '93dp',
			y : Ti.Platform.displayCaps.platformHeight / 2
		},
	});

	callBtn.animate(sunAnimation, function(e) {
		childView.animate(planetAnimation);
		healthBtn.animate({
			right : '26.5dp',
			top : '59dp',
			duration : 1000,
			curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
		datingBtn.animate({
			right : '0dp',
			bottom : '158dp',
			duration : 1000,
			curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});

		financeBtn.animate({
			right : '26.5dp',
			bottom : '59dp',
			duration : 1100,
			curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
		raffleBtn.animate({
			bottom : '0dp',
			left : '20dp',
			opacity : 1,
			duration : 1100,
			curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
		if (Titanium.App.Properties.getBool('firsttime', true)) {
			setTimeout(function() {
				helpScreen.show();
				Titanium.App.Properties.setBool('firsttime', false);
			}, 1500);
		}
	});

	lawBtn.addEventListener('click', function(e) {
		if (!Ti.App.Properties.getBool('questions', false)) {
			loadQuestions();
		} else {
			var dTop = ((Ti.Platform.displayCaps.platformHeight - 386.5) / 2) + 36.75;
			var dLeft = (Ti.Platform.displayCaps.platformWidth - 163.25);
			lawBig.center = {
				x : dLeft,
				y : dTop
			};
			self.add(lawBig);
			lawBtn.hide();
			lawBig.animate(planetZoom);
			childView.animate(planetRotateOut, function(e) {
				Ti.fireEvent('lawview', {
					x : 'law'
				});
			});
			callBtn.animate(shrinkBtn);
		}
	});

	healthBtn.addEventListener('click', function(e) {
		if (!Ti.App.Properties.getBool('questions', false)) {
			loadQuestions();
		} else {
			var dTop = ((Ti.Platform.displayCaps.platformHeight - 386.5) / 2) + 36.75 + 59;
			var dLeft = (Ti.Platform.displayCaps.platformWidth - 46.5) - 36.25;
			healthBig.center = {
				x : dLeft,
				y : dTop
			};
			self.add(healthBig);
			healthBtn.hide();
			healthBig.animate(planetZoom);
			childView.animate(planetRotateOut, function() {
				Ti.fireEvent('lawview', {
					x : 'health'
				});
			});
			callBtn.animate(shrinkBtn);
		}
	});

	datingBtn.addEventListener('click', function(e) {
		if (!Ti.App.Properties.getBool('questions', false)) {
			loadQuestions();
		} else {
			var dLeft = (Ti.Platform.displayCaps.platformWidth - 20) - 36.25;
			datingBig.center = {
				x : dLeft,
				y : '50%'
			};
			self.add(datingBig);
			datingBtn.hide();
			datingBig.animate(planetZoom);
			childView.animate(planetRotateOut, function() {
				Ti.fireEvent('lawview', {
					x : 'date'
				});
			});
			callBtn.animate(shrinkBtn);
		}
	});

	var Question = require('ui/common/QuestionView');
	raffleBtn.addEventListener('click', function(e) {
		if (!loaded) {
			loadTerms();
		} else
			loadQuestions();
	});

	var raffleTermsView = Titanium.UI.createView({
		height : Titanium.UI.FILL,
		width : Titanium.UI.FILL,
		backgroundImage : '/images/mainmenu/background.png'
	});

	var raffleBackBtn = Titanium.UI.createImageView({
		image : '/images/law/home.png',
		left : '12.5dp',
		center : {
			y : '40dp'
		}
	});

	var raffleBckgrnd = Titanium.UI.createImageView({
		height : Titanium.UI.FILL,
		width : Titanium.UI.FILL,
		backgroundImage : '/images/mainmenu/spstart.png'
	});

	var lowerButtonView = Titanium.UI.createView({
		height : '50dp',
		bottom : '40dp'
	});

	var raffleRegister = qbutton.createButton('Register', '#0d004c');

	raffleRegister.addEventListener('click', function() {
		loadQuestions();
	});

	lowerButtonView.add(raffleRegister);

	raffleTermsView.add(raffleBckgrnd);
	raffleTermsView.add(raffleBackBtn);
	raffleTermsView.add(lowerButtonView);

	raffleBackBtn.addEventListener('click', function() {
		self.remove(raffleTermsView);
	});

	function loadTerms() {
		self.add(raffleTermsView);
	}

	function loadQuestions() {
		var quesToLoad = 'sirvipays';
		if (!loaded) {
			QuestionView = new Question(quesToLoad);
			self.add(QuestionView);
			loaded = true;
		} else {
			QuestionView.show();
		}
	}


	financeBtn.addEventListener('click', function(e) {
		var offersView = require('ui/common/Offers');
		self.add(new offersView);
	});
	var rewardsView = require('ui/common/rewards');

	menuButton.addEventListener('click', function(e) {
		_rewards = new rewardsView();
		self.add(_rewards);
	});

	helpButton.addEventListener('click', function() {
		helpScreen.show();
	});

	helpScreen.addEventListener('click', function(e) {
		helpScreen.hide();
	});

	profileButton.addEventListener('click', function() {
		openProfile(userCred);
	});

	childView.add(lawBtn);
	childView.add(healthBtn);
	childView.add(datingBtn);
	childView.add(financeBtn);
	childView.add(raffleBtn);
	self.add(childView);
	self.add(callBtn);
	self.add(textBtn);
	self.add(menuButton);
	self.add(helpButton);
	self.add(profileButton);
	self.add(helpScreen);
	helpScreen.hide();

	return self;
}

module.exports = MainMenu;
