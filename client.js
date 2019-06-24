const prompt = require("prompt");
const { ChatManager, TokenProvider } = require("@pusher/chatkit-client");
const axios = require("axios");
const { JSDOM } = require("jsdom");
const readline = require("readline");

//require("tty").setRawMode(true);

makeCompatible = () => {
  const { window } = new JSDOM();
  global.window = window;
  global.navigator = {};
};

prompt.start();
makeCompatible();
prompt.message = "";

var schema1 = {
  properties: {
    name: {
      // pattern: /^[a-zA-Z\s\-]+$/,
      message: "enter username - ",
      required: true
    }
    // password: {
    //   message: "enter password - ",
    //   hidden: true,
    //   required: true
    // }
  }
};

var schema2 = {
  properties: {
    index: {
      // pattern: /^[a-zA-Z\s\-]+$/,
      message: "enter room index - ",
      required: true
    }
    // password: {
    //   message: "enter password - ",
    //   hidden: true,
    //   required: true
    // }
  }
};

//
// Get two properties from the user: username and email
//
prompt.get(schema1, function(err, result) {
  //
  // Log the results.
  //
  console.log("Command-line input received:");
  console.log("  username: " + result.name);

  //createUser(result.name);

  axios
    .post(
      "https://u0y37iifai.execute-api.us-east-2.amazonaws.com/devo/newuser",
      { name: result.name }
    )
    .then(data => {
      console.log("sucsess - " + data.data.msg);

      const chatmanager = new ChatManager({
        instanceLocator: "v1:us1:d4d36eeb-35e7-4cda-bb7a-0e0abf0b93f0",
        userId: result.name,
        tokenProvider: new TokenProvider({
          url:
            "https://u0y37iifai.execute-api.us-east-2.amazonaws.com/devo/chatkit_auth"
        })
      });

      chatmanager
        .connect()
        .then(data => {
          // console.log(data);

          subsroom(data);
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log("error - " + err);
    });

  // const chatmanager = new ChatManager({
  //   instanceLocator: "v1:us1:d4d36eeb-35e7-4cda-bb7a-0e0abf0b93f0",
  //   userId: result.name,
  //   tokenProvider: new TokenProvider({
  //     url:
  //       "https://u0y37iifai.execute-api.us-east-2.amazonaws.com/devo/chatkit_auth"
  //   })
  // });

  // chatmanager
  //   .connect()
  //   .then(data => {
  //     // console.log(data);

  //     subsroom(data);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });

  //process.exit(1);
});

const createUser = async username => {
  await axios
    .post("http://localhost:3005/user", { username: username })
    .then(data => {
      console.log("sucsess - " + data.data.msg);
    })
    .catch(err => {
      console.log("error - " + err);
    });
};

const subsroom = async user => {
  const avaiblerooms = await user.getJoinableRooms();
  const allromms = [...avaiblerooms, ...user.rooms];

  allromms.forEach((element, index) => {
    console.log("rooms " + index + " " + JSON.stringify(element.name));
  });

  //   prompt.get(schema2, async function(err, result) {
  //console.log(result.index);

  var roomnumber = 0; //result.index;

  const selectedRoom = allromms[roomnumber];

  await user.subscribeToRoomMultipart({
    roomId: selectedRoom.id,
    hooks: {
      onMessage: message => {
        // console.log(user)

        if (message.senderId !== user.name) {
          console.log(
            //message.createdAt +
              " " +
              message.senderId +
              " : " +
              message.parts[0].payload.content
          );
        }
      }, //onUserJoined
      // onUserStartedTyping: userobj => {
      //   console.log(userobj.name + " is typing...");
      // }, //
      onUserJoined: userobj => {
        console.log(userobj.name + "joined...");
      },
      // onPresenceChanged: states => {
      //   console.log(JSON.stringify(states) + "joined...");
      // }
    },

    messageLimit: 0
  });

  const input = readline.createInterface({ input: process.stdin });

  // stdin.on("keypress", function(chunk, key) {
  //   user
  //     .isTypingIn({ roomId: selectedRoom.id })
  //     .then(() => {
  //      // console.log("Success!");
  //     })
  //     .catch(err => {
  //      // console.log(`Error sending typing indicator: ${err}`);
  //     });
  // });

  input.on("line", async test => {
    //console.log(test)

    await user.sendSimpleMessage({ roomId: selectedRoom.id, text: test });
  });
  //   });
};
