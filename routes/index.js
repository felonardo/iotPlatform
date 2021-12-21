var router = require('express').Router();
const dotenv = require('dotenv');
const { requiresAuth } = require('express-openid-connect');
const axios = require('axios');
var qs = require('qs');
var bodyParser = require('body-parser');

// var io = require('../server')()
// let io = app.get("io")
var urlencodedParser = bodyParser.urlencoded({ extended: false })

dotenv.load();

const host = process.env.HOST;

router.get('/', function (req, res, next) {
  
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

  res.render('home', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
    initMap
  })
});


router.post('/applications/:id/device/:name', urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);
  var data = qs.stringify({
    'data': req.body
  });

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(access_token)

  var config = {
    method: 'post',
    url: `${host}:5000/applications/:id/device/:name`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
    axios(config)
    .then(function (response) {
      console.log("lala",response);
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("lilia",error);
      console.log(error);
    });


  
  io.on('connection', function (socket) {
    console.log("rs1:", JSON.stringify(data));
    console.log(req.params.name)
    socket.emit(req.params.name, data);
  
  
  });
  console.log("rs1:", data);
  res.json(data);
  // res.redirect('/applications/'+ req.params.id + '/device/' + req.params.name)
});


router.get('/applications/:id/device/:name', requiresAuth(), urlencodedParser, async(req , res) => {
  
  let datas = {}

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(req.oidc)
  var str = `${host}:5000/` + req.params.id + "/" + req.params.name
  console.log(str)

  // setInterval(function(){ 

    try {
      const apiResponse = await axios.get(str, 
      {
      // params: {
      //   userId: req.oidc.user.nickname
      // },
      headers: { 
        'Authorization': `${token_type} ${access_token}`, 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      })


      datas = apiResponse.data[0].datas    

      console.log(JSON.stringify(datas));
      // console.log("lala:", datas)
   
    } catch(e) { }

  // },2000)

  
  io.on('connection', function (socket) {
    // console.log("rs1:", JSON.stringify(datas));
    console.log(req.params.name)
    socket.emit(req.params.name, datas);
  
  
  });

    res.render('device', {
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
      appId: req.params.id,
      deviceName: req.params.name,
      // tokenType: token_type,
      // accessToken: access_token,
      datas
      });
    });

router.get('/applications', requiresAuth(), urlencodedParser, async (req, res) => {

  let datas = {}

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(req.oidc)

  try {
    const apiResponse = await axios.get(`${host}:5000/applications`, 
    {
    // params: {
    //   userId: req.oidc.user.nickname
    // },
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    })
    datas = apiResponse.data
  } catch(e) { }

    res.render('applications', {
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
      tokenType: token_type,
      accessToken: access_token,
      datas
    });
});


router.get('/applications/add-application', requiresAuth(), function (req, res, next) {
  res.render('addapplication', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user
  })
});


router.get('/applications/:id/add-device', requiresAuth(), function (req, res, next) {
  res.render('adddevice', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user
  })
});

router.get('/applications/:id', requiresAuth(), async (req, res) =>{
  let datas = {}

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(access_token)

  try {
    const apiResponse = await axios.get(`${host}:5000/devices/${req.params.id}`,
    {
      headers: {
        authorization: `${token_type} ${access_token}`
      },
      params: {
        userId: req.oidc.user.nickname
      }
    })
    datas = apiResponse.data
  } catch(e) { }

  res.render('detailapplication', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
    appId: req.params.id,
    tokenType: token_type,
    accessToken: access_token,
    datas
  });
});

router.post('/applications/:id/add-device', requiresAuth(), urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);
  var data = qs.stringify({
    'appId': req.params.id,
    'deviceName': req.body.deviceName,
    'userName': req.oidc.user.nickname, 
    'userEmail': req.oidc.user.email,  
    'userId': req.oidc.user.email, 
  });

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(access_token)

  var config = {
    method: 'post',
    url: `${host}:5000/devices`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
    axios(config)
    .then(function (response) {
      console.log("lala",response);
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("lilia",error);
      console.log(error);
    });
  res.redirect('/applications/' + req.params.id)
});

router.post('/applications/add-application', requiresAuth(), urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);
  var data = qs.stringify({
    'appId': req.body.appId,
    'appName': req.body.appName,
    'userId': req.oidc.user.email, 
    'userName': req.oidc.user.nickname, 
    'userEmail': req.oidc.user.email, 
  });

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(access_token)

  var config = {
    method: 'post',
    url: `${host}:5000/applications`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };

    axios(config)
    .then(function (response) {
      console.log("lala",response);
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("lilia",error);
      console.log(error);
    });
  res.redirect('/applications')
});


router.post('/applications/:id/add-user', requiresAuth(), urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);
  var data = qs.stringify({
    'appId': req.params.id,
    'userName': req.body.userName, 
    'userEmail': req.body.userEmail, 
    'userId': req.body.userEmail, 
  });

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(access_token)

  var config = {
    method: 'post',
    url: `${host}:5000/applications/:id/adduser`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
    axios(config)
    .then(function (response) {
      console.log("lala",response);
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("lilia",error);
      console.log(error);
    });
  res.redirect('/applications/' + req.params.id + "/useraccess")
});

router.get('/applications/:id/useraccess', urlencodedParser, requiresAuth(), async (req, res) => {
  let datas = {}

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  // console.log(access_token)

  try {

    console.log(req.params.id)
    const apiResponse = await axios.get(`${host}:5000/applications/${req.params.id}`,
    {
      headers: {
        authorization: `${token_type} ${access_token}`
      },
      params: {
        userId: req.oidc.user.nickname
      }
    })
    console.log(apiResponse.data)
    datas = apiResponse.data
    console.log(datas)
  } catch(e) { }

  res.render('useraccess', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
    appId: req.params.id,
    datas
  })
});



router.get('/profile', requiresAuth() , async (req, res) => {
  let data = {}

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type

  console.log(access_token)

  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page',
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
    tokenType: token_type,
    accessToken: access_token,
  });
});



router.get('/applications/:id/add-user', requiresAuth(), function (req, res, next) {
  
  res.render('adduser', {
    // userProfile: JSON.stringify(req.oidc.user, null, 2),
    // title: 'Secure page',
    appId: req.params.id,
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
  });
});

router.get('/secured', requiresAuth(), function (req, res, next) {
  res.render('secured', {
    // userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Secure page',
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
  });
});


module.exports = router;
