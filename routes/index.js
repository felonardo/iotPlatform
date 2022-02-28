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
  
if (req.oidc.isAuthenticated()){
  res.redirect('/applications')
} else{
  res.render('home', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
    // initMap
  })
}

});

router.use(function(req,res,next){
	req.io = io;
	next();
});

router.post('/applications/:id/device/:name', urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);
  var data = qs.stringify(
   req.body
  );
  var datas = {}

  var config = {
    method: 'post',
    url: `${host}:5000/`+ req.params.id + "/" + req.params.name,
    headers: { 
      'Authorization': req.headers.authorization, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
    axios(config)
    .then(function (response) {
      datas = response.data.datas

      console.log("rs1:", JSON.stringify(response.data.datas));
      console.log(req.params.name)
      req.io.sockets.emit(req.params.name, datas);

      io.once('connection', function (socket) {
        console.log("rs1:", JSON.stringify(datas));
        socket.emit(req.params.name, datas);
      });

      res.json(datas);
    })
    .catch(function (error) {
      console.log("lilia",error);
      console.log(error);
      res.status(404).json({message: error.message});
    });
});


router.get('/applications/:id/device/:name', requiresAuth(), urlencodedParser, async(req , res) => {
  
  let datas = {}
  let data = {}

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(req.oidc)
  var str = `${host}:5000/` + req.params.id + "/" + req.params.name
  var str2 = `${host}:5000/` + "device" + "/" + req.params.name
  console.log(str)
  console.log(str2)

  try {
    const apiResponse2 = await axios.get(str2, 
    {
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    })

    // data = apiResponse.data
    data = apiResponse2.data
 
  } catch(e) { 
    
  }


    try {
      const apiResponse = await axios.get(str, 
      {
      headers: { 
        'Authorization': `${token_type} ${access_token}`, 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      })

      // data = apiResponse.data
      datas = apiResponse.data[0].datas    

   
    } catch(e) { 

    }

  
  io.once('connection', function (socket) {
    console.log("rs1:", JSON.stringify(datas));
    socket.emit(req.params.name, datas);
  });

    res.render('device', {
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
      appId: req.params.id,
      deviceName: req.params.name,
      datas,
      data
      });
    });


    router.get('/widgets', requiresAuth(), urlencodedParser, async (req, res) => {

      let datas = {}
      let host = process.env.HOST
      const access_token = req.oidc.accessToken.access_token
      const token_type = req.oidc.accessToken.token_type
      console.log(req.oidc)
    
      try {
        const apiResponse = await axios.get(`${host}:5000/widgets`, 
        {
        headers: { 
          'Authorization': `${token_type} ${access_token}`, 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        })
        datas = apiResponse.data
        console.log("lulululul", datas)
      } catch(e) { }


        res.render('widgets', {
          isAuthenticated: req.oidc.isAuthenticated(),
          user: req.oidc.user,
          tokenType: token_type,
          accessToken: access_token,
          datas,
          host
          // datasdevices
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

router.post('/widgets/add-widget', requiresAuth(), urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);
  var data = qs.stringify({
    'appId': req.body.inputApplication,
    'deviceName': req.body.inputDevice,
    'datax': req.body.inputDatax,
    'type' : req.body.options,
    'userName': req.oidc.user.nickname, 
    'userEmail': req.oidc.user.email,  
    'userId': req.oidc.user.email, 
  });

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log("du:",data.type)

  var config = {
    method: 'post',
    url: `${host}:5000/widgets`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
    axios(config)
    .then(function (response) {
      // console.log("lala",response);
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("lilia",error);
      console.log(error);
    });
  res.redirect('/widgets')
});

router.get('/widgets/add-widget', requiresAuth(), urlencodedParser, async(req , res) => {

  let datas = {}
    
  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(req.oidc)

  try {
    const apiResponse = await axios.get(`${host}:5000/applications`, 
    {
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    })
    datas = apiResponse.data
  } catch(e) { }

  res.render('addwidget', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
    access_token: access_token,
    datas
  })
});

router.get('/applications/:id/add-device', requiresAuth(), function (req, res, next) {
  res.render('adddevice', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user
  })
});

router.get('/applications/:id/device/:name/set-lora', requiresAuth(), function (req, res, next) {

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type

  var dataLora = qs.stringify({
    'applicationID': req.params.id,
    'name': req.params.name,
    'description': req.params.name
  });
console.log("datalora:",dataLora)
  var configLora = {
    method: 'post',
    url: `${host}:5000/api/dev/lora`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : dataLora
  };

  axios(configLora)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })    
  .catch(function (error) {
    console.log("lilia",error);
    console.log(error);
  });
  // const access_token = req.oidc.accessToken.access_token
console.log("lalilali")
  res.redirect('/applications/'+ req.params.id + '/device/' + req.params.name)
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
  res.redirect('/applications/'+ req.params.id + '/device/' + req.body.deviceName)
});

router.post('/applications/add-application', requiresAuth(), urlencodedParser, (req, res) => {
  console.log('Got body:', req.body);

  var dataLora = qs.stringify({
    'name': req.body.appName.replace(/ /g,"_"),
    'description': req.body.appName
  });

  const access_token = req.oidc.accessToken.access_token
  const token_type = req.oidc.accessToken.token_type
  console.log(access_token)


  var configLora = {
    method: 'post',
    url: `${host}:5000/api/app/lora`,
    headers: { 
      'Authorization': `${token_type} ${access_token}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : dataLora
  };

    axios(configLora)
    .then(function (response) {

      var data = qs.stringify({
        'appId': response.data.id,
        'appName': req.body.appName,
        'userId': req.oidc.user.email, 
        'userName': req.oidc.user.nickname, 
        'userEmail': req.oidc.user.email, 
      });

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
        console.log(JSON.stringify(response.data));
      })    
      .catch(function (error) {
        console.log("lilia",error);
        console.log(error);
      });
      // console.log("lala",response);
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
